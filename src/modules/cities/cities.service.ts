import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Cities } from 'src/tableModels/cities.model';
import * as mongoose from 'mongoose';
import { CitiesCreateDto, CitiesEditDto, CitiesListDto, CitiesStatusChangeDto, ListFilterLocadingCityDto } from './cities.dto';

@Injectable()
export class CitiesService {

    constructor(
        @InjectModel(ModelNames.CITIES) private readonly citiesModel: Model<Cities>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: CitiesCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayToStates = [];
    
        dto.citiesArray.map((mapItem) => {
          arrayToStates.push({
            _name: mapItem.name,
            _code: mapItem.code,
            _districtsId: mapItem.districtsId,
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.citiesModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: { list: result1 } };
      }
    
      async edit(dto: CitiesEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.citiesModel.findOneAndUpdate(
          {
            _id: dto.citiesId,
          },
          {
            $set: {
              _name: dto.name,
              _code: dto.code,
              _districtsId: dto.districtsId,
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
    
      async status_change(dto: CitiesStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.citiesModel.updateMany(
          {
            _id: { $in: dto.citiesIds },
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
    
      async list(dto: CitiesListDto) {
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
                { _code: dto.searchingText },
              ],
            },
          });
        }
        if (dto.citiesIds.length > 0) {
          var newSettingsId = [];
          dto.citiesIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }


        
        if (dto.districtIds.length > 0) {
            var newSettingsId = [];
            dto.districtIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            arrayAggregation.push({ $match: { _districtsId: { $in: newSettingsId } } });
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
                  from: ModelNames.DISTRICTS,
                  let: { districtId: '$_districtsId' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$districtId'] } } }],
                  as: 'districtDetails',
                },
              },
              {
                $unwind: { path: '$districtDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }

        var result = await this.citiesModel
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
    
          var resultTotalCount = await this.citiesModel
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



      
      async listFilterLoadingCity(dto: ListFilterLocadingCityDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
     

       arrayAggregation.push({ $group: { _id: '$_districtsId' } });

        
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }


        if (dto.screenType.findIndex((it) => it == 100) != -1) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.DISTRICTS,
                  let: { districtId: '$_id' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$districtId'] } } }],
                  as: 'districtDetails',
                },
              },
              {
                $unwind: { path: '$districtDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
    
    
        var result = await this.citiesModel
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
    
          var resultTotalCount = await this.citiesModel
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
