import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { States } from 'src/tableModels/states.model';
import * as mongoose from 'mongoose';
import {
  StatesCreateDto,
  StatesEditDto,
  StatesListDto,
  StatesStatusChangeDto,
} from './states.dto';

@Injectable()
export class StatesService {
  constructor(
    @InjectModel(ModelNames.STATES) private readonly statesModel: Model<States>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: StatesCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    var arrayToStates = [];

    dto.array.map((mapItem) => {
      arrayToStates.push({
        // _id:new MongooseModule.Types.ObjectId(),
        _name: mapItem.name,
        _code: mapItem.code,
        _dataGuard:mapItem.dataGuard,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });
    });

    var result1 = await this.statesModel.insertMany(arrayToStates, {
      session: transactionSession,
    });

    await transactionSession.commitTransaction();
    await transactionSession.endSession();
    return { message: 'success', data: { list: result1 } };
  }

  async edit(dto: StatesEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    var result = await this.statesModel.findOneAndUpdate(
      {
        _id: dto.stateId,
      },
      {
        $set: {
          _name: dto.name,
          _code: dto.code,
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

  async status_change(dto: StatesStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    var result = await this.statesModel.updateMany(
      {
        _id: { $in: dto.stateIds },
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

  async list(dto: StatesListDto) {
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
    if (dto.stateIds.length > 0) {
      var newSettingsId = [];
      dto.stateIds.map((mapItem) => {
        newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
      });
      arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
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

    var result = await this.statesModel
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

      var resultTotalCount = await this.statesModel
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
