import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { FactoryStockTransfers } from 'src/tableModels/factory_stock_transfers.model';
import { FactoryStockTransferItem } from 'src/tableModels/factory_stock_transfers_item.model';
import {
  FactoryStockTransferCreateDto,
  FactoryStockTransferListDto,
  FactoryStockTransferStatusChangeDto,
} from './factory_stock_transfer.dto';
import { GlobalConfig } from 'src/config/global_config';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { Counters } from 'src/tableModels/counters.model';
import { BarCodeQrCodePrefix } from 'src/common/barcode_qrcode_prefix';
import { StringUtils } from 'src/utils/string_utils';

@Injectable()
export class FactoryStockTransferService {
  constructor(
    @InjectModel(ModelNames.FACTORY_STOCK_TRANSFERS)
    private readonly factoryStockModel: mongoose.Model<FactoryStockTransfers>,
    @InjectModel(ModelNames.FACTORY_STOCK_TRANSFER_ITEMS)
    private readonly factoryStockItemModel: mongoose.Model<FactoryStockTransferItem>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: FactoryStockTransferCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToPurchaseBooking = [];
      var arrayToPurchaseBookingItem = [];
      var resultCounterFactoryStockTransfer =
        await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.FACTORY_STOCK_TRANSFERS },
          {
            $inc: {
              _count: dto.array.length,
            },
          },
          { new: true, session: transactionSession },
        );
      dto.array.map((mapItem, index) => {
        var bookingId = new mongoose.Types.ObjectId();

        var uid =
          resultCounterFactoryStockTransfer._count -
          dto.array.length +
          (index + 1);

        arrayToPurchaseBooking.push({
          _id: bookingId,
          _factoryId: mapItem.factoryId == '' ? null : mapItem.factoryId,
          _barcode:
            BarCodeQrCodePrefix.FACTORYTRANSFER +
            new StringUtils().intToDigitString(uid, 8),
          _uid: uid,
          _type: mapItem.type,
          
      _reminingGrossWeight:mapItem.reminingGrossWeight,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        mapItem.items.forEach((eachItemItem) => {
          arrayToPurchaseBookingItem.push({
            _factoryStockTransferId: bookingId,
            _grossWeight: eachItemItem.grossWeight,
            _stoneWeight: eachItemItem.stoneWeight,
            _netWeight: eachItemItem.netWeight,
            _purity: eachItemItem.purity,
            _weight_hundred_percentage: eachItemItem.weight_hundred_percentage,
            _description: eachItemItem.description,
            _groupId: eachItemItem.groupId,
            _reminingGrossWeight:eachItemItem.reminingGrossWeight,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      });

      await this.factoryStockModel.insertMany(arrayToPurchaseBooking, {
        session: transactionSession,
      });
      await this.factoryStockItemModel.insertMany(arrayToPurchaseBookingItem, {
        session: transactionSession,
      });

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

  async status_change(
    dto: FactoryStockTransferStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.factoryStockModel.updateMany(
        {
          _id: { $in: dto.factoryStockTransferIds },
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

  async list(dto: FactoryStockTransferListDto) {
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
              { _barcode: new RegExp(dto.searchingText, 'i') },
              { _uid: dto.searchingText },
            ],
          },
        });
      }
      if (dto.factoryStockTransferIds.length > 0) {
        var newSettingsId = [];
        dto.factoryStockTransferIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.factoryIds.length > 0) {
        var newSettingsId = [];
        dto.factoryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _factoryId: { $in: newSettingsId } },
        });
      }

      if (dto.type.length != 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.type } },
        });
      }


if(dto.reminingGrossWeightStart!=-1 || dto.reminingGrossWeightEnd!=-1){
  if(dto.reminingGrossWeightStart!=-1){
    arrayAggregation.push({
      $match: { _reminingGrossWeight: { $gte: dto.reminingGrossWeightStart } },
    });
  } if(dto.reminingGrossWeightEnd!=-1){
    arrayAggregation.push({
      $match: { _reminingGrossWeight: { $lte: dto.reminingGrossWeightEnd } },
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
            $sort: { _type: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      arrayAggregation.push(
        new ModelWeightResponseFormat().factoryStockTransferTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(100)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.FACTORIES,
              let: { factoryId: '$_factoryId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$factoryId'] },
                  },
                },
                new ModelWeightResponseFormat().factoryTableResponseFormat(
                  1000,
                  dto.responseFormat,
                ),
              ],
              as: 'factoryDetails',
            },
          },
          {
            $unwind: {
              path: '$factoryDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(101)) {
        const factoryStockTransferItemsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: {
                  $eq: ['$_factoryStockTransferId', '$$factoryStockId'],
                },
              },
            },
            new ModelWeightResponseFormat().factoryStockTransferItemTableResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(102)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.GROUP_MASTERS,
                  let: { groupId: '$_groupId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$groupId'] },
                      },
                    },
                    new ModelWeightResponseFormat().groupMasterTableResponseFormat(
                      1020,
                      dto.responseFormat,
                    ),
                  ],
                  as: 'groupDetails',
                },
              },
              {
                $unwind: {
                  path: '$groupDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.FACTORY_STOCK_TRANSFER_ITEMS,
            let: { factoryStockId: '$_id' },
            pipeline: factoryStockTransferItemsPipeline(),
            as: 'factoryStockTransfers',
          },
        });
      }

      var result = await this.factoryStockModel
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

        var resultTotalCount = await this.factoryStockModel
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
