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
import { pipe } from 'rxjs';
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
        _completedTime: 0,
        _workStatus: 0,
        _employeeId: _userId_,
        _deliveryCounterId: dto.deliveryCounterId,
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
              let: { bundleId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_bundleId', '$$bundleId'] },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    _orderSaleId: 1,
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
      console.log(
        'getDeliveryItemsForCheck   ' +
          JSON.stringify(getDeliveryItemsForCheck),
      );

      var updateObj = {
        _receivedUserId:
          dto.receivingUsertoUser == '' || dto.receivingUsertoUser == 'nil'
            ? null
            : dto.receivingUsertoUser,
        _deliveryCounterId: dto.deliveryCounterId,
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
        _workStatus: dto.workStatus,
      };

      if (dto.workStatus == 1) {
        updateObj['_completedTime'] = dateTime;
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
        console.log('__1  ' + JSON.stringify(arrayOrderSaleIds));
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
      } else if (dto.workStatus == 2) {
        var arrayOrderSaleIds = [];
        var arraySalesOrderHistories = [];
        getDeliveryItemsForCheck.forEach((eachItem) => {
          eachItem.bundleItems.forEach((eachBundlesItem) => {
            arrayOrderSaleIds.push(eachBundlesItem._orderSaleId);

            arraySalesOrderHistories.push({
              _orderSaleId: eachBundlesItem._orderSaleId,
              _userId: null,
              _type: 108,
              _shopId: null,
              _orderSaleItemId: null,
              _description: '',

              _deliveryCounterId: dto.deliveryCounterId,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _status: 1,
            });
          });
        });
        console.log('__2  ' + JSON.stringify(arrayOrderSaleIds));

        await this.orderSaleModel.updateMany(
          {
            _id: { $in: arrayOrderSaleIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _workStatus: 6,
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

      var employeeIds = [];
      if (dto.employeeIds.length > 0) {
        dto.employeeIds.map((mapItem) => {
          employeeIds.push(new mongoose.Types.ObjectId(mapItem));
        });
      }
      if (dto.dcbTransferDoneUserIds.length > 0) {
        dto.dcbTransferDoneUserIds.map((mapItem) => {
          employeeIds.push(new mongoose.Types.ObjectId(mapItem));
        });
      }
      if (employeeIds.length != 0) {
        arrayAggregation.push({
          $match: { _employeeId: { $in: employeeIds } },
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

      if (
        dto.deliveryBundleCompletedStartTime != -1 &&
        dto.deliveryBundleCompletedEndTime != -1
      ) {
        arrayAggregation.push({
          $match: {
            _completedTime: {
              $gte: dto.deliveryBundleCompletedStartTime,
              $lte: dto.deliveryBundleCompletedEndTime,
            },
          },
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

      if (dto.dcbCreatedStartDate != -1 && dto.dcbCreatedEndDate != -1) {
        arrayAggregation.push({
          $match: {
            _createdAt: {
              $lte: dto.dcbCreatedEndDate,
              $gte: dto.dcbCreatedStartDate,
            },
          },
        });
      }

      if (
        dto.isInvoiceGenerated.length != 0 ||
        dto.orderSaleUids.length != 0 ||
        dto.orderHeadIds.length != 0 ||
        dto.shopIds.length != 0 ||
        dto.invoiceUids.length != 0 ||
        (dto.invoiceDateStartDate != -1 && dto.invoiceDateEndDate != -1) ||
        (dto.deliveryCompleteEndDate != -1 &&
          dto.deliveryCompleteStartDate != -1)
      ) {
        const dbcItemsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_bundleId', '$$dcbId'] },
              },
            },
            {
              $project: {
                _orderSaleId: 1,
              },
            },
          );

          if (
            dto.isInvoiceGenerated.length != 0 ||
            dto.orderSaleUids.length != 0 ||
            dto.orderHeadIds.length != 0 ||
            dto.shopIds.length != 0 ||
            dto.invoiceUids.length != 0 ||
            (dto.invoiceDateStartDate != -1 && dto.invoiceDateEndDate != -1) ||
            (dto.deliveryCompleteEndDate != -1 &&
              dto.deliveryCompleteStartDate != -1)
          ) {
            const dbcItemsOrderSalePipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$orderSaleId'] },
                  },
                },
                {
                  $project: {
                    _orderHeadId: 1,
                    _uid: 1,
                    _shopId: 1,
                    _isInvoiceGenerated: 1,
                  },
                },
              );
              if (dto.isInvoiceGenerated.length != 0) {
                pipeline.push({
                  $match: {
                    _isInvoiceGenerated: { $in: dto.isInvoiceGenerated },
                  },
                });
              }

              if (dto.orderSaleUids.length != 0) {
                pipeline.push({ $match: { _uid: { $in: dto.orderSaleUids } } });
              }
              if (dto.orderHeadIds.length != 0) {
                pipeline.push({
                  $match: { _orderHeadId: { $in: dto.orderHeadIds } },
                });
              }
              if (dto.shopIds.length != 0) {
                pipeline.push({ $match: { _shopId: { $in: dto.shopIds } } });
              }

              if (
                dto.invoiceUids.length != 0 ||
                (dto.invoiceDateStartDate != -1 &&
                  dto.invoiceDateEndDate != -1) ||
                (dto.deliveryCompleteEndDate != -1 &&
                  dto.deliveryCompleteStartDate != -1)
              ) {
                const dbcItemsOrderSaleorderSaleItemPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        _status: 1,
                        $expr: { $eq: ['$_orderSaleId', '$$osId'] },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                      },
                    },
                  );

                  if (
                    dto.invoiceUids.length != 0 ||
                    (dto.invoiceDateStartDate != -1 &&
                      dto.invoiceDateEndDate != -1) ||
                    (dto.deliveryCompleteEndDate != -1 &&
                      dto.deliveryCompleteStartDate != -1)
                  ) {
                    const dbcItemsOrderSaleorderSaleItemInvItemPipeline =
                      () => {
                        const pipeline = [];
                        pipeline.push(
                          {
                            $match: {
                              _status: 1,
                              $expr: {
                                $eq: ['$_orderSaleItemId', '$$osItemId'],
                              },
                            },
                          },
                          {
                            $project: {
                              _id: 1,
                            },
                          },
                        );

                        if (
                          dto.invoiceUids.length != 0 ||
                          (dto.invoiceDateStartDate != -1 &&
                            dto.invoiceDateEndDate != -1) ||
                          (dto.deliveryCompleteEndDate != -1 &&
                            dto.deliveryCompleteStartDate != -1)
                        ) {
                          const dbcItemsOrderSaleorderSaleItemInvPipeline =
                            () => {
                              const pipeline = [];
                              pipeline.push(
                                {
                                  $match: {
                                    $expr: { $eq: ['$_id', '$$invItemId'] },
                                  },
                                },
                                {
                                  $project: {
                                    _id: 1,
                                    _createdAt: 1,
                                    _uid: 1,
                                  },
                                },
                              );

                              if (dto.invoiceUids.length != 0) {
                                pipeline.push({
                                  $match: {
                                    _uid: { $in: dto.invoiceUids },
                                  },
                                });
                              }
                              if (
                                dto.invoiceDateStartDate != -1 &&
                                dto.invoiceDateEndDate != -1
                              ) {
                                pipeline.push({
                                  $match: {
                                    _createdAt: {
                                      $lte: dto.invoiceDateEndDate,
                                      $gte: dto.invoiceDateStartDate,
                                    },
                                  },
                                });
                              }

                              if (
                                dto.deliveryCompleteEndDate != -1 &&
                                dto.deliveryCompleteStartDate != -1
                              ) {
                                const dbcItemsOrderSaleorderSaleItemInvDelItemPipeline =
                                  () => {
                                    const pipeline = [];
                                    pipeline.push(
                                      {
                                        $match: {
                                          _status: 1,
                                          $expr: {
                                            $eq: ['$_invoiceId', '$$invId'],
                                          },
                                        },
                                      },
                                      {
                                        $project: {
                                          _id: 1,
                                        },
                                      },
                                    );

                                    if (
                                      dto.deliveryCompleteEndDate != -1 &&
                                      dto.deliveryCompleteStartDate != -1
                                    ) {
                                      const dbcItemsOrderSaleorderSaleItemInvDelPipeline =
                                        () => {
                                          const pipeline = [];
                                          pipeline.push(
                                            {
                                              $match: {
                                                $expr: {
                                                  $eq: ['$_id', '$$delId'],
                                                },
                                              },
                                            },
                                            {
                                              $project: {
                                                _deliveryAcceptedAt: 1,
                                              },
                                            },
                                          );

                                          if (
                                            dto.deliveryCompleteEndDate != -1 &&
                                            dto.deliveryCompleteStartDate != -1
                                          ) {
                                            pipeline.push({
                                              $match: {
                                                _deliveryAcceptedAt: {
                                                  $lte: dto.deliveryCompleteEndDate,
                                                  $gte: dto.deliveryCompleteStartDate,
                                                },
                                              },
                                            });
                                          }
                                          return pipeline;
                                        };

                                      pipeline.push(
                                        {
                                          $lookup: {
                                            from: ModelNames.DELIVERY,
                                            let: { delId: '$_deliveryId' },
                                            pipeline:
                                              dbcItemsOrderSaleorderSaleItemInvDelPipeline(),
                                            as: 'delDetailsMongo',
                                          },
                                        },
                                        {
                                          $unwind: {
                                            path: '$delDetailsMongo',
                                          },
                                        },
                                      );
                                    }

                                    return pipeline;
                                  };
                                pipeline.push(
                                  {
                                    $lookup: {
                                      from: ModelNames.DELIVERY_ITEMS,
                                      let: { invId: '$_id' },
                                      pipeline:
                                        dbcItemsOrderSaleorderSaleItemInvDelItemPipeline(),
                                      as: 'delItemDetailsMongo',
                                    },
                                  },
                                  {
                                    $unwind: {
                                      path: '$delItemDetailsMongo',
                                    },
                                  },
                                );
                              }

                              return pipeline;
                            };
                          pipeline.push(
                            {
                              $lookup: {
                                from: ModelNames.INVOICES,
                                let: { invItemId: '$_invoiceId' },
                                pipeline:
                                  dbcItemsOrderSaleorderSaleItemInvPipeline(),
                                as: 'osItemsInvMongo',
                              },
                            },
                            {
                              $unwind: {
                                path: '$osItemsInvMongo',
                              },
                            },
                          );
                        }

                        return pipeline;
                      };

                    pipeline.push(
                      {
                        $lookup: {
                          from: ModelNames.INVOICE_ITEMS,
                          let: { osItemId: '$_id' },
                          pipeline:
                            dbcItemsOrderSaleorderSaleItemInvItemPipeline(),
                          as: 'osItemsInvItemMongo',
                        },
                      },
                      {
                        $unwind: {
                          path: '$osItemsInvItemMongo',
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
                      let: { osId: '$_id' },
                      pipeline: dbcItemsOrderSaleorderSaleItemPipeline(),
                      as: 'osItemsMongo',
                    },
                  },
                  {
                    $match: { osItemsMongo: { $ne: [] } },
                  },
                );
              }

              return pipeline;
            };
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.ORDER_SALES_MAIN,
                  let: { orderSaleId: '$_orderSaleId' },
                  pipeline: dbcItemsOrderSalePipeline(),
                  as: 'orderSaleDetailsMongo',
                },
              },
              {
                $unwind: {
                  path: '$orderSaleDetailsMongo',
                },
              },
            );
          }

          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.DELIVERY_COUNTER_BUNDLE_ITEMS,
              let: { dcbId: '$_id' },
              pipeline: dbcItemsPipeline(),
              as: 'listDcbItemsMongo',
            },
          },
          {
            $match: { listDcbItemsMongo: { $ne: [] } },
          },
        );
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


      arrayAggregation.push(
        new ModelWeightResponseFormat().deliveryCounterBundleResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      console.log("___a1");

      //imp
      if (dto.isInvoiceGenerated.length != 0 ||
        dto.invoiceUids.length != 0 ||
        (dto.invoiceDateEndDate != -1 &&
          dto.invoiceDateStartDate != -1)) {
            console.log("___a2");
        arrayAggregation[arrayAggregation.length - 1].$project.aaa = "$_id";
      }
      console.log("arrayAggregation dbl   "+JSON.stringify(arrayAggregation));

      console.log("___a3");
      
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
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

      if (dto.screenType.includes(110)) {
        const deliveryBundlePipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_bundleId', '$$deliveryBundleId'] },
              },
            },
            new ModelWeightResponseFormat().deliveryCounterBundleItemsResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );

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

                  if (dto.screenType.includes(109)) {
                    pipeline.push(
                      {
                        $lookup: {
                          from: ModelNames.PRODUCTS,
                          let: { productId: '$_productId' },
                          pipeline: [
                            {
                              $match: {
                                $expr: { $eq: ['$_id', '$$productId'] },
                              },
                            },
                            new ModelWeightResponseFormat().productTableResponseFormat(
                              1090,
                              dto.responseFormat,
                            ),
                          ],
                          as: 'productDetails',
                        },
                      },
                      {
                        $unwind: {
                          path: '$productDetails',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                    );
                  }

                  if (dto.screenType.includes(111)) {
                    const invoiceItemPipeline = () => {
                      const pipeline = [];
                      pipeline.push(
                        {
                          $match: {
                            $expr: { $eq: ['$_orderSaleItemId', '$$osItemId'] },
                          },
                        },
                        new ModelWeightResponseFormat().invoiceItemsTableResponseFormat(
                          1110,
                          dto.responseFormat,
                        ),
                      );

                      if (dto.screenType.includes(112)) {
                        const invoicePipeline = () => {
                          const pipeline = [];
                          pipeline.push(
                            {
                              $match: {
                                $expr: { $eq: ['$_id', '$$invItemId'] },
                              },
                            },
                            new ModelWeightResponseFormat().invoiceTableResponseFormat(
                              1120,
                              dto.responseFormat,
                            ),
                          );

                          if (dto.screenType.includes(113)) {
                            const deliveryitemPipeline = () => {
                              const pipeline = [];
                              pipeline.push(
                                {
                                  $match: {
                                    $expr: {
                                      $eq: ['$_invoiceId', '$$invoiceId'],
                                    },
                                  },
                                },
                                new ModelWeightResponseFormat().deliveryItemsTableResponseFormat(
                                  1130,
                                  dto.responseFormat,
                                ),
                              );

                              if (dto.screenType.includes(114)) {
                                const deliveryPipeline = () => {
                                  const pipeline = [];
                                  pipeline.push(
                                    {
                                      $match: {
                                        $expr: {
                                          $eq: ['$_id', '$$deliveryId'],
                                        },
                                      },
                                    },
                                    new ModelWeightResponseFormat().deliveryTableResponseFormat(
                                      1140,
                                      dto.responseFormat,
                                    ),
                                  );

                                  return pipeline;
                                };

                                pipeline.push(
                                  {
                                    $lookup: {
                                      from: ModelNames.DELIVERY,
                                      let: { deliveryId: '$_deliveryId' },
                                      pipeline: deliveryPipeline(),
                                      as: 'deliveryDetails',
                                    },
                                  },
                                  {
                                    $unwind: {
                                      path: '$deliveryDetails',
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
                                  from: ModelNames.DELIVERY_ITEMS,
                                  let: { invoiceId: '$_id' },
                                  pipeline: deliveryitemPipeline(),
                                  as: 'deliveryItemDetails',
                                },
                              },
                              {
                                $unwind: {
                                  path: '$deliveryItemDetails',
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
                              from: ModelNames.INVOICES,
                              let: { invItemId: '$_invoiceId' },
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

                      return pipeline;
                    };

                    pipeline.push(
                      {
                        $lookup: {
                          from: ModelNames.INVOICE_ITEMS,
                          let: { osItemId: '$_id' },
                          pipeline: invoiceItemPipeline(),
                          as: 'invoiceItemDetails',
                        },
                      },
                      {
                        $unwind: {
                          path: '$invoiceItemDetails',
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

              if (dto.screenType.includes(110)) {
                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.USER,
                      let: { ohId: '$_orderHeadId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$ohId'],
                            },
                          },
                        },
                        new ModelWeightResponseFormat().userTableResponseFormat(
                          1100,
                          dto.responseFormat,
                        ),
                      ],
                      as: 'ohDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$ohDetails',
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
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.DELIVERY_COUNTER_BUNDLE_ITEMS,
            let: { deliveryBundleId: '$_id' },
            pipeline: deliveryBundlePipeline(),

            as: 'deliveryCounterItems',
          },
        });
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
