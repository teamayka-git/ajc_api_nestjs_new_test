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
import { OrderSales } from 'src/tableModels/order_sales.model';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(ModelNames.INVOICES)
    private readonly invoiceModel: mongoose.Model<Invoices>,
    @InjectModel(ModelNames.INVOICE_ITEMS)
    private readonly invoiceItemsModel: mongoose.Model<InvoiceItems>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectModel(ModelNames.ORDER_SALES)
    private readonly orderSaleModel: mongoose.Model<OrderSales>,
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

      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.DELIVERY_CHALLANS },
        {
          $inc: {
            _count: dto.arrayInvoiceChallan.length,
          },
        },
        { new: true, session: transactionSession },
      );

      dto.arrayInvoiceChallan.map((mapItem, index) => {
        var invoiceId = new mongoose.Types.ObjectId();
        arrayToDeliveryChallan.push({
          _id: invoiceId,
          _userId: _userId_,
          _uid:
            resultCounterPurchase._count -
            dto.arrayInvoiceChallan.length +
            (index + 1),
            _grossAmount: mapItem.grossAmount,
            _halmarkingCharge: mapItem.halmarkingCharge,
            _otherCharge: mapItem.otherCharge,
            _roundOff: mapItem.roundOff,
            _netTotal: mapItem.netTotal,
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
            _orderId: mapItem1.orderId,
            _orderUid:mapItem1.orderUid,
            _categoryName: mapItem1.categoryName,
            _subCategoryName: mapItem1.subCategoryName,
            _productName: mapItem1.productName,
            _purity: mapItem1.purity,
            _hsnCode: mapItem1.hsnCode,
            _huid: mapItem1.huid,
            _grossWeight: mapItem1.grossWeight,
            _stoneWeight: mapItem1.stoneWeight,
            _netWeight: mapItem1.netWeight,
            _tought: mapItem1.tough,
            _pureWeight: mapItem1.pureWeight,
            _pureWeightHundredPercentage: mapItem1.pureWeightHundredPercentage,
            _unitRate: mapItem1.unitRate,
            _amount: mapItem1.amount,
            _stoneAmount: mapItem1.stoneAmount,
            _totalValue: mapItem1.totalValue,
            _cgst: mapItem1.cgst,
            _sgst: mapItem1.sgst,
            _igst: mapItem1.igst,
            _metalAmount: mapItem1.metalAmount,
            _stoneAmountGst: mapItem1.stoneAmount,
        
            _makingChargeWeightHundredPercentage:
              mapItem1.makingChargeWithHundredPercentage,
            _makingChargeAmount: mapItem1.makingChargeAmount,
            _productBarcode: mapItem1.productBarcide,
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
        });
      });

      await this.orderSaleModel.updateMany(
        { _id: { $in: orderIds } },
        { $set: { _isInvoiceGenerated: 1 } },
        { new: true, session: transactionSession },
      );

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
      arrayAggregation.push({ $sort: { _id: -1 } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      if (dto.screenType.findIndex((it) => it == 100) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_userId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },

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
              ],
              as: 'userDetails',
            },
          },
          {
            $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }

      if (dto.screenType.findIndex((it) => it == 103) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
              let: { rootCauseId: '$_rootCauseId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$rootCauseId'] } },
                },
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
      if (dto.screenType.findIndex((it) => it == 104) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { createdUserId: '$_createdUserId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$createdUserId'] } },
                },

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
              ],
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

      if (dto.screenType.findIndex((it) => it == 105) != -1) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.INVOICE_ITEMS,
            let: { deliveryChallanId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $eq: ['$_deliveryChallanId', '$$deliveryChallanId'],
                  },
                },
              },
            ],
            as: 'invoiceItems',
          },
        });
      }
      var result = await this.invoiceItemsModel
        .aggregate(arrayAggregation)
        .session(transactionSession);

      var totalCount = 0;
      if (dto.screenType.findIndex((it) => it == 0) != -1) {
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

        var resultTotalCount = await this.invoiceItemsModel
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
