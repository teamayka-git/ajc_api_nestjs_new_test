import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';
import { TestChargersMasters } from 'src/tableModels/testChargeMasters.model';
import { ListFilterLocadingTestChargeDto, TestChargeMastersCreateDto, TestChargeMastersEditDto, TestChargeMastersListDto, TestChargeMastersStatusChangeDto } from './testChargeMasters.dto';

@Injectable()
export class TestChargeMastersService {


    constructor(
        @InjectModel(ModelNames.TEST_CHARGE_MASTERS) private readonly testChargeMastersModel: mongoose.Model<TestChargersMasters>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: TestChargeMastersCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayToStates = [];
    
        dto.array.map((mapItem) => {
          arrayToStates.push({
            _groupId:mapItem.groupId,
            _charge:mapItem.charge,
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.testChargeMastersModel.insertMany(arrayToStates, {
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
    
      async edit(dto: TestChargeMastersEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var result = await this.testChargeMastersModel.findOneAndUpdate(
          {
            _id: dto.testChargeMastersId,
          },
          {
            $set: {
                _groupId:dto.groupId,
                _charge:dto.charge,
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
    
      async status_change(dto: TestChargeMastersStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var result = await this.testChargeMastersModel.updateMany(
          {
            _id: { $in: dto.testChargeMastersIds },
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
    
      async list(dto: TestChargeMastersListDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayAggregation = [];
      
    
    
        if (dto.testChargeMastersIds.length > 0) {
          var newSettingsId = [];
          dto.testChargeMastersIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
        switch(dto.sortType){
          case 0: arrayAggregation.push({ $sort: { _id: dto.sortOrder } });              break;
          case 1:arrayAggregation.push({ $sort: { _status: dto.sortOrder } });               break;
          case 2: arrayAggregation.push({ $sort: { _charge: dto.sortOrder } });               break;
          
        }
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }
        if (dto.screenType.includes( 100) ) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.GROUP_MASTERS,
                  let: { groupId: '$_groupId' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$groupId'] } } }],
                  as: 'groupDetails',
                },
              },
              {
                $unwind: { path: '$groupDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
    
        var result = await this.testChargeMastersModel
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
          arrayAggregation.push({ $group: { _id: null, totalCount: { $sum: 1 } } });
    
          var resultTotalCount = await this.testChargeMastersModel
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

      async listFilterLoadingTestCharge(dto: ListFilterLocadingTestChargeDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
     

       arrayAggregation.push({ $group: { _id: '$_groupId' } });

        
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }


        if (dto.screenType.includes( 100)) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.GROUP_MASTERS,
                  let: { groupId: '$_id' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$groupId'] } } }],
                  as: 'groupDetails',
                },
              },
              {
                $unwind: { path: '$groupDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
    
    
        var result = await this.testChargeMastersModel
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
          arrayAggregation.push({ $group: { _id: null, totalCount: { $sum: 1 } } });
    
          var resultTotalCount = await this.testChargeMastersModel
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
