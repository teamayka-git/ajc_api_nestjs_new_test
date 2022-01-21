import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { TestChargersMasters } from 'src/tableModels/testChargeMasters.model';
import { TestChargeMastersCreateDto, TestChargeMastersEditDto, TestChargeMastersListDto, TestChargeMastersStatusChangeDto } from './testChargeMasters.dto';

@Injectable()
export class TestChargeMastersService {


    constructor(
        @InjectModel(ModelNames.TEST_CHARGE_MASTERS) private readonly testChargeMastersModel: mongoose.Model<TestChargersMasters>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}
      async create(dto: TestChargeMastersCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayToStates = [];
    
        dto.array.map((mapItem) => {
          arrayToStates.push({
            // _id:new MongooseModule.Types.ObjectId(),
            _groupId:mapItem.groupId,
            _charge:mapItem.charge,
            _dataGuard:mapItem.dataGuard,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
    
        var result1 = await this.testChargeMastersModel.insertMany(arrayToStates, {
          session: transactionSession,
        });
    
        await transactionSession.commitTransaction();
        await transactionSession.endSession();
        return { message: 'success', data: { list: result1 } };
      }
    
      async edit(dto: TestChargeMastersEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.testChargeMastersModel.findOneAndUpdate(
          {
            _id: dto.testChargeMastersId,
          },
          {
            $set: {
                _groupId:dto.groupId,
                _charge:dto.charge,
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
    
      async status_change(dto: TestChargeMastersStatusChangeDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var result = await this.testChargeMastersModel.updateMany(
          {
            _id: { $in: dto.testChargeMastersIds },
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
    
      async list(dto: TestChargeMastersListDto) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
    
        var arrayAggregation = [];
        arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
    
    
        if (dto.testChargeMastersIds.length > 0) {
          var newSettingsId = [];
          dto.testChargeMastersIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
        }
    
        arrayAggregation.push({ $sort: { _id: -1 } });
    
        if (dto.skip != -1) {
          arrayAggregation.push({ $skip: dto.skip });
          arrayAggregation.push({ $limit: dto.limit });
        }
        if (dto.screenType.findIndex((it) => it == 100) != -1) {

          arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.GROUP_MASTERS,
                  let: { groupId: '$_groupId' },
                  pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$groupId'] } } }],
                  as: 'groupDetails',
                },
              },
              {
                $unwind: { path: '$groupDetails', preserveNullAndEmptyArrays: true },
              },
            );
        }
    
        var result = await this.testChargeMastersModel
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
    
          var resultTotalCount = await this.testChargeMastersModel
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
