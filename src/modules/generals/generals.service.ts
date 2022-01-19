import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Generals } from 'src/tableModels/generals.model';
import * as mongoose from 'mongoose';
import { GeneralsCreateDto, GeneralsEditDto, GeneralsListDto, GeneralsStatusChangeDto } from './generals.dto';

@Injectable()
export class GeneralsService {

    constructor(
        @InjectModel(ModelNames.GENERALS) private readonly generalsModel: Model<Generals>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: GeneralsCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayToStates = [];
    
        dto.array.map((mapItem) => {
          arrayToStates.push({
            // _id:new MongooseModule.Types.ObjectId(),
            _code:mapItem.code,
            _string:mapItem.string,
            _number:mapItem.number,
            _json:mapItem.json,
            _type:mapItem.type,
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.generalsModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: { list: result1 } };
      }
    
      async edit(dto: GeneralsEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.generalsModel.findOneAndUpdate(
          {
            _id: dto.generalstId,
          },
          {
            $set: {
                _code:dto.code,
                _string:dto.string,
                _number:dto.number,
                _json:dto.json,
                _type:dto.type,
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
    
      async status_change(dto: GeneralsStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.generalsModel.updateMany(
          {
            _id: { $in: dto.generalIds },
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
    
      async list(dto: GeneralsListDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
        if (dto.generalsIds.length > 0) {
          var newSettingsId = [];
          dto.generalsIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
        if (dto.typeArray.length > 0) {
          
          arrayAggregation.push({ $match: { _type: { $in: dto.typeArray } } });
        }
          if (dto.codes.length > 0) {
           
            arrayAggregation.push({ $match: { _code: { $in: dto.codes } } });
          }
        
        arrayAggregation.push({ $sort: { _id: -1 } });
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }
    
        var result = await this.generalsModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
    
     
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return {
          message: 'success',
          data: { list: result },
        };
      }


}
