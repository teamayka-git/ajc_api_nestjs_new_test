import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { AccountHead } from 'src/tableModels/account_head.model';
import { AccountHeadCreateDto } from './account-head.dto';

@Injectable()
export class AccountHeadService {
    constructor(
        @InjectModel(ModelNames.ACCOUNT_HEAD)
        private readonly accountHeadModel: mongoose.Model<AccountHead>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}

    async create(dto: AccountHeadCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
          var arrayToStates = [];
    
          dto.array.map((mapItem) => {
            arrayToStates.push({
              _name: mapItem.name,
              _purity: mapItem.purity,
              _dataGuard: mapItem.dataGuard,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
            });
          });
    
          var result1 = await this.accountHeadModel.insertMany(arrayToStates, {
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

}
