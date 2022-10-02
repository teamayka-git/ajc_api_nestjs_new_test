import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  DeliveryCounterBundleCreateDto,
  DeliveryCounterModuleWorkStatusChangeDto,
  DeliveryReturnListDto,
} from './delivery-counter_bundle.dto';
import * as mongoose from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { OrderSalesItems } from 'src/tableModels/order_sales_items.model';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { Counters } from 'src/tableModels/counters.model';
import { DeliveryCounterBundleItems } from 'src/tableModels/delivery_counter_bundle_items.model';
import { DeliveryBundles } from 'src/tableModels/delivery_counter_bundles.model';
import { GlobalConfig } from 'src/config/global_config';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
@Injectable()
export class DeliveryCounterBundleService {
  constructor(
    @InjectModel(ModelNames.ORDER_SALES_ITEMS)
    private readonly orderSaleItemsModel: mongoose.Model<OrderSalesItems>,
    @InjectModel(ModelNames.DELIVERY_COUNTER_BUNDLES)
    private readonly deliveryCounterBundlesModel: mongoose.Model<DeliveryBundles>,
    @InjectModel(ModelNames.DELIVERY_COUNTER_BUNDLE_ITEMS)
    private readonly deliveryCounterBundleItemsModel: mongoose.Model<DeliveryCounterBundleItems>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleModel: mongoose.Model<OrderSalesMain>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: mongoose.Model<OrderSaleHistories>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: DeliveryCounterBundleCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultOrderSaleMainCheck = await this.orderSaleModel.find(
        { _workStatus: 6, _id: { $in: dto.orderSaleIds } },
        { _id: 1 },
      );

      if (resultOrderSaleMainCheck.length != dto.orderSaleIds.length) {
        throw new HttpException(
          'Order sale status not mismatch',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var resultCounterDeliveryReturn =
        await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.DELIVERY_COUNTER_BUNDLES },
          {
            $inc: {
              _count: 1,
            },
          },
          { new: true, session: transactionSession },
        );

      var deliveryBundleId = new mongoose.Types.ObjectId();
      const deliveryBundle = new this.deliveryCounterBundlesModel({
        _id: deliveryBundleId,
        _uid: resultCounterDeliveryReturn._count,

        _workStatus: 0,
        _employeeId: _userId_,
        _deliveryCounterId: null,
        _receivedUserId: null,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });
      var result1 = await deliveryBundle.save({
        session: transactionSession,
      });

      var arrayToDeliveryBundleItems = [];
      var arrayOrderSalesIds = [];

      dto.orderSaleIds.map((mapItem) => {
        arrayOrderSalesIds.push(mapItem);

        arrayToDeliveryBundleItems.push({
          _bundleId: deliveryBundleId,
          _orderSaleId: mapItem,

          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      await this.deliveryCounterBundleItemsModel.insertMany(
        arrayToDeliveryBundleItems,
        {
          session: transactionSession,
        },
      );

      await this.orderSaleModel.updateMany(
        {
          _id: { $in: arrayOrderSalesIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _workStatus: 41,
          },
        },
        { new: true, session: transactionSession },
      );

      var arraySalesOrderHistories = [];

      arrayOrderSalesIds.forEach((eachItem) => {
        arraySalesOrderHistories.push({
          _orderSaleId: eachItem,
          _userId: null,
          _type: 41,
          _shopId: null,
          _deliveryCounterId: null,
          _orderSaleItemId: null,
          _deliveryProviderId: null,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      });

      await this.orderSaleHistoriesModel.insertMany(arraySalesOrderHistories, {
        session: transactionSession,
      });

      const responseJSON = { message: 'success', data: result1 };
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

  async changeWorkStatus(
    dto: DeliveryCounterModuleWorkStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var deliveryCounterModuleIdsMongo = [];
      if (dto.deliveryCounterModuleIds.length > 0) {
        dto.deliveryCounterModuleIds.map((mapItem) => {
          deliveryCounterModuleIdsMongo.push(
            new mongoose.Types.ObjectId(mapItem),
          );
        });
      }

      //check qr code scanned at right status
      var getDeliveryItemsForCheck =
        await this.deliveryCounterBundlesModel.aggregate([
          {
            $match: {
              _id: { $in: deliveryCounterModuleIdsMongo },
              _workStatus: dto.fromWorkStatus,
              _status: 1,
            },
          },
          {
            $lookup: {
              from: ModelNames.DELIVERY_COUNTER_BUNDLE_ITEMS,
              let: { bundleId: '$_bundleId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$bundleId'] },
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
              as: 'bundleItems',
            },
          },
        ]);

      if (
        getDeliveryItemsForCheck.length != dto.deliveryCounterModuleIds.length
      ) {
        throw new HttpException(
          'Order wrong status',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      var updateObj = {
        _receivedUserId: dto.receivingUsertoUser,
        _deliveryCounterId: dto.deliveryCounterId,
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
        _workStatus: dto.workStatus,
      };

      if (dto.workStatus == 1) {
        var arrayOrderSaleIds = [];
        var arraySalesOrderHistories = [];
        getDeliveryItemsForCheck.forEach((eachItem) => {
          eachItem.bundleItems.forEach((eachBundlesItem) => {
            arrayOrderSaleIds.push(eachBundlesItem._orderSaleId);

            arraySalesOrderHistories.push({
              _orderSaleId: eachBundlesItem._orderSaleId,
              _userId: null,
              _type: 107,
              _shopId: null,
              _orderSaleItemId: null,
              _description: '',

              _deliveryCounterId: dto.deliveryCounterId,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _status: 1,
            });
            arraySalesOrderHistories.push({
              _orderSaleId: eachBundlesItem._orderSaleId,
              _userId: null,
              _type: 16,
              _shopId: null,
              _orderSaleItemId: null,
              _deliveryCounterId: null,
              _description: '',
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _status: 1,
            });
          });
        });

        await this.orderSaleModel.updateMany(
          {
            _id: { $in: arrayOrderSaleIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _workStatus: 16,
            },
          },
          { new: true, session: transactionSession },
        );

        await this.orderSaleHistoriesModel.insertMany(
          arraySalesOrderHistories,
          {
            session: transactionSession,
          },
        );
      }
      var result = await this.deliveryCounterBundlesModel.updateMany(
        {
          _id: { $in: dto.deliveryCounterModuleIds },
        },
        {
          $set: updateObj,
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
  async list(dto: DeliveryReturnListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];
      var arrayEmployeeIds = [];

      if (dto.deliveryBundleIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryBundleIds.map((mapItem) => {
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

      if (dto.receivedUserIds.length > 0) {
        var newSettingsId = [];
        dto.receivedUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _receivedUserId: { $in: newSettingsId } },
        });
      }

      if (dto.deliveryCounterIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryCounterIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _deliveryCounterId: { $in: newSettingsId } },
        });
      }

      if (dto.workStatus.length > 0) {
        arrayAggregation.push({
          $match: { _workStatus: { $in: dto.workStatus } },
        });
      }
      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _uid: new RegExp(`^${dto.searchingText}$`, 'i') }],
          },
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
          arrayAggregation.push({ $sort: { _uid: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _type: dto.sortOrder } });
          break;
        case 4:
          arrayAggregation.push({ $sort: { _workStatus: dto.sortOrder } });
          break;
      }
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      arrayAggregation.push(
        new ModelWeightResponseFormat().deliveryCounterBundleResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(100)) { 
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { employeeId: '$_employeeId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$employeeId'] },
                  },
                },
                new ModelWeightResponseFormat().userTableResponseFormat(
                  1000,
                  dto.responseFormat,
                ),
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
      }

      if (dto.screenType.includes(101)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.DELIVERY_COUNTERS,
              let: { deliveryCounterId: '$_deliveryCounterId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$deliveryCounterId'] },
                  },
                },
                new ModelWeightResponseFormat().deliveryCounterResponseFormat(
                  1010,
                  dto.responseFormat,
                ),
              ],
              as: 'deliveryCounterDetails',
            },
          },
          {
            $unwind: {
              path: '$deliveryCounterDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(102)) {
        const orderSalePipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$orderSaleId'] },
              },
            },
            new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
              1020,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(103)) {
            const orderSaleItemPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: { $eq: ['$_orderSaleId', '$$salesId'] },
                  },
                },
                new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
                  1030,
                  dto.responseFormat,
                ),
              );

              if (dto.screenType.includes(104)) {
                pipeline.push(
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
                        new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                          1040,
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

              return pipeline;
            };

            pipeline.push({
              $lookup: {
                from: ModelNames.ORDER_SALES_ITEMS,
                let: { salesId: '$_id' },
                pipeline: orderSaleItemPipeline(),
                as: 'orderSaleItemDetails',
              },
            });
          }






          if (dto.screenType.includes(105)) {
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
                        1050,
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
          }


          
          if (dto.screenType.includes(106)) {
            const orderSaleMainDocumentsPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_orderSaleId', '$$orderSaleId'] },
                  },
                },
                new ModelWeightResponseFormat().orderSaleDocumentsTableResponseFormat(
                  1060,
                  dto.responseFormat,
                ),
              );
              if (dto.screenType.includes(107)) {
                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.GLOBAL_GALLERIES,
                      let: { globalGalleryId: '$_globalGalleryId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$globalGalleryId'],
                            },
                          },
                        },
                        new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                          1070,
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

            pipeline.push({
              $lookup: {
                from: ModelNames.ORDER_SALES_DOCUMENTS,
                let: { orderSaleId: '$_id' },
                pipeline: orderSaleMainDocumentsPipeline(),
                as: 'orderSaleDocuments',
              },
            });
          }















          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_MAIN,
              let: { orderSaleId: '$_orderSaleId' },
              pipeline: orderSalePipeline(),
              as: 'orderSaleDetails',
            },
          },
          {
            $unwind: {
              path: '$orderSaleDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }


      
      if (dto.screenType.includes(108)) { 
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { receivedUserId: '$_receivedUserId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$receivedUserId'] },
                  },
                },
                new ModelWeightResponseFormat().userTableResponseFormat(
                  1080,
                  dto.responseFormat,
                ),
              ],
              as: 'receivedUserDetails',
            },
          },
          {
            $unwind: {
              path: '$receivedUserDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.deliveryCounterBundlesModel
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

        var resultTotalCount = await this.deliveryCounterBundlesModel
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
