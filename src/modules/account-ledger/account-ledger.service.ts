import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { AccountLedger } from 'src/tableModels/accountLedger.model';
import { AccountLedgerCreateDto, AccountLedgerEditDto, AccountLedgerListDto, AccountLedgerStatusChangeDto, CheckNameExistDto } from './account-ledger.dto';

@Injectable()
export class AccountLedgerService {
    constructor(
        @InjectModel(ModelNames.ACCOUNT_LEDGER)
        private readonly accountLedgerModel: mongoose.Model<AccountLedger>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}

    async create(dto: AccountLedgerCreateDto, _userId_: string) {
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
              _address: mapItem.address,
              _phone: mapItem.phone,
              _email: mapItem.email,
              _city: mapItem.city,
              _state: mapItem.state,
              _country: mapItem.country,
              _pin: mapItem.pin,
              _remarks: mapItem.remarks,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
          });
          });
    
          var result1 = await this.accountLedgerModel.insertMany(arrayToStates, {
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

      async edit(dto: AccountLedgerEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
          var result = await this.accountLedgerModel.findOneAndUpdate(
            {
              _id: dto.AccountLedgerId,
            },
            {
              $set: {
                _code: dto.code,
                _name: dto.name,
                _underId: dto.underId,                
                _address: dto.address,
                _phone: dto.phone,
                _email: dto.email,
                _city: dto.city,
                _state: dto.state,
                _country: dto.country,
                _pin: dto.pin,
                _remarks: dto.remarks,
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

      
  async status_change(dto: AccountLedgerStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.accountLedgerModel.updateMany(
        {
          _id: { $in: dto.AccountLedgerIds },
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

  async list(dto: AccountLedgerListDto) {
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

      if (dto.searchingCode != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _code: new RegExp(dto.searchingCode, 'i') }],
          },
        });
      }

      
      if (dto.AccountLedgerIds.length > 0) {
        var newSettingsId = [];
        dto.AccountLedgerIds.map((mapItem) => {
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
          arrayAggregation.push({ $sort: { _under: dto.sortOrder ,_id: dto.sortOrder } });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      var result = await this.accountLedgerModel
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

        var resultTotalCount = await this.accountLedgerModel
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
      var resultCount = await this.accountLedgerModel
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
