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
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { RootCause } from 'aws-sdk/clients/costexplorer';
import { DeliveryRejectedPendings } from 'src/tableModels/delivery_rejected_pendings.model';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';

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
    @InjectModel(ModelNames.DELIVERY_REJECTED_PENDINGS)
    private readonly deliveryRejectPendingModel: Model<DeliveryRejectedPendings>,
    @InjectModel(ModelNames.ROOT_CAUSES)
    private readonly rootCauseModel: Model<RootCause>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleMainModel: Model<OrderSalesMain>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleMainHistoriesModel: Model<OrderSaleHistories>,
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
      var orderSaleIds = [];


console.log("delivery create dto "+JSON.stringify(dto));


      dto.array.map((mapItem) => {

if(shopIds.findIndex((shopFindIndex)=>shopFindIndex==mapItem.shopId)!=-1){
  shopIds.push(mapItem.shopId);
}
        
        deliveryTempIds.push(mapItem.deliveryTempId);
        orderSaleIds.push(...mapItem.orderIds);
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

console.log("shopIds  "+JSON.stringify(shopIds));



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


console.log("arrayToDelivery  "+JSON.stringify(arrayToDelivery));

      
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
            _invoiceId:
              mapItem.invoiceId == '' || mapItem.invoiceId == 'nil'
                ? null
                : mapItem.invoiceId,
            _receivedUserId: null,
            _verifiedUserId: null,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        }
      });


