import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { RateCardPercentages } from 'src/tableModels/rateCardPercentages.model';
import { RateCards } from 'src/tableModels/rateCards.model';
import { RateCardCreateDto, RateCardEditDto, RateCardListDto, RateCardStatusChangeDto } from './rate_card.dto';

@Injectable()
export class RateCardService {


    constructor(
      @InjectModel(ModelNames.RATE_CARDS) private readonly rateCardsModel: mongoose.Model<RateCards>,
      @InjectModel(ModelNames.RATE_CARD_PERCENTAGESS) private readonly rateCardPercentagessModel: mongoose.Model<RateCardPercentages>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: RateCardCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayToStates = [];


        const rateCardModel = new this.rateCardsModel({
          _name:dto.rateCardName,
          _createdUserId:_userId_,
          _createdAt:  dateTime,
          _updatedUserId: null,
          _updatedAt:  -1,
          _status: 1
      });
      var result1 = await rateCardModel.save({ session: transactionSession });








    
        dto.array.map((mapItem) => {
          arrayToStates.push({
            _rateCardId:result1._id,
            _subCategoryId:mapItem.subCategoryId,
            _percentage:mapItem.percentage,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result11 = await this.rateCardsModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result1 };
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    
      async edit(dto: RateCardEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var result = await this.rateCardsModel.findOneAndUpdate(
          {
            _id: dto.rateCardId,
          },
          {
            $set: {
              _name:dto.rateCardName,
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
            },
          },
          { new: true,session: transactionSession },
        );
    

        var arrayToStates = [];

        dto.arrayAdd.map((mapItem) => {
          arrayToStates.push({
            _rateCardId:dto.rateCardId,
            _subCategoryId:mapItem.subCategoryId,
            _percentage:mapItem.percentage,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result11 = await this.rateCardsModel.insertMany(arrayToStates, {
          session: transactionSession,
        });



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
          { new: true,session: transactionSession },
        );









        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result };
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    
      async status_change(dto: RateCardStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
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
          { new: true,session: transactionSession },
        );
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result };
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
      async list(dto: RateCardListDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
      
        if (dto.rateCardIds.length > 0) {
            var newSettingsId = [];
            dto.rateCardIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
          }
          
    
        switch(dto.sortType){
          case 0: arrayAggregation.push({ $sort: { _id: dto.sortOrder } });              break;
          case 1:arrayAggregation.push({ $sort: { _status: dto.sortOrder } });               break;
          case 2: arrayAggregation.push({ $sort: { _name: dto.sortOrder } });               break;
          
        }
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }






        if (dto.screenType.findIndex((it) => it == 100) != -1) {
          arrayAggregation.push(
            {
              $lookup: {
                from: ModelNames.RATE_CARD_PERCENTAGESS,
                let: { rateCardId: '$_id' },
                pipeline: [
                  {
                    $match: { $expr: { $eq: ['$_rateCardId', '$$rateCardId'] } },
                  },
                ],
                as: 'rateCardPercentageList',
              },
            },
            );
        }








    
        var result = await this.rateCardsModel
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
          arrayAggregation.push({ $group: { _id: null, totalCount: { $sum: 1 } } });
    
          var resultTotalCount = await this.rateCardsModel
            .aggregate(arrayAggregation)
            .session(transactionSession);
          if (resultTotalCount.length > 0) {
            totalCount = resultTotalCount[0].totalCount;
          }
        }
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return {
          message: 'success',
          data: { list: result, totalCount: totalCount },
        };
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }


}
