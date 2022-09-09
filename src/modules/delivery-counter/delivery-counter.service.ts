import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryCounters } from 'src/tableModels/delivery_counters.model';
import * as mongoose from 'mongoose';
import { DeliveryCounterCreateDto, DeliveryCounterEditDto, DeliveryCounterListDto, DeliveryCounterStatusChangeDto } from './delivery_counter.dto';
import { GlobalConfig } from 'src/config/global_config';

@Injectable()
export class DeliveryCounterService {
    constructor(
        @InjectModel(ModelNames.DELIVERY_COUNTERS)
        private readonly deliveryCounterModel: mongoose.Model<DeliveryCounters>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: DeliveryCounterCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
          var arrayToStates = [];
    
          dto.array.map((mapItem) => {
          
            
    
            arrayToStates.push({
                _name: mapItem.name,
              _dataGuard: mapItem.dataGuard,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
            });
          });
    
          var result1 = await this.deliveryCounterModel.insertMany(arrayToStates, {
            session: transactionSession,
          });
    
          const responseJSON = { message: 'success', data: { list: result1 } };
          if (
            process.env.RESPONSE_RESTRICT == 'true' &&
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
        } catch (error) {
          await transactionSession.abortTransaction();
          await transactionSession.endSession();
          throw error;
        }
      }
    
      async edit(dto: DeliveryCounterEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
       
            
          var result = await this.deliveryCounterModel.findOneAndUpdate(
            {
              _id: dto.deliveryCounterId,
            },
            {
              $set: {
                _name: dto.name,
                _dataGuard: dto.dataGuard,
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
              },
            },
            { new: true, session: transactionSession },
          );
    
          const responseJSON = { message: 'success', data: result };
          if (
            process.env.RESPONSE_RESTRICT == 'true' &&
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
        } catch (error) {
          await transactionSession.abortTransaction();
          await transactionSession.endSession();
          throw error;
        }
      }
    
      async status_change(dto: DeliveryCounterStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
          var result = await this.deliveryCounterModel.updateMany(
            {
              _id: { $in: dto.deliveryCounterIds },
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
          if (
            process.env.RESPONSE_RESTRICT == 'true' &&
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
        } catch (error) {
          await transactionSession.abortTransaction();
          await transactionSession.endSession();
          throw error;
        }
      }
    
      async list(dto: DeliveryCounterListDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
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
          if (dto.deliveryCounterIds.length > 0) {
            var newSettingsId = [];
            dto.deliveryCounterIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
          }
        
          
          arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
          arrayAggregation.push({ $sort: { _id: -1 } });
    
          if (dto.skip != -1) {
            arrayAggregation.push({ $skip: dto.skip });
            arrayAggregation.push({ $limit: dto.limit });
          }
        
          
    
          var result = await this.deliveryCounterModel
            .aggregate(arrayAggregation)
            .session(transactionSession);
    
          var totalCount = 0;
          if (dto.screenType.includes( 0) ) {
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
    
            var resultTotalCount = await this.deliveryCounterModel
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
            process.env.RESPONSE_RESTRICT == 'true' &&
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
        } catch (error) {
          await transactionSession.abortTransaction();
          await transactionSession.endSession();
          throw error;
        }
      }
}
