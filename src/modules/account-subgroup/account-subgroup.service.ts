import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { AccountSubgroup } from 'src/tableModels/accountSubgroup.model';
import { AccountSubgroupCreateDto, AccountSubgroupEditDto, AccountSubgroupListDto, AccountSubgroupStatusChangeDto, CheckNameExistDto } from './account-subgroup.dto';

@Injectable()
export class AccountSubgroupService {
    constructor(
        @InjectModel(ModelNames.ACCOUNT_SUBGROUP)
        private readonly accountSubgroupModel: mongoose.Model<AccountSubgroup>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}

    async create(dto: AccountSubgroupCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
          var arrayToStates = [];
    
          dto.array.map((mapItem) => {
            arrayToStates.push({
              _code: mapItem.code,
              _name: mapItem.name,
              _groupId: (mapItem.groupId=="")?null:mapItem.groupId,              
              _subGroupId: (mapItem.subGroup=="")?null:mapItem.subGroup,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
          });
          });
    
          var result1 = await this.accountSubgroupModel.insertMany(arrayToStates, {
            session: transactionSession,
          });
    
          const responseJSON = { message: 'success', data: { list: result1 } };
        
          await transactionSession.commitTransaction();
          await transactionSession.endSession();
          return responseJSON;
        } catch (error) {
          await transactionSession.abortTransaction();
          await transactionSession.endSession();
          throw error;
        }
      }

      async edit(dto: AccountSubgroupEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
          var result = await this.accountSubgroupModel.findOneAndUpdate(
            {
              _id: dto.AccountSubgroupId,
            },
            {
              $set: {
                _code: dto.code,
                _name: dto.name,
                _groupId: dto.groupId,                
                _subGroupId: dto.subGroupId,
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
              },
            },
            { new: true, session: transactionSession },
          );
    
          const responseJSON = { message: 'success', data: result };
          
          await transactionSession.commitTransaction();
          await transactionSession.endSession();
          return responseJSON;
        } catch (error) {
          await transactionSession.abortTransaction();
          await transactionSession.endSession();
          throw error;
        }
      }

      
  async status_change(dto: AccountSubgroupStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.accountSubgroupModel.updateMany(
        {
          _id: { $in: dto.AccountSubgroupIds },
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

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async list(dto: AccountSubgroupListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _name: new RegExp(dto.searchingText, 'i') }],
          },
        });
      }

      if (dto.AccountSubgroupIds.length > 0) {
        var newSettingsId = [];
        dto.AccountSubgroupIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.subGroupIds.length > 0) {
        var newUnderSubId = [];
        dto.subGroupIds.map((mapItem) => {
          newUnderSubId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _subGroupId: { $in: newUnderSubId } } });
      }


      if (dto.groupIds.length > 0) {
        var newgroupId = [];
        dto.groupIds.map((mapItem) => {
          newgroupId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _groupId: { $in: newgroupId } } });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({ $sort: { _status: dto.sortOrder ,_id: dto.sortOrder } });
          break;
        case 2:
          arrayAggregation.push({ $sort: { _name: dto.sortOrder  ,_id: dto.sortOrder} });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _groupId: dto.sortOrder ,_id: dto.sortOrder } });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      var result = await this.accountSubgroupModel
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

        var resultTotalCount = await this.accountSubgroupModel
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
      
      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return responseJSON;
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
      var resultCount = await this.accountSubgroupModel
        .count({
          _name: dto.value,
          _id: { $nin: dto.existingIds },
          _status: { $in: [1, 0] },
        })
        .session(transactionSession);

      const responseJSON = {
        message: 'success',
        data: { count: resultCount },
      };
      
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
