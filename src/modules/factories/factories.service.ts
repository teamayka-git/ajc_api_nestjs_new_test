import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Factory } from 'src/tableModels/factory.model';
import { FactoriesCreateDto, FactoriesEditDto, FactoriesListDto, FactoriesStatusChangeDto, ListFilterLocadingFactoryDto } from './factories.dto';

@Injectable()
export class FactoriesService {


    constructor(
        @InjectModel(ModelNames.FACTORIES) private readonly factoryModel: mongoose.Model<Factory>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: FactoriesCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayToStates = [];
    
        dto.array.map((mapItem) => {
          arrayToStates.push({
            _name: mapItem.name,
            _cityId: mapItem.cityId,
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.factoryModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: { list: result1 } };
      }
    
      async edit(dto: FactoriesEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.factoryModel.findOneAndUpdate(
          {
            _id: dto.factoryId,
          },
          {
            $set: {
              _name: dto.name,
              _cityId: dto.cityId,
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
    
      async status_change(dto: FactoriesStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.factoryModel.updateMany(
          {
            _id: { $in: dto.factoryIds },
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
    
      async list(dto: FactoriesListDto) {
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
              ],
            },
          });
        }
        if (dto.factoryIds.length > 0) {
          var newSettingsId = [];
          dto.factoryIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }

        
        if (dto.cityIds.length > 0) {
            var newSettingsId = [];
            dto.cityIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            arrayAggregation.push({ $match: { _cityId: { $in: newSettingsId } } });
          }
    
          switch(dto.sortType){
            case 0: arrayAggregation.push({ $sort: { _id: dto.sortOrder } });              break;
            case 1:arrayAggregation.push({ $sort: { _status: dto.sortOrder } });               break;
            case 2: arrayAggregation.push({ $sort: { _name: dto.sortOrder } });               break;
            
          }
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }
        if (dto.screenType.findIndex((it) => it == 100) != -1) {

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.CITIES,
              let: { cityId: '$_cityId' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$cityId'] } } }],
              as: 'cityDetails',
            },
          },
          {
            $unwind: { path: '$cityDetails', preserveNullAndEmptyArrays: true },
          },
        );
    }

        var result = await this.factoryModel
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
    
          var resultTotalCount = await this.factoryModel
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


      async listFilterLoadingFactory(dto: ListFilterLocadingFactoryDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
     

       arrayAggregation.push({ $group: { _id: '$_cityId' } });

        
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }


        if (dto.screenType.findIndex((it) => it == 100) != -1) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.CITIES,
                  let: { cityId: '$_id' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$cityId'] } } }],
                  as: 'cityDetails',
                },
              },
              {
                $unwind: { path: '$cityDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
    
    
        var result = await this.factoryModel
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
    
          var resultTotalCount = await this.factoryModel
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
