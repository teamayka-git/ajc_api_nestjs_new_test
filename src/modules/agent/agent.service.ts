import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Agents } from 'src/tableModels/agents.model';
import { Counters } from 'src/tableModels/counters.model';
import { User } from 'src/tableModels/user.model';
import { StringUtils } from 'src/utils/string_utils';
import {
  AgentCreateDto,
  AgentEditDto,
  AgentListDto,
  AgentLoginDto,
  AgentStatusChangeDto,
} from './agent.dto';
const crypto = require('crypto');

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.AGENTS)
    private readonly agentModel: mongoose.Model<Agents>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async login(dto: AgentLoginDto) {
    var dateTime = new Date().getTime();

    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    var resultEmployee = await this.agentModel
      .aggregate([{ $match: { _email: dto.email } }])
      .session(transactionSession);
    if (resultEmployee.length == 0) {
      throw new HttpException(
        'Wrong, Please check email and password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else if (resultEmployee[0]._status == 0) {
      throw new HttpException(
        'User is disabled',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else if (resultEmployee[0]._status == 2) {
      throw new HttpException(
        'User is deleted',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    var encryptedPassword = await crypto
      .pbkdf2Sync(
        dto.password,
        process.env.CRYPTO_ENCRYPTION_SALT,
        1000,
        64,
        `sha512`,
      )
      .toString(`hex`);

    let isEqual =
      encryptedPassword === resultEmployee[0]._password ? true : false;

    if (!isEqual) {
      throw new HttpException(
        'Wrong, Please check password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.agentModel.findOneAndUpdate(
      { _id: resultEmployee[0]._id },
      { $set: { _lastLogin: dateTime } },
      { new: true, transactionSession },
    );

    var resultUser = await this.userModel
      .aggregate([
        {
          $match: {
            _agentId: new mongoose.Types.ObjectId(resultEmployee[0]._id),
            _type: 1,
            _status: 1,
          },
        },

        { $sort: { _id: -1 } },
        {
          $lookup: {
            from: ModelNames.AGENTS,
            let: { agentId: '$_agentId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$agentId'] } } },
              { $project: { _password: 0 } },
            ],
            as: 'userDetails',
          },
        },
        {
          $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .session(transactionSession);
    if (resultUser.length == 0) {
      throw new HttpException(
        'User not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await transactionSession.commitTransaction();
    await transactionSession.endSession();

    return resultUser[0];
  }

  async create(dto: AgentCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
      { _table_name: ModelNames.AGENTS },
      {
        $inc: {
          _count: 1,
        },
      },
      { new: true, transactionSession },
    );

    var password = '';
    if (dto.password == '') {
      password = new StringUtils().makeid(6);
    }

    var encryptedPassword = await crypto
      .pbkdf2Sync(
        password,
        process.env.CRYPTO_ENCRYPTION_SALT,
        1000,
        64,
        `sha512`,
      )
      .toString(`hex`);

    const newsettingsModel = new this.agentModel({
      // _id:new MongooseModule.Types.ObjectId(),
      _name: dto.name,
      _gender: dto.gender,
      _email: dto.email,
      _password: encryptedPassword,
      _mobile: dto.mobile,
      _uid: resultCounterPurchase._count,
      _cityId: dto.cityId,
      _lastLogin: 0,
      _commisionAmount: dto.commisionAmount,
      _commisionPercentage: dto.commisionPercentage,
      _commisionType: dto.commisionType,
      _dataGuard: dto.dataGuard,
      _createdUserId: _userId_,
      _createdAt: dateTime,
      _updatedUserId: null,
      _updatedAt: -1,
      _status: 1,
    });
    var result1 = await newsettingsModel.save({ session: transactionSession });

    await transactionSession.commitTransaction();
    await transactionSession.endSession();
    return { message: 'success', data: result1 };
  }

  async edit(dto: AgentEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    var result = await this.agentModel.findOneAndUpdate(
      {
        _id: dto.agentId,
      },
      {
        $set: {
            _name: dto.name,
            _gender: dto.gender,
            _mobile: dto.mobile,
            _cityId: dto.cityId,
            _commisionAmount: dto.commisionAmount,
            _commisionPercentage: dto.commisionPercentage,
            _commisionType: dto.commisionType,
          _dataGuard: dto.dataGuard,
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

  async status_change(dto: AgentStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    var result = await this.agentModel.updateMany(
      {
        _id: { $in: dto.agentIds },
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

  async list(dto: AgentListDto) {
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
            { _email: dto.searchingText },
            { _mobile: new RegExp(dto.searchingText, 'i') },
            { _uid: dto.searchingText },
            ],
        },
      });
    }
    if (dto.agentIds.length > 0) {
      var newSettingsId = [];
      dto.agentIds.map((mapItem) => {
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
  
      if (dto.genders.length > 0) {
        
        arrayAggregation.push({ $match: { _gender: { $in:dto.genders } } });
      }
      if (dto.commisionType.length > 0) {
        
        arrayAggregation.push({ $match: { _commisionType: { $in:dto.commisionType } } });
      }
  
    arrayAggregation.push({ $sort: { _id: -1 } });

    if (dto.skip != -1) {
      arrayAggregation.push({ $skip: dto.skip });
      arrayAggregation.push({ $limit: dto.limit });
    }

    var result = await this.agentModel
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

      var resultTotalCount = await this.agentModel
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
