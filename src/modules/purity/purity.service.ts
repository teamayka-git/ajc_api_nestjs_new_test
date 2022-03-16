import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';
import { Purity } from 'src/tableModels/purity.model';
import { CheckNameExistDto, PurityCreateDto, PurityEditDto, PurityListDto, PurityStatusChangeDto } from './purity.dto';

@Injectable()
export class PurityService {

    constructor(
        @InjectModel(ModelNames.PURITY) private readonly purityModel: mongoose.Model<Purity>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: PurityCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayToStates = [];
    
        dto.array.map((mapItem) => {
          arrayToStates.push({
            _name: mapItem.name,
            _purity: mapItem.purity,
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.purityModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
        
        const responseJSON =   { message: 'success', data: { list: result1 } };
        if (
          process.env.RESPONSE_RESTRICT == "true" &&
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
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    
      async edit(dto: PurityEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var result = await this.purityModel.findOneAndUpdate(
          {
            _id: dto.purityId,
          },
          {
            $set: {
              _name: dto.name,
              _purity: dto.purity,
              _dataGuard:dto.dataGuard,
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
            },
          },
          { new: true, session:transactionSession },
        );
    
       
        const responseJSON =   { message: 'success', data: result };
        if (
          process.env.RESPONSE_RESTRICT == "true" &&
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
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    
      async status_change(dto: PurityStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var result = await this.purityModel.updateMany(
          {
            _id: { $in: dto.purityIds },
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
    
      
        const responseJSON =   { message: 'success', data: result };
        if (
          process.env.RESPONSE_RESTRICT == "true" &&
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
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    
      async list(dto: PurityListDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
        if (dto.searchingText != '') {
          //todo
          arrayAggregation.push({
            $match: {
              $or: [
                { _name: new RegExp(dto.searchingText, 'i') },
              ],
            },
          });
        }
        if (dto.purityIds.length > 0) {
          var newSettingsId = [];
          dto.purityIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
    
        switch(dto.sortType){
          case 0: arrayAggregation.push({ $sort: { _id: dto.sortOrder } });              break;
          case 1:arrayAggregation.push({ $sort: { _status: dto.sortOrder } });               break;
          case 2: arrayAggregation.push({ $sort: { _name: dto.sortOrder } });               break;
          case 3: arrayAggregation.push({ $sort: { _purity: dto.sortOrder } });               break;
          
        }
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }
    
        var result = await this.purityModel
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
    
          var resultTotalCount = await this.purityModel
            .aggregate(arrayAggregation)
            .session(transactionSession);
          if (resultTotalCount.length > 0) {
            totalCount = resultTotalCount[0].totalCount;
          }
        }
    
        
        const responseJSON =    {
          message: 'success',
          data: { list: result, totalCount: totalCount },
        };
        if (
          process.env.RESPONSE_RESTRICT == "true" &&
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
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
  
    async checkNameExisting(dto: CheckNameExistDto) {
      var dateTime = new Date().getTime();
      const transactionSession = await this.connection.startSession();
      transactionSession.startTransaction();
      try {
        var resultCount = await this.purityModel
          .count({ _name: dto.value,_status:{$in:[1,0]} })
          .session(transactionSession);
    
       
          const responseJSON =    {
            message: 'success',
            data: { count: resultCount },
          };
          if (
            process.env.RESPONSE_RESTRICT == "true" &&
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
