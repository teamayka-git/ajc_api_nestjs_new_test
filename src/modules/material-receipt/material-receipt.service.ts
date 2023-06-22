import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { MterialReceiptHeads } from 'src/tableModels/material_receipt_heads.model';
import { MterialReceiptItems } from 'src/tableModels/material_receipt_items.model';
import { MterialStocks } from 'src/tableModels/material_stocks.model';
import { MaterialReceiptCreateDto, MaterialReceiptEditDto, MaterialReceiptListDto, MaterialReceiptStatusChangeDto } from './material_receipt.dto';
import { GlobalConfig } from 'src/config/global_config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Counters } from 'src/tableModels/counters.model';
import { Branch } from 'src/tableModels/branch.model';
import { GoldRateTimelines } from 'src/tableModels/gold_rate_timelines.model';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { AccountBranch } from 'src/tableModels/accountBranch.model';

@Injectable()
export class MaterialReceiptService {
  constructor(
    @InjectModel(ModelNames.COUNTERS)
    private readonly countersModel: mongoose.Model<Counters>,
    @InjectModel(ModelNames.MATERIAL_RECEIPT_HEADS)
    private readonly materialReceiptHeadsModel: mongoose.Model<MterialReceiptHeads>,
    @InjectModel(ModelNames.MATERIAL_RECEIPT_ITEMS)
    private readonly materialReceiptItemsModel: mongoose.Model<MterialReceiptItems>,
    @InjectModel(ModelNames.MATERIAL_STOCKS)
    private readonly materialStocksModel: mongoose.Model<MterialStocks>,
    @InjectModel(ModelNames.ACCOUNT_BRANCH)
    private readonly accountBranchModel: mongoose.Model<AccountBranch>,
    @InjectModel(ModelNames.GOLD_RATE_TIMELINES)
    private readonly goldRateTimelineModel: mongoose.Model<GoldRateTimelines>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: MaterialReceiptCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToMaterialReceiptItems = [];
      var arrayToMaterialStocks = [];

      var resultBranch = await this.accountBranchModel.find({ _status: 1 }).limit(1);
      var resultGoldRateTimeline = await this.goldRateTimelineModel
        .find({ _status: 1 })
        .sort({ _id: -1 })
        .limit(1);

      if (resultBranch.length == 0) {
        throw new HttpException(
          'Branch not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (resultGoldRateTimeline.length == 0) {
        throw new HttpException(
          'Gold rate not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var resultCounterMaterialReceipt =
        await this.countersModel.findOneAndUpdate(
          { _tableName: ModelNames.MATERIAL_RECEIPT_HEADS },
          {
            $inc: {
              _count: 1,
            },
          },
          { new: true, session: transactionSession },
        );

      const materialReceiptHeadsModelDb = new this.materialReceiptHeadsModel({
        _shopId: dto.shopId,
        _uid: resultCounterMaterialReceipt._count,
        _remark: dto.remark,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });
      var resultmaterialReceiptHeadsModel =
        await materialReceiptHeadsModelDb.save({
          session: transactionSession,
        });

      dto.array.map((mapItem) => {
        var mterialReceiptItemId = new mongoose.Types.ObjectId();
        arrayToMaterialReceiptItems.push({
          _id: mterialReceiptItemId,
          _materialReceiptId: resultmaterialReceiptHeadsModel._id,
          _groupId: mapItem.groupId,
          _grossWeight: mapItem.grossWeight,
          _stoneWeight: mapItem.stoneWeight,
          _netWeight: mapItem.netWeight,
          _tough: mapItem.tough,
          _pureWeightRB: mapItem.pureWeightRB,
          _pureWeighthundred: mapItem.pureWeightHundred,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
        arrayToMaterialStocks.push({
          _voucherId: resultmaterialReceiptHeadsModel._id,
          _voucherDetailedId: mterialReceiptItemId,
          _voucherType: 8,
          _transactionDate: dateTime,
          _transactionRemark: dto.remark,
          _uidForeign: resultCounterMaterialReceipt._count,
          _userId: dto.shopUserId,
          _transactionSign: 1,
          _pureWeightRB: mapItem.pureWeightRB,
          _pureWeightHundred: mapItem.pureWeightHundred,
          _unitRate: resultGoldRateTimeline[0]._ratePerGram,
          _accountBranchId: resultBranch[0]._id,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      var result1 = await this.materialReceiptItemsModel.insertMany(
        arrayToMaterialReceiptItems,
        {
          session: transactionSession,
        },
      );

      var result2 = await this.materialStocksModel.insertMany(
        arrayToMaterialReceiptItems,
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
  async edit(dto: MaterialReceiptEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToMaterialReceiptItems = [];
      var arrayToMaterialStocks = [];

      var resultBranch = await this.accountBranchModel.find({ _status: 1 }).limit(1);
      var resultGoldRateTimeline = await this.goldRateTimelineModel
        .find({ _status: 1 })
        .sort({ _id: -1 })
        .limit(1);

      if (resultBranch.length == 0) {
        throw new HttpException(
          'Branch not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (resultGoldRateTimeline.length == 0) {
        throw new HttpException(
          'Gold rate not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.materialReceiptHeadsModel.findOneAndUpdate(
        {
          _id: dto.materialReceiptId,
        },
        {
          $set: {
            _shopId: dto.shopId, 
            _remark: dto.remark,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );
      await this.materialReceiptItemsModel.findOneAndUpdate(
        {
          _materialReceiptId: dto.materialReceiptId,
        },
        {
          $set: {

            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _status:2
          },
        },
        { new: true, session: transactionSession },
      );
      await this.materialStocksModel.findOneAndUpdate(
        {
          _voucherId: dto.materialReceiptId,
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _status:2
          },
        },
        { new: true, session: transactionSession },
      );

    

      dto.array.map((mapItem) => {
        var mterialReceiptItemId = new mongoose.Types.ObjectId();
        arrayToMaterialReceiptItems.push({
          _id: mterialReceiptItemId,
          _materialReceiptId: dto.materialReceiptId,
          _groupId: mapItem.groupId,
          _grossWeight: mapItem.grossWeight,
          _stoneWeight: mapItem.stoneWeight,
          _netWeight: mapItem.netWeight,
          _tough: mapItem.tough,
          _pureWeightRB: mapItem.pureWeightRB,
          _pureWeighthundred: mapItem.pureWeightHundred,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
        arrayToMaterialStocks.push({
          _voucherId: dto.materialReceiptId,
          _voucherDetailedId: mterialReceiptItemId,
          _voucherType: 8,
          _transactionDate: dateTime,
          _transactionRemark: dto.remark,
          _uidForeign: dto.uid,
          _userId: dto.shopUserId,
          _transactionSign: 1,
          _pureWeightRB: mapItem.pureWeightRB,
          _pureWeightHundred: mapItem.pureWeightHundred,
          _unitRate: resultGoldRateTimeline[0]._ratePerGram,
          _accountBranchId: resultBranch[0]._id,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      var result1 = await this.materialReceiptItemsModel.insertMany(
        arrayToMaterialReceiptItems,
        {
          session: transactionSession,
        },
      );

      var result2 = await this.materialStocksModel.insertMany(
        arrayToMaterialReceiptItems,
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

  
  async status_change(dto: MaterialReceiptStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.materialReceiptHeadsModel.updateMany(
        {
          _id: { $in: dto.materialReceiptIds },_status:dto.fromStatus
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _status: dto.status,
          },
        },
        { new: true, session: transactionSession },
      );

      await this.materialReceiptItemsModel.updateMany(
        {
          _materialReceiptId: { $in: dto.materialReceiptIds },_status:dto.fromStatus
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _status: dto.status,
          },
        },
        { new: true, session: transactionSession },
      );


      await this.materialStocksModel.updateMany(
        {
          _voucherId: { $in: dto.materialReceiptIds },_status:dto.fromStatus
        },
        {
          $set: {
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

  async list(dto: MaterialReceiptListDto) {
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
              { _uid: dto.searchingText },
              { _remark: new RegExp(dto.searchingText, 'i') },
            ],
          },
        });
      }
      if (dto.materialReceiptIds.length > 0) {
        var newSettingsId = [];
        dto.materialReceiptIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }
      if (dto.shopIds.length > 0) {
        var newSettingsId = [];
        dto.shopIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _shopId: { $in: newSettingsId } } });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      arrayAggregation.push({ $sort: { _id: -1 } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }


      arrayAggregation.push(
        new ModelWeightResponseFormat().materialReceiptHeadsResponseFormat(
          0,
          dto.responseFormat,
        ),
      );
      if ( dto.screenType.includes(100)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.MATERIAL_RECEIPT_ITEMS,
              let: { materialId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_materialReceiptId', '$$materialId'] },
                  },
                },
                new ModelWeightResponseFormat().materialReceiptItemsResponseFormat(
                  1000,
                  dto.responseFormat,
                ),
              ],
              as: 'materialReceiptItems',
            },
          },
          {
            $unwind: {
              path: '$materialReceiptItems',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.materialReceiptHeadsModel
        .aggregate(arrayAggregation)
        .session(transactionSession);

      var totalCount = 0;
      if (dto.screenType.includes( 0)) {
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

        var resultTotalCount = await this.materialReceiptHeadsModel
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
