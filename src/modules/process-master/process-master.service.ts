import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { ProcessMaster } from 'src/tableModels/processMaster.model';
import { CheckItemExistDto, CheckNameExistDto, ListFilterLocadingProcessMasterDto, ProcessMasterCreateDto, ProcessMasterEditDto, ProcessMasterListDto, ProcessMasterStatusChangeDto } from './process_master.dto';

@Injectable()
export class ProcessMasterService {

    constructor(
        @InjectModel(ModelNames.PROCESS_MASTER) private readonly processMasterModel: mongoose.Model<ProcessMaster>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: ProcessMasterCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayToStates = [];
    
        dto.array.map((mapItem) => {
          arrayToStates.push({
            _name: mapItem.name,
            _code: mapItem.code,
            _parentId:mapItem.parentId=="nil"?null:mapItem.parentId,
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.processMasterModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: { list: result1 } };
      }catch(error){
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    
      async edit(dto: ProcessMasterEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var result = await this.processMasterModel.findOneAndUpdate(
          {
            _id: dto.processMasterId,
          },
          {
            $set: {
                _name: dto.name,
                _code: dto.code,
                _parentId:dto.parentId=="nil"?null:dto.parentId,
                
          _dataGuard:dto.dataGuard,
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
            },
          },
          { new: true, session:transactionSession },
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
    
      async status_change(dto: ProcessMasterStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var result = await this.processMasterModel.updateMany(
          {
            _id: { $in: dto.processMasterIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _status: dto.status,
            },
          },
          { new: true, session:transactionSession },
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
    
      async list(dto: ProcessMasterListDto) {
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
                { _code: dto.searchingText },
              ],
            },
          });
        }
        if (dto.processMasterIds.length > 0) {
          var newSettingsId = [];
          dto.processMasterIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
    
        if (dto.parentIds.length > 0) {
            var newSettingsId = [];
            dto.parentIds.map((mapItem) => {
                if(mapItem=="nil"){
                    newSettingsId.push(null);
            
                }else{
                    newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            
                }
              });
            arrayAggregation.push({ $match: { _parentId: { $in: newSettingsId } } });
          }
      
          switch(dto.sortType){
            case 0: arrayAggregation.push({ $sort: { _id: dto.sortOrder } });              break;
            case 1:arrayAggregation.push({ $sort: { _status: dto.sortOrder } });               break;
            case 2: arrayAggregation.push({ $sort: { _name: dto.sortOrder } });               break;
            case 3: arrayAggregation.push({ $sort: { _code: dto.sortOrder } });               break;
            
          }
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }


        if (dto.screenType.findIndex((it) => it == 100) != -1) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.PROCESS_MASTER,
                  let: { parentId: '$_parentId' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$parentId'] } } }],
                  as: 'parentDetails',
                },
              },
              {
                $unwind: { path: '$parentDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
    
    
        var result = await this.processMasterModel
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
    
          var resultTotalCount = await this.processMasterModel
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




      async listFilterLoadingProcessMaster(dto: ListFilterLocadingProcessMasterDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    try{
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
     

       arrayAggregation.push({ $group: { _id: '$_parentId' } });

        
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }


        if (dto.screenType.findIndex((it) => it == 100) != -1) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.PROCESS_MASTER,
                  let: { processMasterId: '$_id' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$processMasterId'] } } }],
                  as: 'processMasterDetails',
                },
              },
              {
                $unwind: { path: '$processMasterDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
    
    
        var result = await this.processMasterModel
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
    
          var resultTotalCount = await this.processMasterModel
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
    async checkCodeExisting(dto: CheckItemExistDto) {
      var dateTime = new Date().getTime();
      const transactionSession = await this.connection.startSession();
      transactionSession.startTransaction();
      try {
        var resultCount = await this.processMasterModel
          .count({ _code: dto.value })
          .session(transactionSession);
  
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return {
          message: 'success',
          data: { count: resultCount },
        };
      } catch (error) {
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
        var resultCount = await this.processMasterModel
          .count({ _name: dto.value,_status:{$in:[1,0]} })
          .session(transactionSession);
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return {
          message: 'success',
          data: { count: resultCount },
        };
      } catch (error) {
        await transactionSession.abortTransaction();
        await transactionSession.endSession();
        throw error;
      }
    }
    
}
