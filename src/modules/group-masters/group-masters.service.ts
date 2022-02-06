import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GroupMasters } from 'src/tableModels/groupMasters.model';
import { GroupMastersCreateDto, GroupMastersEditDto, GroupMastersListDto, GroupMastersStatusChangeDto } from './group_masters.dto';

@Injectable()
export class GroupMastersService {

    constructor(
        @InjectModel(ModelNames.GROUP_MASTERS) private readonly groupMastersModel: mongoose.Model<GroupMasters>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: GroupMastersCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayToStates = [];
    
        dto.array.map((mapItem) => {
          arrayToStates.push({
            _name:mapItem.name,
            _rawMaterialStatus:mapItem.rawMaterialStatus,
            _hsnCode:mapItem.hsnCode,
            _descriptionArray:mapItem.descriptionArray,
            _meltingPurity:mapItem.meltingPurity,
            _taxPercentage:mapItem.taxPercentage,
            _purity:mapItem.purity,
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.groupMastersModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: { list: result1 } };
      }
    
      async edit(dto: GroupMastersEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.groupMastersModel.findOneAndUpdate(
          {
            _id: dto.groupMasterId,
          },
          {
            $set: {
                _name:dto.name,
                _rawMaterialStatus:dto.rawMaterialStatus,
                _hsnCode:dto.hsnCode,
                _descriptionArray:dto.descriptionArray,
                _meltingPurity:dto.meltingPurity,
                _taxPercentage:dto.taxPercentage,
                _purity:dto.purity,
                _dataGuard:dto.dataGuard,
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
            },
          },
          { new: true, transactionSession },
        );
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result };
      }
    
      async status_change(dto: GroupMastersStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.groupMastersModel.updateMany(
          {
            _id: { $in: dto.groupMasterIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _status: dto.status,
            },
          },
          { new: true, transactionSession },
        );
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result };
      }
    
      async list(dto: GroupMastersListDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
        if (dto.searchingText != '') {
          //todo
          arrayAggregation.push({
            $match: {
              $or: [
                { _name: new RegExp(dto.searchingText, 'i') },
                { _hsnCode: dto.searchingText },
              ],
            },
          });
        }
        if (dto.groupMasterIds.length > 0) {
          var newSettingsId = [];
          dto.groupMasterIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
    

        if (dto.rawMaterialStatus.length > 0) {
            
            arrayAggregation.push({ $match: { _rawMaterialStatus: { $in: dto.rawMaterialStatus } } });
          }
      
  



          switch(dto.sortType){
            case 0: arrayAggregation.push({ $sort: { _id: dto.sortOrder } });              break;
            case 1:arrayAggregation.push({ $sort: { _status: dto.sortOrder } });               break;
            case 2: arrayAggregation.push({ $sort: { _name: dto.sortOrder } });               break;
            case 3: arrayAggregation.push({ $sort: { _rawMaterialStatus: dto.sortOrder } });               break;
            case 4: arrayAggregation.push({ $sort: { _hsnCode: dto.sortOrder } });               break;
            case 5: arrayAggregation.push({ $sort: { _meltingPurity: dto.sortOrder } });               break;
            case 6: arrayAggregation.push({ $sort: { _taxPercentage: dto.sortOrder } });               break;
            case 7: arrayAggregation.push({ $sort: { _purity: dto.sortOrder } });               break;
            
          }
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }
    
        var result = await this.groupMastersModel
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
    
          var resultTotalCount = await this.groupMastersModel
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
      }

}
