import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { RateBaseMaster } from 'src/tableModels/rateBaseMasters.model';
import { RateBaseMastersCreateDto, RateBaseMastersEditDto, RateBaseMastersListDto, RateBaseMastersStatusChangeDto } from './rate_base_masters.dto';
import { GlobalConfig } from 'src/config/global_config';

@Injectable()
export class RateBaseMastersService {



    constructor(
        @InjectModel(ModelNames.RATE_BASE_MASTERS) private readonly rateBaseMastersModel: mongoose.Model<RateBaseMaster>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: RateBaseMastersCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayToStates = [];
    
        dto.array.map((mapItem) => {
          arrayToStates.push({
            _name:mapItem.name,
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.rateBaseMastersModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
     
        const responseJSON =    { message: 'success', data: { list: result1 } };
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
    
      async edit(dto: RateBaseMastersEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var result = await this.rateBaseMastersModel.findOneAndUpdate(
          {
            _id: dto.rateBaseMasterId,
          },
          {
            $set: {
                _name:dto.name,
              _dataGuard:dto.dataGuard,
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
            },
          },
          { new: true,session: transactionSession },
        );
    
      
        const responseJSON =    { message: 'success', data: result };
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
    
      async status_change(dto: RateBaseMastersStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var result = await this.rateBaseMastersModel.updateMany(
          {
            _id: { $in: dto.rateBaseMasterIds },
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
    
       
        const responseJSON =    { message: 'success', data: result };
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
      async list(dto: RateBaseMastersListDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayAggregation = [];
     
    
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
        if (dto.rateBaseMasterIds.length > 0) {
            var newSettingsId = [];
            dto.rateBaseMasterIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
          }
          arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
        switch(dto.sortType){
          case 0: arrayAggregation.push({ $sort: { _id: dto.sortOrder } });              break;
          case 1:arrayAggregation.push({ $sort: { _status: dto.sortOrder } });               break;
          case 2: arrayAggregation.push({ $sort: { _name: dto.sortOrder } });               break;
          
        }
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }
    
        var result = await this.rateBaseMastersModel
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
     
          var resultTotalCount = await this.rateBaseMastersModel
            .aggregate(arrayAggregation)
            .session(transactionSession);
          if (resultTotalCount.length > 0) {
            totalCount = resultTotalCount[0].totalCount;
          }
        }
    
       
        const responseJSON =   {
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


}
