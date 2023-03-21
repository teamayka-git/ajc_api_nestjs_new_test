import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';
import { RateCardPercentages } from 'src/tableModels/rateCardPercentages.model';
import { RateCards } from 'src/tableModels/rateCards.model';
import {
  RateCardCreateDto,
  RateCardEditDto,
  RateCardListDto,
  RateCardStatusChangeDto,
  RemovePercentagesDto,
  TempMigrateCurrentRatecardDto,
} from './rate_card.dto';

@Injectable()
export class RateCardService {
  constructor(
    @InjectModel(ModelNames.RATE_CARDS)
    private readonly rateCardsModel: mongoose.Model<RateCards>,
    @InjectModel(ModelNames.RATE_CARD_PERCENTAGESS)
    private readonly rateCardPercentagessModel: mongoose.Model<RateCardPercentages>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: RateCardCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];

      const rateCardModel = new this.rateCardsModel({
        _name: dto.rateCardName,
        _type: dto.type,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });
      var result1 = await rateCardModel.save({ session: transactionSession });

      dto.array.map((mapItem) => {
        arrayToStates.push({
          _rateCardId: result1._id,
          _subCategoryId: mapItem.subCategoryId,
          _percentage: mapItem.percentage,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      var result11 = await this.rateCardPercentagessModel.insertMany(
        arrayToStates,
        {
          session: transactionSession,
        },
      );

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

  async edit(dto: RateCardEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.rateCardsModel.findOneAndUpdate(
        {
          _id: dto.rateCardId,
        },
        {
          $set: {
            _name: dto.rateCardName,
            _type: dto.type,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );

      var arrayToStates = [];

      dto.arrayAdd.map((mapItem) => {
        arrayToStates.push({
          _rateCardId: dto.rateCardId,
          _subCategoryId: mapItem.subCategoryId,
          _percentage: mapItem.percentage,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      var result11 = await this.rateCardPercentagessModel.insertMany(
        arrayToStates,
        {
          session: transactionSession,
        },
      );

      for (var i = 0; i < dto.arrayUpdate.length; i++) {
        await this.rateCardPercentagessModel.findOneAndUpdate(
          {
            _id: dto.arrayUpdate[i].ratecardPercentageId,
          },
          {
            $set: {
              _percentage: dto.arrayUpdate[i].percentage,
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
            },
          },
          { new: true, session: transactionSession },
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

  async remove_percentages(dto: RemovePercentagesDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      await this.rateCardPercentagessModel.updateMany(
        {
          _id: { $in: dto.removePercentageIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _status: 2,
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

  async status_change(dto: RateCardStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.rateCardsModel.updateMany(
        {
          _id: { $in: dto.rateCardIds },
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
  async list(dto: RateCardListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.rateCardIds.length > 0) {
        var newSettingsId = [];
        dto.rateCardIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }
      if (dto.type.length > 0) {
        arrayAggregation.push({ $match: { _type: { $in: dto.type } } });
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
            $sort: { _name: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.includes(100)) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.RATE_CARD_PERCENTAGESS,
            let: { rateCardId: '$_id' },
            pipeline: [
              {
                $match: { $expr: { $eq: ['$_rateCardId', '$$rateCardId'] } },
              },

              {
                $lookup: {
                  from: ModelNames.SUB_CATEGORIES,
                  let: { subCategoryId: '$_subCategoryId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$subCategoryId'] } },
                    },
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
            ],
            as: 'rateCardPercentageList',
          },
        });
      }

      var result = await this.rateCardsModel
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

        var resultTotalCount = await this.rateCardsModel
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

  async temp_migrateCurrentRatecardToPurchaseType(
    dto: TempMigrateCurrentRatecardDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultRatecard = await this.rateCardsModel.aggregate([
        // { $skip: dto.skip },
        // { $limit: dto.limit },
        {
          $lookup: {
            from: ModelNames.RATE_CARD_PERCENTAGESS,
            let: { invId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_rateCardId', '$$invId'] },
                },
              },
            ],
            as: 'percentageItems',
          },
        },
      ]);

      var arrayRatecard = [];
      var arrayRatecardPercentages = [];

      for (var i = 0; i < resultRatecard.length; i++) {
        if (resultRatecard[i].percentageItems.length == 0) {
          throw new HttpException(
            'percentage items empty ' + i,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        var ratecardId = new mongoose.Types.ObjectId();

        arrayRatecard.push({
          _id: ratecardId,
          _name: resultRatecard[i]._name,
          _type: 1,
          _createdUserId: resultRatecard[i]._createdUserId,
          _createdAt: resultRatecard[i]._createdAt,
          _updatedUserId: resultRatecard[i]._updatedUserId,
          _updatedAt: resultRatecard[i]._updatedAt,
          _status: resultRatecard[i]._status,
        });
        resultRatecard[i].percentageItems.forEach((elementPercentage) => {
          arrayRatecardPercentages.push({
            _rateCardId: ratecardId,
            _subCategoryId: elementPercentage._subCategoryId,
            _percentage: elementPercentage._percentage,
            _createdUserId: elementPercentage._createdUserId,
            _createdAt: elementPercentage._createdAt,
            _updatedUserId: elementPercentage._updatedUserId,
            _updatedAt: elementPercentage._updatedAt,
            _status: elementPercentage._status,
          });
        });

        console.log(
          '_____doing ' +
            i +
            '   items ' +
            resultRatecard[i].percentageItems.length,
        );
      }
      await this.rateCardsModel.insertMany(arrayRatecard, {
        session: transactionSession,
      });
      await this.rateCardPercentagessModel.insertMany(
        arrayRatecardPercentages,
        {
          session: transactionSession,
        },
      );
      /*
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
      );*/

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
}
