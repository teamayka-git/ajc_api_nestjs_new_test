import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Delivery } from 'src/tableModels/delivery.model';
import * as mongoose from 'mongoose';
import {
  DeliveryCreateDto,
  DeliveryEmployeeAssignDto,
  DeliveryListDto,
} from './delivery.dto';
import { GlobalConfig } from 'src/config/global_config';
import { DeliveryTempListDto } from '../delivery-temp/delivery_temp.dto';
import { DeliveryItems } from 'src/tableModels/delivery_items.model';
import { Counters } from 'src/tableModels/counters.model';
import { DeliveryTemp } from 'src/tableModels/delivery_temp.model';
import { ModelWeight } from 'src/model_weight/model_weight';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectModel(ModelNames.DELIVERY)
    private readonly deliveryModel: Model<Delivery>,
    @InjectModel(ModelNames.DELIVERY_TEMP)
    private readonly deliveryTempModel: Model<DeliveryTemp>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: Model<Counters>,
    @InjectModel(ModelNames.DELIVERY_ITEMS)
    private readonly deliveryItemsModel: Model<DeliveryItems>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: DeliveryCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToDelivery = [];
      var arrayToDeliveryItems = [];

      var shopIds = [];
      var deliveryTempIds = [];

      dto.array.map((mapItem) => {
        shopIds.push(mapItem.shopId);
        deliveryTempIds.push(mapItem.deliveryTempId);
      });

      var resultOldDelivery = await this.deliveryModel.find({
        _employeeId:
          dto.employeeId == '' || dto.employeeId == 'nil'
            ? null
            : dto.employeeId,
        _shopId: { $in: shopIds },
        _hubId: dto.hubId == '' || dto.hubId == 'nil' ? null : dto.hubId,
        _type: dto.type,
        _workStatus: 0,
        _status: 1,
      });

      //for generating uid
      var countUid = 0;
      shopIds.map((mapItem) => {
        if (resultOldDelivery.findIndex((it) => it._shopId == mapItem) == -1) {
          ++countUid;
        }
      });

      var resultCounterDelivery = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.DELIVERY },
        {
          $inc: {
            _count: countUid,
          },
        },
        { new: true, session: transactionSession },
      );
      countUid = 0;

      shopIds.map((mapItem) => {
        if (resultOldDelivery.findIndex((it) => it._shopId == mapItem) == -1) {
          arrayToDelivery.push({
            _id: new mongoose.Types.ObjectId(),
            _employeeId: dto.employeeId,
            _uid: resultCounterDelivery._count - countUid,
            _shopId: mapItem,
            _hubId: dto.hubId == '' || dto.hubId == 'nil' ? null : dto.hubId,
            _type: dto.type,
            _workStatus: 0,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });

          ++countUid;
        }
      });

      resultOldDelivery.push(...arrayToDelivery);
      await this.deliveryModel.insertMany(arrayToDelivery, {
        session: transactionSession,
      });

      dto.array.map((mapItem) => {
        var indexChild = resultOldDelivery.findIndex(
          (it) => it._shopId == mapItem.shopId,
        );
        if (indexChild != -1) {
          arrayToDeliveryItems.push({
            _deliveryId: resultOldDelivery[indexChild]._id,
            _orderId:
              mapItem.orderId == '' || mapItem.orderId == 'nil'
                ? null
                : mapItem.orderId,
            _invoiceId:
              mapItem.invoiceId == '' || mapItem.invoiceId == 'nil'
                ? null
                : mapItem.invoiceId,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        }
      });

      var result1 = await this.deliveryItemsModel.insertMany(
        arrayToDeliveryItems,
        {
          session: transactionSession,
        },
      );

      await this.deliveryTempModel.updateMany(
        {
          _id: { $in: deliveryTempIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _status: 0,
          },
        },
        { new: true, session: transactionSession },
      );

      const responseJSON = { message: 'success', data: { list: result1 } };
      if (
        process.env.RESPONSE_RESTRICT == 'true' &&
        JSON.stringify(responseJSON).length >=
          GlobalConfig().RESPONSE_RESTRICT_DEFAULT_COUNT
      ) {
        throw new HttpException(
          GlobalConfig().RESPONSE_RESTRICT_RESPONSE +
            JSON.stringify(responseJSON).length,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async deliveryWorkStatusUpdate(
    dto: DeliveryEmployeeAssignDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.deliveryModel.updateMany(
        {
          _id: { $in: dto.deliveryIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _workStatus: dto.workStatus,
          },
        },
        { new: true, session: transactionSession },
      );

      const responseJSON = { message: 'success', data: result };
      if (
        process.env.RESPONSE_RESTRICT == 'true' &&
        JSON.stringify(responseJSON).length >=
          GlobalConfig().RESPONSE_RESTRICT_DEFAULT_COUNT
      ) {
        throw new HttpException(
          GlobalConfig().RESPONSE_RESTRICT_RESPONSE +
            JSON.stringify(responseJSON).length,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async list(dto: DeliveryListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _uid: dto.searchingText }],
          },
        });
      }

      if (dto.deliveryIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.employeeIds.length > 0) {
        var newSettingsId = [];
        dto.employeeIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _employeeId: { $in: newSettingsId } },
        });
      }
      if (dto.shopIds.length > 0) {
        var newSettingsId = [];
        dto.shopIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _shopId: { $in: newSettingsId } },
        });
      }
      if (dto.hubIds.length > 0) {
        var newSettingsId = [];
        dto.hubIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _hubId: { $in: newSettingsId } },
        });
      }
      if (dto.typeArray.length > 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.typeArray } },
        });
      }
      if (dto.workStatus.length > 0) {
        arrayAggregation.push({
          $match: { _workStatus: { $in: dto.typeArray } },
        });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({ $sort: { _status: dto.sortOrder } });
          break;
        case 2:
          arrayAggregation.push({ $sort: { type: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _uid: dto.sortOrder } });
          break;
        case 4:
          arrayAggregation.push({ $sort: { _workStatus: dto.sortOrder } });
          break;
      }
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.responseFormat.length != 0) {
        if (dto.responseFormat.includes(0)) {
          arrayAggregation.push({
            $project: new ModelWeight().deliveryTableLight(),
          });
        } else if (dto.responseFormat.includes(1)) {
          arrayAggregation.push({
            $project: new ModelWeight().deliveryTableMinimum(),
          });
        } else if (dto.responseFormat.includes(2)) {
          arrayAggregation.push({
            $project: new ModelWeight().deliveryTableMedium(),
          });
        } else if (dto.responseFormat.includes(3)) {
          arrayAggregation.push({
            $project: new ModelWeight().deliveryTableMaximum(),
          });
        }
      }

      if (dto.screenType.includes( 101) ) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_employeeId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$userId'] },
                  },
                },
              ],
              as: 'employeeDetails',
            },
          },
          {
            $unwind: {
              path: '$employeeDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );

        if (dto.responseFormat.length != 0) {
          if (dto.responseFormat.includes(1010)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().userTableLight() },
            );
          } else if (dto.responseFormat.includes(1011)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().userTableMinimum() },
            );
          } else if (dto.responseFormat.includes(1012)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().userTableMedium() },
            );
          } else if (dto.responseFormat.includes(1013)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().userTableMaximum() },
            );
          }
        }

        if (dto.screenType.includes(106) ) {
          arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
            {
              $lookup: {
                from: ModelNames.GLOBAL_GALLERIES,
                let: { globalGalleryId: '$_globalGalleryId' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$globalGalleryId'] },
                    },
                  },
                ],
                as: 'globalGalleryDetails',
              },
            },
            {
              $unwind: {
                path: '$globalGalleryDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
          );

          if (dto.responseFormat.length != 0) {
        
            if (dto.responseFormat.includes(1060)) {
              arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline[
                arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline
                  .length - 2
              ].$lookup.pipeline.push({
                $project: new ModelWeight().globalGalleryTableLight(),
              });
            } else if (dto.responseFormat.includes(1061)) {
              arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline[
                arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline
                  .length - 2
              ].$lookup.pipeline.push({
                $project: new ModelWeight().globalGalleryTableMinimum(),
              });
            } else if (dto.responseFormat.includes(1062)) {
              arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline[
                arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline
                  .length - 2
              ].$lookup.pipeline.push({
                $project: new ModelWeight().globalGalleryTableMedium(),
              });
            } else if (dto.responseFormat.includes(1063)) {
              arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline[
                arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline
                  .length - 2
              ].$lookup.pipeline.push({
                $project: new ModelWeight().globalGalleryTableMaximum(),
              });
            }
          }
        }
      }

      if (dto.screenType.includes( 102) ) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.DELIVERY_HUBS,
              let: { hubId: '$_hubId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$hubId'] },
                  },
                },
              ],
              as: 'hubDetails',
            },
          },
          {
            $unwind: {
              path: '$hubDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
        if (dto.responseFormat.length != 0) {
          if (dto.responseFormat.includes(1020)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryHubTableLight() },
            );
          } else if (dto.responseFormat.includes(1021)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryHubTableMinimum() },
            );
          } else if (dto.responseFormat.includes(1022)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryHubTableMedium() },
            );
          } else if (dto.responseFormat.includes(1023)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryHubTableMaximum() },
            );
          }
        }
      }
      if (dto.screenType.includes( 100) ) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$shopId'] },
                  },
                },
              ],
              as: 'shopDetails',
            },
          },
          {
            $unwind: {
              path: '$shopDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
        if (dto.responseFormat.length != 0) {
          if (dto.responseFormat.includes(1000)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().shopTableLight() },
            );
          } else if (dto.responseFormat.includes(1001)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().shopTableMinimum() },
            );
          } else if (dto.responseFormat.includes(1002)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().shopTableMedium() },
            );
          } else if (dto.responseFormat.includes(1003)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().shopTableMaximum() },
            );
          }
        }
      }

      if (dto.screenType.includes( 103) ) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.DELIVERY_ITEMS,
            let: { deliveryId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_deliveryId', '$$deliveryId'] },
                },
              },
            ],
            as: 'deliveryItems',
          },
        });

        if (dto.responseFormat.length != 0) {
          if (dto.responseFormat.includes(1030)) {
            arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryItemsTableLight() },
            );
          } else if (dto.responseFormat.includes(1031)) {
            arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryItemsTableMinimum() },
            );
          } else if (dto.responseFormat.includes(1032)) {
            arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryItemsTableMedium() },
            );
          } else if (dto.responseFormat.includes(1033)) {
            arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryItemsTableMaximum() },
            );
          }
        }

        if (dto.screenType.includes(104) ) {
          arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline.push(
            {
              $lookup: {
                from: ModelNames.ORDER_SALES,
                let: { orderId: '$_orderId' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$orderId'] },
                    },
                  },

                  {
                    $lookup: {
                      from: ModelNames.SUB_CATEGORIES,
                      let: { subCategoryId: '$_subCategoryId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: { $eq: ['$_id', '$$subCategoryId'] },
                          },
                        },
                        { $project: new ModelWeight().subCategoryTableLight() },
                      ],
                      as: 'subCategoryDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$subCategoryDetails',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'orderDetails',
              },
            },
            {
              $unwind: {
                path: '$orderDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
          );

          if (dto.responseFormat.length != 0) {
            if (dto.responseFormat.includes(1040)) {
              arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline[
                arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline
                  .length - 2
              ].$lookup.pipeline.push({
                $project: new ModelWeight().orderSaleTableLight(),
              });
            } else if (dto.responseFormat.includes(1041)) {
              arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline[
                arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline
                  .length - 2
              ].$lookup.pipeline.push({
                $project: new ModelWeight().orderSaleTableMinimum(),
              });
            } else if (dto.responseFormat.includes(1042)) {
              arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline[
                arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline
                  .length - 2
              ].$lookup.pipeline.push({
                $project: new ModelWeight().orderSaleTableMedium(),
              });
            } else if (dto.responseFormat.includes(1043)) {
              arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline[
                arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline
                  .length - 2
              ].$lookup.pipeline.push({
                $project: new ModelWeight().orderSaleTableMaximum(),
              });
            }
          }
        }

        if (dto.screenType.includes(105) ) {
          arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline.push(
            {
              $lookup: {
                from: ModelNames.INVOICES,
                let: { invoiceId: '$_invoiceId' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$invoiceId'] },
                    },
                  },
                  {$project: new ModelWeight().invoiceTableMedium()},
                  {
                    $lookup: {
                      from: ModelNames.INVOICE_ITEMS,
                      let: { invoiceId: '$_id' },
                      pipeline: [
                        {
                          $match: {
                            _status: 1,
                            $expr: {
                              $eq: ['$_invoiceId', '$$invoiceId'],
                            },
                          },
                        },
                        { $project: new ModelWeight().invoiceItemsTableMedium() },
                      ],
                      as: 'invoiceItems',
                    },
                  },
                ],
                as: 'invoiceDetails',
              },
            },
            {
              $unwind: {
                path: '$invoiceDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
          );
       
        }
      }

      var result = await this.deliveryModel
        .aggregate(arrayAggregation)
        .session(transactionSession);

      var totalCount = 0;
      if (dto.screenType.includes( 0) ) {
        //Get total count
        var limitIndexCount = arrayAggregation.findIndex(
          (it) => it.hasOwnProperty('$limit') === true,
        );
        if (limitIndexCount != -1) {
          arrayAggregation.splice(limitIndexCount, 1);
        }
        var skipIndexCount = arrayAggregation.findIndex(
          (it) => it.hasOwnProperty('$skip') === true,
        );
        if (skipIndexCount != -1) {
          arrayAggregation.splice(skipIndexCount, 1);
        }
        arrayAggregation.push({
          $group: { _id: null, totalCount: { $sum: 1 } },
        });

        var resultTotalCount = await this.deliveryModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
        if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
        }
      }
      const responseJSON = {
        message: 'success',
        data: { list: result, totalCount: totalCount },
      };
      if (
        process.env.RESPONSE_RESTRICT == 'true' &&
        JSON.stringify(responseJSON).length >=
          GlobalConfig().RESPONSE_RESTRICT_DEFAULT_COUNT
      ) {
        throw new HttpException(
          GlobalConfig().RESPONSE_RESTRICT_RESPONSE +
            JSON.stringify(responseJSON).length,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }
}
