import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';
import { Bank } from 'src/tableModels/banks.model';
import { BanksCreateDto, BanksEditDto, BanksListDto, BanksStatusChangeDto } from './banks.dto';

@Injectable()
export class BanksService {

    constructor(
        @InjectModel(ModelNames.BANKS) private readonly bankModel: mongoose.Model<Bank>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: BanksCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayToStates = [];
    
        dto.array.map((mapItem) => {


var userId="";
if(mapItem.userId=="nil"){
    userId=_userId_;
}else{
    userId=mapItem.userId;
}


          arrayToStates.push({
            _acNo:mapItem.acNo,
            _ifsc:mapItem.ifsc,
            _acHolderName:mapItem.acHolderName,
            _branchName:mapItem.branchName,
            _userId:userId,
            _type:mapItem.type,
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.bankModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
      
        const responseJSON = { message: 'success', data: { list: result1 } };
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
    
      async edit(dto: BanksEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{


        var userId="";
        if(dto.userId=="nil"){
            userId=_userId_;
        }else{
            userId=dto.userId;
        }

        var result = await this.bankModel.findOneAndUpdate(
          {
            _id: dto.bankId,
          },
          {
            $set: {
                _acNo:dto.acNo,
                _ifsc:dto.ifsc,
                _acHolderName:dto.acHolderName,
                _branchName:dto.branchName,
                _userId:userId,
                _type:dto.type,
              _dataGuard:dto.dataGuard,
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
            },
          },
          { new: true,session: transactionSession },
        );
    
       
      
        const responseJSON = { message: 'success', data: result };
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
    
      async status_change(dto: BanksStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var result = await this.bankModel.updateMany(
          {
            _id: { $in: dto.bankIds },
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
    
      
        const responseJSON = { message: 'success', data: result };
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
    
      async list(dto: BanksListDto) {
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
                { _branchName: new RegExp(dto.searchingText, 'i') },
                { _acNo: new RegExp(dto.searchingText, 'i') },
                { _ifsc: dto.searchingText},
                { _acHolderName: new RegExp(dto.searchingText, 'i') },
              ],
            },
          });
        }
        if (dto.bankIds.length > 0) {
          var newSettingsId = [];
          dto.bankIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
        if (dto.userIds.length > 0) {
          var newSettingsId = [];
          dto.userIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _userId: { $in: newSettingsId } } });
        }
        if (dto.types.length > 0) {
       
          arrayAggregation.push({ $match: { _type: { $in: dto.types } } });
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
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              
                {
                  $lookup: {
                    from: ModelNames.EMPLOYEES,
                    let: { employeeId: '$_employeeId' },
                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$employeeId'] } } }],
                    as: 'employeeDetails',
                  },
                },
                {
                  $unwind: { path: '$employeeDetails', preserveNullAndEmptyArrays: true },
                },{
                  $lookup: {
                    from: ModelNames.AGENTS,
                    let: { agentId: '$_agentId' },
                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$agentId'] } } }],
                    as: 'agentDetails',
                  },
                },
                {
                  $unwind: { path: '$agentDetails', preserveNullAndEmptyArrays: true },
                },{
                  $lookup: {
                    from: ModelNames.SUPPLIERS,
                    let: { supplierId: '$_supplierId' },
                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$supplierId'] } } }],
                    as: 'supplierDetails',
                  },
                },
                {
                  $unwind: { path: '$supplierDetails', preserveNullAndEmptyArrays: true },
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
    
        var result = await this.bankModel
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
    
          var resultTotalCount = await this.bankModel
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
