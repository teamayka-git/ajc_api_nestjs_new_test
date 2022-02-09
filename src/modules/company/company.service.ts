import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { map } from 'rxjs';
import { ModelNames } from 'src/common/model_names';
import { Company } from 'src/tableModels/companies.model';
import { StoneCreateDto } from '../stone/stone.dto';
import { CompanyCreateDto, CompanyEditDto, CompanyListDto, CompanyStatusChangeDto } from './company.dto';

@Injectable()
export class CompanyService {

    constructor(
        @InjectModel(ModelNames.COMPANIES) private readonly companyModel: mongoose.Model<Company>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: CompanyCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayToStates = [];
    
        dto.array.map((mapItem) => {
          arrayToStates.push({
            _name:mapItem.name,
            _place:mapItem.place,
            _email:mapItem.email,
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.companyModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: { list: result1 } };
      }
    
      async edit(dto: CompanyEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.companyModel.findOneAndUpdate(
          {
            _id: dto.companyId,
          },
          {
            $set: {
                _name:dto.name,
                _place:dto.place,
                _email:dto.email,
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
      }
    
      async status_change(dto: CompanyStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.companyModel.updateMany(
          {
            _id: { $in: dto.companyIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _status: dto.status,
            },
          },
          { new: true,session: transactionSession },
        );
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: result };
      }
    
      async list(dto: CompanyListDto) {
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
                { _place: new RegExp(dto.searchingText, 'i') },
                { _email:dto.searchingText },
              ],
            },
          });
        }
        if (dto.companyIds.length > 0) {
          var newSettingsId = [];
          dto.companyIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
    
        arrayAggregation.push({ $sort: { _id: -1 } });
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }
    
        var result = await this.companyModel
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
    
          var resultTotalCount = await this.companyModel
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
