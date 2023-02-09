import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { AccountGroup } from 'src/tableModels/account_group.model';
import { AccountGroupCreateDto, AccountGroupEditDto, AccountGroupListDto, AccountGroupStatusChangeDto, CheckNameExistDto } from './account-group.dto';

@Injectable()
export class AccountGroupService {
    constructor(
        @InjectModel(ModelNames.ACCOUNT_GROUP)
        private readonly accountGroupModel: mongoose.Model<AccountGroup>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}

    async create(dto: AccountGroupCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
          var arrayToStates = [];
    
          dto.array.map((mapItem) => {
            arrayToStates.push({
              _code: mapItem.code,
              _name: mapItem.name,
              _underId: mapItem.underId,              
              _reportGroup: mapItem.reportGroup,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
          });
          });
    
          var result1 = await this.accountGroupModel.insertMany(arrayToStates, {
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

      async edit(dto: AccountGroupEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
          var result = await this.accountGroupModel.findOneAndUpdate(
            {
              _id: dto.accountgroupId,
            },
            {
              $set: {
                _code: dto.code,
                _name: dto.name,
                _underId: dto.underId,                
                _reportGroup: dto.reportGroup,
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

      
  async status_change(dto: AccountGroupStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.accountGroupModel.updateMany(
        {
          _id: { $in: dto.accountgroupIds },
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

  async list(dto: AccountGroupListDto) {
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
      if (dto.accountgroupIds.length > 0) {
        var newSettingsId = [];
        dto.accountgroupIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
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
          arrayAggregation.push({ $sort: { _purity: dto.sortOrder ,_id: dto.sortOrder } });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      var result = await this.accountGroupModel
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

        var resultTotalCount = await this.accountGroupModel
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
      var resultCount = await this.accountGroupModel
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
