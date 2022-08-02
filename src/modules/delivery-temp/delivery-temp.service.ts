import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryTemp } from 'src/tableModels/delivery_temp.model';
import * as mongoose from 'mongoose';
import {
  DeliveryTempCreateDto,
  DeliveryTempEmployeeAssignDto,
  DeliveryTempListDto,
} from './delivery_temp.dto';
import { GlobalConfig } from 'src/config/global_config';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';

@Injectable()
export class DeliveryTempService {
  constructor(
    @InjectModel(ModelNames.DELIVERY_TEMP)
    private readonly deliveryTempModel: Model<DeliveryTemp>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: DeliveryTempCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];

      dto.array.map((mapItem) => {
        arrayToStates.push({
          _type: mapItem.type,
          _invoiceId: mapItem.invoiceId,
          _employeeId:
            mapItem.employeeId != '' && mapItem.employeeId != 'nil'
              ? mapItem.employeeId
              : null,
          _hubId:
            mapItem.hubId != '' && mapItem.hubId != 'nil'
              ? mapItem.hubId
              : null,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      var result1 = await this.deliveryTempModel.insertMany(arrayToStates, {
        session: transactionSession,
      });

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

  async employeeAssign(dto: DeliveryTempEmployeeAssignDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.deliveryTempModel.updateMany(
        {
          _id: { $in: dto.deliveryTempIds },
        },
        {
          $set: {
            _type: dto.type,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _employeeId: dto.employeeId,
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

  async list(dto: DeliveryTempListDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];
      var arrayEmployeeIds = [];
      if (dto.deliveryTempIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryTempIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.screenType.includes(105)) {
        arrayEmployeeIds.push(new mongoose.Types.ObjectId(_userId_));
      }
      if (dto.employeeIds.length > 0) {
        dto.employeeIds.map((mapItem) => {
          arrayEmployeeIds.push(new mongoose.Types.ObjectId(mapItem));
        });
      }
      if (arrayEmployeeIds.length > 0) {
        arrayAggregation.push({
          $match: { _employeeId: { $in: arrayEmployeeIds } },
        });
      }
      if (dto.invoiceIds.length > 0) {
        var newSettingsId = [];
        dto.invoiceIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _invoiceId: { $in: newSettingsId } },
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

      if (dto.screenType.includes(100)) {
        arrayAggregation.push({
          $match: { _employeeId: null },
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
          arrayAggregation.push({ $sort: { _code: dto.sortOrder } });
          break;
      }
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      arrayAggregation.push(new ModelWeightResponseFormat().deliveryTempTableResponseFormat(
        0,
        dto.responseFormat,
      ),);
      if (dto.screenType.includes(101)) {
        const employeePipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );
          const employeeGlobalGallery = dto.screenType.includes(106);
          if (employeeGlobalGallery) {
            pipeline.push(
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

                    new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                      1060,
                      dto.responseFormat,
                    ),
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
          }
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_employeeId' },
              pipeline: employeePipeline(),
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
      }

      if (dto.screenType.includes(102)) {
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
                new ModelWeightResponseFormat().deliveryHubTableResponseFormat(
                  1020,
                  dto.responseFormat,
                ),
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
      }

      if (dto.screenType.includes(103)) {
        const invoicePipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$invoiceId'] },
              },
            },

            new ModelWeightResponseFormat().invoiceItemsTableResponseFormat(
              1030,
              dto.responseFormat,
            ),
          );

          const invoiceItemsPipeline = () => {
            const pipeline = [];

            pipeline.push(
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $eq: ['$_invoiceId', '$$invoiceId'],
                  },
                },
              },
              new ModelWeightResponseFormat().invoiceItemsTableResponseFormat(
                1040,
                dto.responseFormat,
              ),
            );

            const invoiceItemsOrdersaleItems = dto.screenType.includes(107);
            if (invoiceItemsOrdersaleItems) {
              const invoiceItemsOrdersaleItemsPipeline = () => {
                const pipeline = [];
                pipeline.push(
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$orderSaleItemId'] },
                    },
                  },
                  new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
                    1070,
                    dto.responseFormat,
                  ),
                );

                const invoiceItemsOrdersaleItemsOrderSaleMain =
                  dto.screenType.includes(108);
                if (invoiceItemsOrdersaleItemsOrderSaleMain) {
                  const invoiceItemsOrdersaleItemsOrderSaleMainPipeline =
                    () => {
                      const pipeline = [];
                      pipeline.push(
                        {
                          $match: {
                            $expr: { $eq: ['$_id', '$$orderId'] },
                          },
                        },
                        new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
                          1080,
                          dto.responseFormat,
                        ),
                      );

                      const invoiceItemsOrdersaleItemsOrderSaleMainShopDetails =
                        dto.screenType.includes(109);
                      if (invoiceItemsOrdersaleItemsOrderSaleMainShopDetails) {
                        pipeline.push(
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
                                new ModelWeightResponseFormat().shopTableResponseFormat(
                                  1090,
                                  dto.responseFormat,
                                ),
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

                        const invoiceItemsOrdersaleItemsOrderSaleMainSubCategoryDetails =
                          dto.screenType.includes(110);
                        if (
                          invoiceItemsOrdersaleItemsOrderSaleMainSubCategoryDetails
                        ) {
                          pipeline.push(
                            {
                              $lookup: {
                                from: ModelNames.SUB_CATEGORIES,
                                let: { subCategoryId: '$_subCategoryId' },
                                pipeline: [
                                  {
                                    $match: {
                                      $expr: {
                                        $eq: ['$_id', '$$subCategoryId'],
                                      },
                                    },
                                  },
                                  new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                                    1100,
                                    dto.responseFormat,
                                  ),
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
                          );
                        }
                      }
                      return pipeline;
                    };

                  pipeline.push(
                    {
                      $lookup: {
                        from: ModelNames.ORDER_SALES_MAIN,
                        let: { orderId: '$_orderSaleId' },
                        pipeline:
                          invoiceItemsOrdersaleItemsOrderSaleMainPipeline(),
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
                }
                return pipeline;
              };

              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.ORDER_SALES_ITEMS,
                    let: { orderSaleItemId: '$_orderSaleItemId' },
                    pipeline: invoiceItemsOrdersaleItemsPipeline(),
                    as: 'ordersaleItemDetails',
                  },
                },
                { 
                  $unwind: {
                    path: '$ordersaleItemDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              );
            }
            return pipeline;
          };
          const invoiceItems = dto.screenType.includes(104);
          if (invoiceItems) {
            pipeline.push({
              $lookup: {
                from: ModelNames.INVOICE_ITEMS,
                let: { invoiceId: '$_id' },
                pipeline: invoiceItemsPipeline(),
                as: 'invoiceItems',
              },
            });
          }
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.INVOICES,
              let: { invoiceId: '$_invoiceId' },
              pipeline: invoicePipeline(),
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
console.log("arrayAggregation  "+JSON.stringify(arrayAggregation));
      var result = await this.deliveryTempModel
        .aggregate(arrayAggregation)
        .session(transactionSession);

      var totalCount = 0;
      if (dto.screenType.includes(0)) {
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

        var resultTotalCount = await this.deliveryTempModel
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
