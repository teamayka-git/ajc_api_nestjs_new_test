import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { DeliveryRejectedPendings } from 'src/tableModels/delivery_rejected_pendings.model';
import { DeliveryReturn } from 'src/tableModels/delivery_return.model';
import { DeliveryReturnItems } from 'src/tableModels/delivery_return_items.model';
import {
  DeliveryRejectWorkStatusChangeDto,
  DeliveryReturnCreateDto,
  DeliveryReturnListDto,
} from './delivery-return.dto';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { GlobalConfig } from 'src/config/global_config';
import { pipe } from 'rxjs';
import { Counters } from 'src/tableModels/counters.model';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { OrderSaleSetProcesses } from 'src/tableModels/order_sale_set_processes.model';

@Injectable()
export class DeliveryReturnService {
  constructor(
    @InjectModel(ModelNames.ORDER_SALE_SET_PROCESSES)
    private readonly orderSaleSetProcessModel: mongoose.Model<OrderSaleSetProcesses>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleModel: mongoose.Model<OrderSalesMain>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: mongoose.Model<OrderSaleHistories>,
    @InjectModel(ModelNames.DELIVERY_REJECTED_PENDINGS)
    private readonly deliveryRejectedPendingModel: mongoose.Model<DeliveryRejectedPendings>,
    @InjectModel(ModelNames.DELIVERY_RETURN)
    private readonly deliveryReturnModel: mongoose.Model<DeliveryReturn>,
    @InjectModel(ModelNames.DELIVERY_RETURN_ITEMS)
    private readonly deliveryReturnItemsModel: mongoose.Model<DeliveryReturnItems>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: DeliveryReturnCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCounterDeliveryReturn =
        await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.DELIVERY_RETURN },
          {
            $inc: {
              _count: 1,
            },
          },
          { new: true, session: transactionSession },
        );

      var deliveryReturnId = new mongoose.Types.ObjectId();
      const deliveryReturn = new this.deliveryReturnModel({
        _id: deliveryReturnId,
        _uid: resultCounterDeliveryReturn._count,
        _type: dto.type,
        _workStatus: dto.workStatus,
        _employeeId:
          dto.employeeId == '' || dto.employeeId == 'nil'
            ? null
            : dto.employeeId,
        _hubId: dto.hubId == '' || dto.hubId == 'nil' ? null : dto.hubId,
        _shopId: dto.shopId == '' || dto.shopId == 'nil' ? null : dto.shopId,
        _receivedUserId: null,
        _createdUserId: null,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });
      var result1 = await deliveryReturn.save({
        session: transactionSession,
      });

      var arrayToDeliveryReturnIds = [];
      var arrayToDeliveryRejectIds = [];
      var arrayOrderSalesIds = [];

      dto.array.map((mapItem) => {
        arrayOrderSalesIds.push(mapItem.orderSaleId);
        arrayToDeliveryRejectIds.push(mapItem.deliveryRejectId);
        arrayToDeliveryReturnIds.push({
          _deliveryReturnId: deliveryReturnId,
          _deliveryRejectPendingId: mapItem.deliveryRejectId,

          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      await this.deliveryRejectedPendingModel.updateMany(
        {
          _id: { $in: arrayToDeliveryRejectIds },
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

      await this.deliveryReturnItemsModel.insertMany(arrayToDeliveryReturnIds, {
        session: transactionSession,
      });

      await this.orderSaleModel.updateMany(
        {
          _id: { $in: arrayOrderSalesIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _workStatus: 25,
          },
        },
        { new: true, session: transactionSession },
      );

      var arraySalesOrderHistories = [];

      arrayOrderSalesIds.forEach((eachItem) => {
        arraySalesOrderHistories.push({
          _orderSaleId: eachItem,
          _userId: null,
          _type: 25,
          _shopId: null,
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
    dto: DeliveryRejectWorkStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {




var deliveryReturnIdsMongo=[];
if (dto.deliveryReturnIds.length > 0) {
  
  dto.deliveryReturnIds.map((mapItem) => {
    deliveryReturnIdsMongo.push(new mongoose.Types.ObjectId(mapItem));
  });

  
}

      //check qr code scanned at right status
      var getDeliveryItemsForCheck = await this.deliveryReturnModel.aggregate([
        {
          $match: {
            _id: { $in: deliveryReturnIdsMongo },
            _workStatus: dto.fromWorkStatus,
            _status: 1,
          },
        },

        {
          $lookup: {
            from: ModelNames.DELIVERY_RETURN_ITEMS,
            let: { returnId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_deliveryReturnId', '$$returnId'] },
                },
              },
              {
                $project: {
                  _deliveryRejectPendingId: 1,
                },
              },

              {
                $lookup: {
                  from: ModelNames.DELIVERY_REJECTED_PENDINGS,
                  let: { delRejPendingId: '$_deliveryRejectPendingId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$delRejPendingId'] },
                      },
                    },
                  ],
                  as: 'deleveryRejectPendingDetails',
                },
              },
              {
                $unwind: {
                  path: '$deleveryRejectPendingDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: 'deliveryReturnItems',
          },
        },
      ]);


      if (getDeliveryItemsForCheck.length != dto.deliveryReturnIds.length) {
        throw new HttpException(
          'Delivery return wrong status',
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

        var arraySalesOrderHistories = [];
        var arrayOrderSaleIdCancelled = [];

        getDeliveryItemsForCheck.forEach((eachItem) => {
          eachItem.deliveryReturnItems.forEach((eachItemChild) => {
            
            arraySalesOrderHistories.push({
              _orderSaleId: eachItemChild.deleveryRejectPendingDetails._salesId,
              _userId: null,
              _type: 34,
              _shopId: null,
              _orderSaleItemId:
                eachItemChild.deleveryRejectPendingDetails._salesItemId,
              _description: '',
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _status: 1,
            });

            if (eachItemChild.deleveryRejectPendingDetails._reworkStatus == 0) {
              arrayOrderSaleIdCancelled.push(
                eachItemChild.deleveryRejectPendingDetails._salesId,
              );
              
              arraySalesOrderHistories.push({
                _orderSaleId:
                  eachItemChild.deleveryRejectPendingDetails._salesId,
                _userId: null,
                _type: 27,
                _shopId: null,
                _orderSaleItemId:
                  eachItemChild.deleveryRejectPendingDetails._salesItemId,
                _description: '',
                _createdUserId: _userId_,
                _createdAt: dateTime,
                _status: 1,
              });
              
            }
          });
          
        });

        if (arrayOrderSaleIdCancelled.length != 0) {
          await this.orderSaleModel.updateMany(
            {
              _id: { $in: arrayOrderSaleIdCancelled },
            },
            {
              $set: {
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
                _workStatus: 27,
              },
            },
            { new: true, session: transactionSession },
          );
        }

        await this.orderSaleHistoriesModel.insertMany(
          arraySalesOrderHistories,
          {
            session: transactionSession,
          },
        );

        /*
        dto.deliveryCompleteOrderSaleIds.forEach((eachItem) => {
          arraySalesOrderHistories.push({
            _orderSaleId: eachItem,
            _userId: null,
            _type: 34,
            _shopId: null,
            _orderSaleItemId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });




        if(dto.deliveryCompleteCancelOrderSaleIds.length!=0){
          await this.orderSaleModel.updateMany(
            {
              _id: { $in: dto.deliveryCompleteCancelOrderSaleIds },
            },
            {
              $set: {
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
                _workStatus: 27,
              },
            },
            { new: true, session: transactionSession },
          );
          dto.deliveryCompleteCancelOrderSaleIds.forEach((eachItem) => {
            arraySalesOrderHistories.push({
              _orderSaleId: eachItem,
              _userId: null,
              _type: 27,
              _shopId: null,
              _orderSaleItemId: null,
              _description: '',
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _status: 1,
            });
          });
        }

        if(dto.deliveryCompleteReworkOrderSaleIds.length!=0){

          await this.orderSaleSetProcessModel.updateMany(
            {
              _orderSaleId: { $in:dto.deliveryCompleteReworkOrderSaleIds },
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

          await this.orderSaleModel.updateMany(
            {
              _id: { $in:dto.deliveryCompleteReworkOrderSaleIds },
            },
            {
              $set: {
                _isReWork:1,
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
                _workStatus: 0,
              },
            },
            { new: true, session: transactionSession },
          );
          dto.deliveryCompleteReworkOrderSaleIds.forEach((eachItem) => {
            arraySalesOrderHistories.push({
              _orderSaleId: eachItem,
              _userId: null,
              _type: 0,
              _shopId: null,
              _orderSaleItemId: null,
              _deliveryProviderId:null,
              _description: 'Rework',
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _status: 1,
            });
          });
        }

*/
      }
      var result = await this.deliveryReturnModel.updateMany(
        {
          _id: { $in: dto.deliveryReturnIds },
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

      if (dto.deliveryReturnids.length > 0) {
        var newSettingsId = [];
        dto.deliveryReturnids.map((mapItem) => {
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

      if (dto.hubIds.length > 0) {
        var newSettingsId = [];
        dto.hubIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _hubId: { $in: newSettingsId } },
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

      if (dto.types.length > 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.types } },
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
        new ModelWeightResponseFormat().deliveryReturnTableResponseFormat(
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
              from: ModelNames.DELIVERY_HUBS,
              let: { deliveryHubId: '$_hubId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$deliveryHubId'] },
                  },
                },
                new ModelWeightResponseFormat().deliveryHubTableResponseFormat(
                  1010,
                  dto.responseFormat,
                ),
              ],
              as: 'deliveryhubDetails',
            },
          },
          {
            $unwind: {
              path: '$deliveryhubDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(102)) {
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
                  1020,
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
        const deliveryReturnItemsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_deliveryReturnId', '$$deliveryReturnId'] },
              },
            },
            new ModelWeightResponseFormat().deliveryReturnItemsTableResponseFormat(
              1030,
              dto.responseFormat,
            ),
          );
          if (dto.screenType.includes(104)) {
            const deliveryRejectPendingsPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$deliveryRejectPendingId'] },
                  },
                },
                new ModelWeightResponseFormat().deliveryRejectedPendingsTableResponseFormat(
                  1040,
                  dto.responseFormat,
                ),
              );

              if (dto.screenType.includes(105)) {
                const orderSaleItemPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$salesItemId'] },
                      },
                    },
                    new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
                      1050,
                      dto.responseFormat,
                    ),
                  );

                  if (dto.screenType.includes(106)) {
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
                              1060,
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
                      let: { salesItemId: '$_salesItemId' },
                      pipeline: orderSaleItemPipeline(),
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

              if (dto.screenType.includes(107)) {
                const orderSaleMainPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$salesId'] },
                      },
                    },
                    new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
                      1070,
                      dto.responseFormat,
                    ),
                  );

                  if (dto.screenType.includes(108)) {
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
                          1080,
                          dto.responseFormat,
                        ),
                      );
                      if (dto.screenType.includes(109)) {
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
                                  1090,
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

                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.ORDER_SALES_MAIN,
                      let: { salesId: '$_salesId' },
                      pipeline: orderSaleMainPipeline(),
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

              if (dto.screenType.includes(110)) {
                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.DELIVERY,
                      let: { deliveryId: '$_deliveryId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: { $eq: ['$_id', '$$deliveryId'] },
                          },
                        },
                        new ModelWeightResponseFormat().deliveryTableResponseFormat(
                          1100,
                          dto.responseFormat,
                        ),
                      ],
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
              if (dto.screenType.includes(111)) {
                pipeline.push(
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
                        new ModelWeightResponseFormat().invoiceTableResponseFormat(
                          1110,
                          dto.responseFormat,
                        ),
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
              if (dto.screenType.includes(112)) {
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
                          112,
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

              if (dto.screenType.includes(113)) {
                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.ROOT_CAUSES,
                      let: { rootCauseId: '$_rootCauseId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: { $eq: ['$_id', '$$rootCauseId'] },
                          },
                        },
                        new ModelWeightResponseFormat().rootcauseTableResponseFormat(
                          1130,
                          dto.responseFormat,
                        ),
                      ],
                      as: 'rootCauseDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$rootCauseDetails',
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
                  from: ModelNames.DELIVERY_REJECTED_PENDINGS,
                  let: { deliveryRejectPendingId: '$_deliveryRejectPendingId' },
                  pipeline: deliveryRejectPendingsPipeline(),
                  as: 'deliveryRejectPendingDetails',
                },
              },
              {
                $unwind: {
                  path: '$deliveryRejectPendingDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.DELIVERY_RETURN_ITEMS,
            let: { deliveryReturnId: '$_id' },
            pipeline: deliveryReturnItemsPipeline(),
            as: 'deliveryReturnItems',
          },
        });
      }

      var result = await this.deliveryReturnModel
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

        var resultTotalCount = await this.deliveryReturnModel
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