console.log("arrayToDeliveryItems  "+JSON.stringify(arrayToDeliveryItems));


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

      await this.orderSaleMainModel.updateMany(
        {
          _id: { $in: orderSaleIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _workStatus: 21,
          },
        },
        { new: true, session: transactionSession },
      );

      var arraySalesOrderHistories = [];

      orderSaleIds.forEach((eachItem) => {
        arraySalesOrderHistories.push({
          _orderSaleId: eachItem,
          _userId: null,
          _type: 21,
          _shopId: null,
          _orderSaleItemId: null,
          _deliveryProviderId:null,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      });

      await this.orderSaleMainHistoriesModel.insertMany(
        arraySalesOrderHistories,
        {
          session: transactionSession,
        },
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
      // await transactionSession.commitTransaction();
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
      //check qr code scanned at right status
      var getDeliveryItemsForCheck = await this.deliveryModel.find({
        _id: { $in: dto.deliveryIds },
        _workStatus: dto.fromWorkStatus,
        _status: 1,
      });
      if (getDeliveryItemsForCheck.length != dto.deliveryIds.length) {
        throw new HttpException(
          'Delivery wrong status',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var updateObj = {
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
        _workStatus: dto.workStatus,
      };

      if (dto.workStatus == 1) {
        updateObj['_receivedUserId'] = dto.toUser;


        await this.orderSaleMainModel.updateMany(
          {
            _id: { $in: dto.deliveryReceivingOrderSaleIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _workStatus: 22,
            },
          },
          { new: true, session: transactionSession },
        );
  
        var arraySalesOrderHistories = [];
  
        dto.deliveryReceivingOrderSaleIds.forEach((eachItem) => {
          arraySalesOrderHistories.push({
            _orderSaleId: eachItem,
            _userId: dto.toUser,
            _type: 22,
            _shopId: null,
            _orderSaleItemId: null,
            _deliveryProviderId:null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });
  
        await this.orderSaleMainHistoriesModel.insertMany(
          arraySalesOrderHistories,
          {
            session: transactionSession,
          },
        );


      } else if (dto.workStatus == 2) {
        updateObj['_verifiedUserId'] = dto.toUser;

        await this.orderSaleMainModel.updateMany(
          {
            _id: { $in: dto.deliveryCompleteOrderSaleIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _workStatus: 23,
            },
          },
          { new: true, session: transactionSession },
        );
  
        var arraySalesOrderHistories = [];
  
        dto.deliveryCompleteOrderSaleIds.forEach((eachItem) => {
          arraySalesOrderHistories.push({
            _orderSaleId: eachItem,
            _userId: null,
            _type: 23,
            _shopId: null,
            _orderSaleItemId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });
  
       

        if(dto.deliveryCompleteAcceptedOrderSaleIds.length!=0){
          await this.orderSaleMainModel.updateMany(
            {
              _id: { $in:dto.deliveryCompleteAcceptedOrderSaleIds },
            },
            {
              $set: {
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
                _workStatus: 35,
              },
            },
            { new: true, session: transactionSession },
          );
    
    
          dto.deliveryCompleteAcceptedOrderSaleIds.forEach((eachItem) => {
            arraySalesOrderHistories.push({
              _orderSaleId: eachItem,
              _userId: null,
              _type: 35,
              _deliveryProviderId:null,
              _shopId: null,
              _orderSaleItemId: null,
              _description: '',
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _status: 1,
            });
          });
    
         
        }
        await this.orderSaleMainHistoriesModel.insertMany(
          arraySalesOrderHistories,
          {
            session: transactionSession,
          },
        );
      }

      var result = await this.deliveryModel.updateMany(
        {
          _id: { $in: dto.deliveryIds },
        },
        {
          $set: updateObj,
        },
        { new: true, session: transactionSession },
      );
console.log("delivery reject "+JSON.stringify(dto));
      if (dto.deliveryRejectedList.length != 0) {
        var arrayToDeliveryRejectedList = [];
        var arrayToDeliveryRejectedOrderIdsList = [];
        var arraySalesOrderHistories = [];
        dto.deliveryRejectedList.forEach((eachItem) => {
          arrayToDeliveryRejectedOrderIdsList.push(eachItem.salesId);
          arrayToDeliveryRejectedList.push({
            _salesItemId: eachItem.salesItemId,
            _salesId: eachItem.salesId,
            _deliveryId: eachItem.deliveryId,
            _invoiceId: eachItem.invoiceId,

            _productedBarcode: eachItem.productBarcode,
            _shopId: eachItem.shopId,
            _rootCauseId: eachItem.rootCauseId,
            _rootCause: eachItem.rootCause,
            _reworkStatus: eachItem.reWorkStatus,
            _mistakeType: eachItem.mistakeType,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });



          arrayToDeliveryRejectedOrderIdsList.forEach((eachItemChild) => {
            arraySalesOrderHistories.push({
              _orderSaleId: eachItemChild,
              _userId: dto.toUser,
              _type: 24,
              _shopId: null,
              _deliveryProviderId:null,
              _orderSaleItemId: null,
              _description: `Root cause: ${eachItem.rootCauseIdName}\n ${eachItem.rootCause}`,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _status: 1,
            });
          });






        });

        await this.deliveryRejectPendingModel.insertMany(
          arrayToDeliveryRejectedList,
          {
            session: transactionSession,
          },
        );





        await this.orderSaleMainModel.updateMany(
          {
            _id: { $in:arrayToDeliveryRejectedOrderIdsList },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _workStatus: 24,
            },
          },
          { new: true, session: transactionSession },
        );
  
       
  
       
  
        await this.orderSaleMainHistoriesModel.insertMany(
          arraySalesOrderHistories,
          {
            session: transactionSession,
          },
        );






      }

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

      if (dto.receivedUserIds.length > 0) {
        var newSettingsId = [];
        dto.receivedUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _receivedUserId: { $in: newSettingsId } },
        });
      }

      if (dto.verifiedUserIds.length > 0) {
        var newSettingsId = [];
        dto.verifiedUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _verifiedUserId: { $in: newSettingsId } },
        });
      }
      if (dto.typeArray.length > 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.typeArray } },
        });
      }
      if (dto.workStatus.length > 0) {
        arrayAggregation.push({
          $match: { _workStatus: { $in: dto.workStatus } },
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
      arrayAggregation.push(
        new ModelWeightResponseFormat().deliveryTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(101)) {
        const employeeDetailsPipeline = () => {
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

          const employeeDetailsGlobalGallery = dto.screenType.includes(106);
          if (employeeDetailsGlobalGallery) {
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
              pipeline: employeeDetailsPipeline(),
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
      if (dto.screenType.includes(100)) {
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

                new ModelWeightResponseFormat().shopTableResponseFormat(
                  1000,
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

      if (dto.screenType.includes(103)) {
        const deliveryItemsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_deliveryId', '$$deliveryId'] },
              },
            },
            new ModelWeightResponseFormat().deliveryItemsTableResponseFormat(
              1030,
              dto.responseFormat,
            ),
          );

          const isorderSaleItemsInvoices = dto.screenType.includes(105);
          if (isorderSaleItemsInvoices) {
            const orderSaleItemsInvoiceListPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$invoiceId'] },
                  },
                },
                new ModelWeightResponseFormat().invoiceTableResponseFormat(
                  1050,
                  dto.responseFormat,
                ),
              );

              const isorderSaleItemsInvoicesDetailsInvoiceItems =
                dto.screenType.includes(108);
              if (isorderSaleItemsInvoicesDetailsInvoiceItems) {
                const isorderSaleItemsInvoicesDetailsInvoiceItemsPipeline =
                  () => {
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
                        1080,
                        dto.responseFormat,
                      ),
                    );

                    const isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItedDetails =
                      dto.screenType.includes(109);
                    if (
                      isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItedDetails
                    ) {
                      const isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItemPipeline =
                        () => {
                          const pipeline = [];
                          pipeline.push(
                            {
                              $match: {
                                $expr: {
                                  $eq: ['$_id', '$$invoiceItemId'],
                                },
                              },
                            },
                            new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
                              1090,
                              dto.responseFormat,
                            ),
                          );

                          const isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItedSubCategoryDetails =
                            dto.screenType.includes(110);
                          if (
                            isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItedSubCategoryDetails
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

                          return pipeline;
                        };
                      pipeline.push(
                        {
                          $lookup: {
                            from: ModelNames.ORDER_SALES_ITEMS,
                            let: { invoiceItemId: '$_orderSaleItemId' },
                            pipeline:
                              isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItemPipeline(),
                            as: 'orderSaleItemDetails',
                          },
                        },
                        {
                          $unwind: {
                            path: '$orderSaleItemDetails',
                            preserveNullAndEmptyArrays: true,
                          },
                        },
                      );
                    }

                    return pipeline;
                  };

                pipeline.push({
                  $lookup: {
                    from: ModelNames.INVOICE_ITEMS,
                    let: { invoiceId: '$_id' },
                    pipeline:
                      isorderSaleItemsInvoicesDetailsInvoiceItemsPipeline(),
                    as: 'invoiceItems',
                  },
                });
              }
              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.INVOICES,
                  let: { invoiceId: '$_invoiceId' },
                  pipeline: orderSaleItemsInvoiceListPipeline(),
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

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.DELIVERY_ITEMS,
            let: { deliveryId: '$_id' },
            pipeline: deliveryItemsPipeline(),
            as: 'deliveryItems',
          },
        });
      }
      console.log('delivery list payload  ' + JSON.stringify(arrayAggregation));
      var result = await this.deliveryModel
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

        var resultTotalCount = await this.deliveryModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
        if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
        }
      }

      var resultDeliveryRejectRootCause = [];
      if (dto.screenType.includes(500)) {
        var aggregateDeliveryReject = [];
        aggregateDeliveryReject.push(
          {
            $match: {
              _type: { $in: [4] },
              _status: 1,
            },
          },
          new ModelWeightResponseFormat().rootcauseTableResponseFormat(
            5000,
            dto.responseFormat,
          ),
        );

        resultDeliveryRejectRootCause = await this.rootCauseModel.aggregate(
          aggregateDeliveryReject,
        );
      }

      const responseJSON = {
        message: 'success',
        data: {
          list: result,
          totalCount: totalCount,
          deliveryRejectRootCause: resultDeliveryRejectRootCause,
        },
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
