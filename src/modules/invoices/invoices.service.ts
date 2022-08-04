import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { Invoices } from 'src/tableModels/invoices.model';
import { InvoiceItems } from 'src/tableModels/invoice_items.model';
import { Counters } from 'src/tableModels/counters.model';
import {
  InvoiceCreateDto,
  InvoiceListDto,
  InvoiceStatusChangeDto,
} from './invoices.dto';
import { GlobalConfig } from 'src/config/global_config';
import { DeliveryTemp } from 'src/tableModels/delivery_temp.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { Generals } from 'src/tableModels/generals.model';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: mongoose.Model<OrderSaleHistories>,
    @InjectModel(ModelNames.DELIVERY_TEMP)
    private readonly deliveryTempModel: mongoose.Model<DeliveryTemp>,
    @InjectModel(ModelNames.INVOICES)
    private readonly invoiceModel: mongoose.Model<Invoices>,
    @InjectModel(ModelNames.INVOICE_ITEMS)
    private readonly invoiceItemsModel: mongoose.Model<InvoiceItems>,
    @InjectModel(ModelNames.GENERALS)
    private readonly generalsModel: mongoose.Model<Generals>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleMainModel: mongoose.Model<OrderSalesMain>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: InvoiceCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToDeliveryChallan = [];
      var arrayToDeliveryChallanItems = [];
      var orderIds = [];
      var invoiceLocalIds = [];
      var arrayToDeliveryTemp = [];
      var arraySalesOrderHistories = [];

      dto.invoices.map((mapItem) => {
        invoiceLocalIds.push(mapItem.localId);
      });

      let generalList = await this.generalsModel.aggregate([
        {
          $match: {
            _code: 1023,
          },
        },
      ]);
      if (generalList.length == 0) {
        throw new HttpException(
          'Invoice prefix not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let invoiceListLocalItems = await this.invoiceModel.find({
        _localId: { $in: invoiceLocalIds },
      });
      if (invoiceListLocalItems.length != 0) {
        throw new HttpException(
          'Invoice already existing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.INVOICES },
        {
          $inc: {
            _count: dto.invoices.length,
          },
        },
        { new: true, session: transactionSession },
      );

      dto.invoices.map((mapItem, index) => {
        var invoiceId = new mongoose.Types.ObjectId();
        arrayToDeliveryChallan.push({
          _id: invoiceId,
          _userId: _userId_,
          _uid:
            generalList[0]._string +
            (resultCounterPurchase._count - dto.invoices.length + (index + 1)),
          _halmarkingCharge: mapItem.halmarkingCharge,
          _otherCharge: mapItem.otherCharge,
          _roundOff: mapItem.roundOff,
          _netTotal: mapItem.netTotal,
          _isDelivered: 0,
          _tdsReceivable: mapItem.tdsReceivable,
          _tdsPayable: mapItem.tdsPayable,
          _netReceivableAmount: mapItem.netReceivableAmount,
          _cgstHalmarkCharge: mapItem.cgstHalmarkCharge,
          _cgstOtherCharge: mapItem.cgstOtherCharge,
          _sgstHalmarkCharge: mapItem.sgstHalmarkCharge,
          _sgstOtherCharge: mapItem.sgstOtherCharge,
          _igstHalmarkCharge: mapItem.igstHalmarkCharge,
          _igstOtherCharge: mapItem.igstOtherCharge,
          _rootCauseId: null,
          _description: mapItem.description,
          _billMode: mapItem.billMode,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        mapItem.arrayInvoiceItems.map((mapItem1) => {
          orderIds.push(mapItem1.orderId);
          arrayToDeliveryChallanItems.push({
            _invoiceId: invoiceId,
            _orderSaleItemId: mapItem1.orderSaleItemId,
            _orderUid: mapItem1.orderUid,
            _categoryName: mapItem1.categoryName,
            _subCategoryName: mapItem1.subCategoryName,
            _productName: mapItem1.productName,
            _purity: mapItem1.purity,
            _hsnCode: mapItem1.hsnCode,
            _huid: mapItem1.huid,
            _grossWeight: mapItem1.grossWeight,
            _stoneWeight: mapItem1.stoneWeight,
            _netWeight: mapItem1.netWeight,
            _touch: mapItem1.touch,
            _grossAmount: mapItem1.grossAmount,
            _subCategoryId: mapItem1.subCategoryId,
            _makingChargeGst: mapItem1.makingChargeGst,
            _pureWeight: mapItem1.pureWeight,
            _pureWeightHundredPercentage: mapItem1.pureWeightHundredPercentage,
            _unitRate: mapItem1.unitRate,
            _amount: mapItem1.amount,
            _stoneAmount: mapItem1.stoneAmount,
            _totalValue: mapItem1.totalValue,
            _cgst: mapItem1.cgst,
            _sgst: mapItem1.sgst,
            _igst: mapItem1.igst,
            _metalAmountGst: mapItem1.metalAmountGst,
            _stoneAmountGst: mapItem1.stoneAmount,

            _makingChargeWeightHundredPercentage:
              mapItem1.makingChargeWithHundredPercentage,
            _makingChargeAmount: mapItem1.makingChargeAmount,
            _productBarcode: mapItem1.productBarcode,
            _productId:
              mapItem1.productId == '' || mapItem1.productId == 'nil'
                ? null
                : mapItem1.productId,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
          arraySalesOrderHistories.push({
            _orderSaleId: mapItem1.orderId,
            _userId: null,
            _type: 17,
            _orderSaleItemId: null,
            _shopId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
          arraySalesOrderHistories.push({
            _orderSaleId: mapItem1.orderId,
            _userId: null,
            _type: 106,
            _shopId: null,
            _orderSaleItemId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });

        arrayToDeliveryTemp.push({
          _type: -1,
          _invoiceId: invoiceId,
          _employeeId: null,
          _hubId: null,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      await this.orderSaleMainModel.updateMany(
        { _id: { $in: orderIds } },
        { $set: { _isInvoiceGenerated: 1, _workStatus: 17 } },
        { new: true, session: transactionSession },
      );

      await this.orderSaleHistoriesModel.insertMany(arraySalesOrderHistories, {
        session: transactionSession,
      });

      await this.deliveryTempModel.insertMany(arrayToDeliveryTemp, {
        session: transactionSession,
      });

      var result1 = await this.invoiceModel.insertMany(arrayToDeliveryChallan, {
        session: transactionSession,
      });
      await this.invoiceItemsModel.insertMany(arrayToDeliveryChallanItems, {
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

  async deliveryChallanStatusChange(
    dto: InvoiceStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.invoiceModel.updateMany(
        {
          _id: { $in: dto.invoiceIds },
        },
        {
          $set: {
            _rootCauseId:
              dto.rootCauseId == '' || dto.rootCauseId == 'nil'
                ? null
                : dto.rootCauseId,
            _description:
              dto.description == '' || dto.description == 'nil'
                ? null
                : dto.description,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _status: dto.status,
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

  async list(dto: InvoiceListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [
              { _description: new RegExp(dto.searchingText, 'i') },
              { _uid: dto.searchingText },
              { _referenceUrl: dto.searchingText },
            ],
          },
        });
      }
      if (dto.invoiceIds.length > 0) {
        var newSettingsId = [];
        dto.invoiceIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
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
      if (dto.shopIds.length > 0) {
        var newSettingsId = [];
        dto.shopIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _shopId: { $in: newSettingsId } },
        });
      }
      if (dto.createdUserIds.length > 0) {
        var newSettingsId = [];
        dto.createdUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _createdUserId: { $in: newSettingsId } },
        });
      }
      if (dto.userIds.length > 0) {
        var newSettingsId = [];
        dto.userIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _userId: { $in: newSettingsId } } });
      }

      if (dto.billMode.length > 0) {
        arrayAggregation.push({
          $match: { _billMode: { $in: dto.billMode } },
        });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      if (dto.orderHeadIds.length != 0 || dto.cityIds.length != 0) {
        var arrayCityIdsMongo = [];
        var arrayOrderHeadIdsMongo = [];
        dto.cityIds.forEach((eachItem) => {
          arrayCityIdsMongo.push(new mongoose.Types.ObjectId(eachItem));
        });
        dto.orderHeadIds.forEach((eachItem) => {
          arrayOrderHeadIdsMongo.push(new mongoose.Types.ObjectId(eachItem));
        });

        const shopCheckMongoPipeline = () => {
          const pipeline = [];
          pipeline.push({
            $match: {
              $expr: { $eq: ['$_id', '$$shopId'] },
            },
          });

          if (dto.cityIds.length != 0) {
            pipeline.push({
              $match: {
                _cityId: { $in: arrayCityIdsMongo },
              },
            });
          }
          if (dto.orderHeadIds.length != 0) {
            pipeline.push({
              $match: {
                _orderHeadId: { $in: arrayOrderHeadIdsMongo },
              },
            });
          }

          pipeline.push({ $project: { _id: 1 } });
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: shopCheckMongoPipeline(),
              as: 'shopDetailsForMongoCheckup',
            },
          },
          {
            $unwind: '$shopDetailsForMongoCheckup',
          },
        );
      }

      arrayAggregation.push({ $sort: { _id: -1 } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      if (dto.screenType.includes(100)) {
        const userPipeline = () => {
          const pipeline = [];
          pipeline.push(
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1000,
              dto.responseFormat,
            ),
          );
          const userDetailsGlobalGallery = dto.screenType.includes(107);
          if (userDetailsGlobalGallery) {
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

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_userId' },
              pipeline: userPipeline(),
              as: 'userDetails',
            },
          },
          {
            $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }

      if (dto.screenType.includes(103)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
              let: { rootCauseId: '$_rootCauseId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$rootCauseId'] } },
                },

                new ModelWeightResponseFormat().rootcauseTableResponseFormat(
                  1030,
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

      if (dto.screenType.includes(110)) {
        const shopPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: { $expr: { $eq: ['$_id', '$$shopId'] } },
            },

            new ModelWeightResponseFormat().shopTableResponseFormat(
              1100,
              dto.responseFormat,
            ),
          );
          if (dto.screenType.includes(111)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { shopId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_shopId', '$$shopId'] },

                        _customType:{$in:[5]}

                      },
                    },
                    new ModelWeightResponseFormat().userTableResponseFormat(
                      1110,
                      dto.responseFormat,
                    ),
                  ],
                  as: 'shopUserDetails',
                },
              },
              {
                $unwind: {
                  path: '$shopUserDetails',
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
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: shopPipeline(),
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
      if (dto.screenType.includes(104)) {
        const createdUserPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: { $expr: { $eq: ['$_id', '$$createdUserId'] } },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1040,
              dto.responseFormat,
            ),
          );

          const createdUserGlobalGallery = dto.screenType.includes(108);
          if (createdUserGlobalGallery) {
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
                      108,
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
              let: { createdUserId: '$_createdUserId' },
              pipeline: createdUserPipeline(),
              as: 'createdUserDetails',
            },
          },
          {
            $unwind: {
              path: '$createdUserDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(105)) {
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
              1050,
              dto.responseFormat,
            ),
          );
          const invoiceItemsSubCategory = dto.screenType.includes(109);
          if (invoiceItemsSubCategory) {
            pipeline.push(
              {
                //106
                $lookup: {
                  from: ModelNames.SUB_CATEGORIES,
                  let: { subCategoryId: '$_subCategoryId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$subCategoryId'] } } },

                    new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                      1090,
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

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.INVOICE_ITEMS,
            let: { invoiceId: '$_id' },
            pipeline: invoiceItemsPipeline(),
            as: 'invoiceItems',
          },
        });
      }

      var result = await this.invoiceModel
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

        var resultTotalCount = await this.invoiceModel
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
