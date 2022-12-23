import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { GlobalConfig } from 'src/config/global_config';
import { Purchases } from 'src/tableModels/purchase.model';
import { Counters } from 'src/tableModels/counters.model';
import { PurchaseOrder } from 'src/tableModels/purchase_order.model';
import { PurchaseCreateDto, PurchaseListDto } from './purchase.dto';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(ModelNames.PURCHASES)
    private readonly purchaseModel: mongoose.Model<Purchases>,
    @InjectModel(ModelNames.PURCHASE_ORDERS)
    private readonly purchaseOrderModel: mongoose.Model<PurchaseOrder>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: PurchaseCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToPurchaseBooking = [];
      var arrayToPurchaseBookingItem = [];

      var resultCounterPurchaseBooking =
        await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.PURCHASE_BOOKINGS },
          {
            $inc: {
              _count: dto.array.length,
            },
          },
          { new: true, session: transactionSession },
        );
var purchaseOrderIds=[];
      dto.array.map((mapItem, index) => {
        var bookingId = new mongoose.Types.ObjectId();
        
        purchaseOrderIds.push(mapItem.purchaseOrderId);
        
        arrayToPurchaseBooking.push({
          _id: bookingId,
          _uid:
            resultCounterPurchaseBooking._count -
            dto.array.length +
            (index + 1),
            _supplierUserId: mapItem.supplierUserId == '' ? null : mapItem.supplierUserId,
          _purchaseOrderId:
            mapItem.purchaseOrderId == '' ? null : mapItem.purchaseOrderId,

          _supplierPurchaseDate: mapItem.supplierPurchaseDate,
          _manufacturePurchaseDate: mapItem.manufacturePurchaseDate,
          _supplierRef: mapItem.supplierRef,
          _otherRemark: mapItem.otherRemark,
          _groupName: mapItem.groupName,
          _estimatedQty: mapItem.estimatedQty,
          _allowedLimitPurchaseAdjustment:
            mapItem.allowedLimitPurchaseAdjustment,
          _actualQty: mapItem.actualQty,
          _unitPrice: mapItem.unitPrice,
          _amount: mapItem.amount,
          _sgst: mapItem.sgst,
          _igst: mapItem.igst,
          _cgst: mapItem.cgst,
          _grossAmount: mapItem.grossAmount,
          _actualAmount: mapItem.actualAmount,
          _bookingAmount: mapItem.bookingAmount,
          _difference: mapItem.difference,

          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      await this.purchaseModel.insertMany(arrayToPurchaseBooking, {
        session: transactionSession,
      });
      await this.purchaseOrderModel.updateMany(
        {
          _id: { $in: purchaseOrderIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _purchaseStatus: 1,
          },
        },
        { new: true, session: transactionSession },
      );
      const responseJSON = { message: 'success', data: {} };
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
  async list(dto: PurchaseListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];
 
      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _uid: new RegExp(dto.searchingText, 'i') },{ _supplierRef: new RegExp(dto.searchingText, 'i') },{ _groupName: new RegExp(dto.searchingText, 'i') }],
          },
        });
      }
      if (dto.purchaseIds.length > 0) {
        var newSettingsId = [];
        dto.purchaseIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.supplierUserIds.length > 0) {
        var newSettingsId = [];
        dto.supplierUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _supplierUserId: { $in: newSettingsId } },
        });
      }
      if (dto.purchaseOrderIds.length > 0) {
        var newSettingsId = [];
        dto.purchaseOrderIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _purchaseOrderId: { $in: newSettingsId } },
        });
      }
      if (dto.uids.length > 0) {
       
        arrayAggregation.push({ $match: { _uid: { $in: dto.uids } } });
      }
    

      if (dto.supplierPurchaseDateStart != -1 || dto.supplierPurchaseDateEnd != -1) {
        if (dto.supplierPurchaseDateStart != -1) {
          arrayAggregation.push({
            $match: { _supplierPurchaseDate: { $gte: dto.supplierPurchaseDateStart } },
          });
        }
        if (dto.supplierPurchaseDateEnd != -1) {
          arrayAggregation.push({
            $match: { _supplierPurchaseDate: { $lte: dto.supplierPurchaseDateEnd } },
          });
        }
      }
      if (dto.manufacturePurchaseDateStart != -1 || dto.manufacturePurchaseDateEnd != -1) {
        if (dto.manufacturePurchaseDateStart != -1) {
          arrayAggregation.push({
            $match: { _manufacturePurchaseDate: { $gte: dto.manufacturePurchaseDateStart } },
          });
        }
        if (dto.manufacturePurchaseDateEnd != -1) {
          arrayAggregation.push({
            $match: { _manufacturePurchaseDate: { $lte: dto.manufacturePurchaseDateEnd } },
          });
        }
      }
      if (dto.amountStart != -1 || dto.amountEnd != -1) {
        if (dto.amountStart != -1) {
          arrayAggregation.push({
            $match: { _amount: { $gte: dto.amountStart } },
          });
        }
        if (dto.amountEnd != -1) {
          arrayAggregation.push({
            $match: { _amount: { $lte: dto.amountEnd } },
          });
        }
      }

      

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({
            $sort: { _status: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 2:
          arrayAggregation.push({
            $sort: {
              _uid: dto.sortOrder,
              _id: dto.sortOrder,
            },
          });

          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      arrayAggregation.push(
        new ModelWeightResponseFormat().purchaseTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      
      if (dto.screenType.includes(100)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SUPPLIERS,
              let: { supplierUserId: '$_supplierUserId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$supplierUserId'] },
                  },
                },
                new ModelWeightResponseFormat().userTableResponseFormat(
                  100,
                  dto.responseFormat,
                ),
              ],
              as: 'supplierUserDetails',
            },
          },
          {
            $unwind: {
              path: '$supplierUserDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(101)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.PURCHASE_ORDERS,
              let: { purchaseOrderId: '$_purchaseOrderId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$purchaseOrderId'] },
                  },
                },
                new ModelWeightResponseFormat().purchaseOrderTableResponseFormat(
                  1010,
                  dto.responseFormat,
                ),
              ],
              as: 'purchaseOrderDetails',
            },
          },
          {
            $unwind: {
              path: '$purchaseOrderDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      var result = await this.purchaseModel
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

        var resultTotalCount = await this.purchaseModel
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
