import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryRejectedPendings } from 'src/tableModels/delivery_rejected_pendings.model';
import * as mongoose from 'mongoose';
import { DeliveryRejectListListDto, DeliveryRejectPendingCreateDto } from './delivery-rejected-pending.dto';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { GlobalConfig } from 'src/config/global_config';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';

@Injectable()
export class DeliveryRejectedPendingService {
  constructor(
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleMainModel: Model<OrderSalesMain>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleMainHistoriesModel: Model<OrderSaleHistories>,
    @InjectModel(ModelNames.DELIVERY_REJECTED_PENDINGS)
    private readonly deliveryRejectedPendingModel: Model<DeliveryRejectedPendings>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}



  async create(dto: DeliveryRejectPendingCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];
      var arrayOrderIds = [];
      var arrayOrderItemIds = [];








      dto.array.map((mapItem) => {
        arrayOrderIds.push(mapItem.salesId);
        arrayOrderItemIds.push(mapItem.salesItemId);
        
        arrayToStates.push({
          _salesItemId:mapItem.salesItemId,
          _salesId:mapItem.salesId,
          _deliveryId:mapItem.deliveryId,
          _invoiceId:mapItem.invoiceId,
          _shopId:mapItem.shopId,
          _rootCauseId:mapItem.rootcauseId,
          _productedBarcode:mapItem.productBarcode,
          _rootCause:mapItem.rootcause,
          _reworkStatus:mapItem.reworkStatus,
          _mistakeType:mapItem.mistakeType,

          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });


  var resultOsCheck= await this.orderSaleMainModel.find({_id:{$in:arrayOrderIds,_workStatus:35}},{_id:1});
if(resultOsCheck.length != dto.array.length){
  throw new HttpException('Order status mismatch', HttpStatus.INTERNAL_SERVER_ERROR);
}









      var result1 = await this.deliveryRejectedPendingModel.insertMany(arrayToStates, {
        session: transactionSession,
      });






      await this.orderSaleMainModel.updateMany(
        {
          _id: { $in: arrayOrderIds },
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

      var arraySalesOrderHistories = [];

      arrayOrderIds.forEach((eachItem,index) => {
        arraySalesOrderHistories.push({
          _orderSaleId: eachItem,
          _userId: null,
          _type: 24,
          _shopId: null,
          _orderSaleItemId: dto.array[index].salesItemId,
          _deliveryProviderId: null,
          _description: `Reason: ${dto.array[index].rootcauseIdName} - ${dto.array[index].rootcause}`,
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
      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }




  async list(dto: DeliveryRejectListListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];
      var arrayEmployeeIds = [];
      if (dto.deliveryRejectedPendingsIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryRejectedPendingsIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.salesItemsIds.length > 0) {
        var newSettingsId = [];
        dto.salesItemsIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _salesItemId: { $in: newSettingsId } },
        });
      }
      if (dto.salesIds.length > 0) {
        var newSettingsId = [];
        dto.salesIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _salesId: { $in: newSettingsId } },
        });
      }
      if (dto.deliveryIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _deliveryId: { $in: newSettingsId } },
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
      if (dto.shopIds.length > 0) {
        var newSettingsId = [];
        dto.shopIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _shopId: { $in: newSettingsId } },
        });
      }
      if (dto.rootCauseIds.length > 0) {
        var newSettingsId = [];
        dto.rootCauseIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _rootCauseId: { $in: newSettingsId } },
        });
      }
      if (dto.reworkStatusArray.length > 0) {
        arrayAggregation.push({
          $match: { _reworkStatus: { $in: dto.reworkStatusArray } },
        });
      }

      if (dto.mistakeTypes.length > 0) {
        arrayAggregation.push({
          $match: { _mistakeType: { $in: dto.mistakeTypes } },
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
          arrayAggregation.push({ $sort: { _shopId: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _mistakeType: dto.sortOrder } });
          break;
        case 4:
          arrayAggregation.push({ $sort: { _reworkStatus: dto.sortOrder } });
          break;
      }
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      arrayAggregation.push(
        new ModelWeightResponseFormat().deliveryRejectedPendingsTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(100)) {
        const orderSaleItemPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$salesItemId'] },
              },
            },
            new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
              1000,
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

        arrayAggregation.push(
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
      if (dto.screenType.includes(101)) {
        const orderSaleMainPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$salesId'] },
              },
            },
            new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(107)) {
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
                  1070,
                  dto.responseFormat,
                ),
              );
              if (dto.screenType.includes(108)) {
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
                          1080,
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

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.ORDER_SALES_DOCUMENTS,
                  let: { orderSaleId: '$_id' },
                  pipeline: orderSaleMainDocumentsPipeline(),
                  as: 'orderSaleDocuments',
                },
              },
              
            );
          }

          return pipeline;
        };

        arrayAggregation.push(
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
      if (dto.screenType.includes(102)) {
        arrayAggregation.push(
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
                  1020,
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
      if (dto.screenType.includes(103)) {
        arrayAggregation.push(
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
                  1030,
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
      if (dto.screenType.includes(104)) {
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
                  1040,
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

      if (dto.screenType.includes(105)) {
        arrayAggregation.push(
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
                  1050,
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

      var result = await this.deliveryRejectedPendingModel
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

        var resultTotalCount = await this.deliveryRejectedPendingModel
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
