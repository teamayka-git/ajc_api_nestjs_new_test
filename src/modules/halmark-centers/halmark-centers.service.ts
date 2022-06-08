import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { HalmarkCenter } from 'src/tableModels/halmarkCenter.model';
import {
  HalmarkAddRemoveUsersDto,
  HalmarkCreateDto,
  HalmarkEditDto,
  HalmarkListDto,
  HalmarkStatusChangeDto,
} from './halmark_center.dto';
const crypto = require('crypto');
import { GlobalConfig } from 'src/config/global_config';
import { Counters } from 'src/tableModels/counters.model';
import { User } from 'src/tableModels/user.model';

@Injectable()
export class HalmarkCentersService {
  constructor(
    @InjectModel(ModelNames.HALMARK_CENTERS)
    private readonly halmarkModel: mongoose.Model<HalmarkCenter>,
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: HalmarkCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];
      var arrayToUsers = [];
      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.HALMARK_CENTERS },
        {
          $inc: {
            _count: 1,
          },
        },
        { new: true, session: transactionSession },
      );
      var halmarkId = new mongoose.Types.ObjectId();
      const halmarkModel = new this.halmarkModel({
        _id: halmarkId,
        _name: dto.name,
        _uid: resultCounterPurchase._count,
        _cityId: dto.cityId,
        _address: dto.address,
        _mobile: dto.mobile,
        _ahcNo: dto.ahcNo,
        _location: { type: 'Point', coordinates: dto.location },
        _dataGuard: dto.dataGuard,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });
      var resultHalmark = await halmarkModel.save({
        session: transactionSession,
      });

      if (dto.arrayUserIdsEsixting.length > 0) {
        await this.userModel.updateMany(
          {
            _id: { $in: dto.arrayUserIdsEsixting },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _halmarkId: halmarkId,
            },
            $push: {
              _customType: 4,
            },
          },
          { new: true, session: transactionSession },
        );
      }

      var encryptedPassword = await crypto
        .pbkdf2Sync(
          '123456',
          process.env.CRYPTO_ENCRYPTION_SALT,
          1000,
          64,
          `sha512`,
        )
        .toString(`hex`);
      if (dto.arrayUsersNew.length > 0) {
        dto.arrayUsersNew.map((mapItem) => {
          arrayToUsers.push({
            _email: mapItem.email,
            _name: mapItem.name,
            _gender: mapItem.gender,
            _password: encryptedPassword,
            _mobile: mapItem.mobile,
            _globalGalleryId: null,
            _employeeId: null,
            _agentId: null,
            _supplierId: null,
            _customerId: null,
            _deliveryHubId: null,
            _testCenterId: null,
            _shopId: null,
            _customType: [4],
            _halmarkId: halmarkId,
            _fcmId: '',
            _deviceUniqueId: '',
            _permissions: [],
            _userRole: 0,
            _createdUserId: null,
            _createdAt: -1,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      }

      arrayToUsers.push({
        _email: dto.email,
        _name: dto.name,
        _gender: 2,
        _password: encryptedPassword,
        _mobile: dto.mobile,
        _globalGalleryId: null,
        _employeeId: null,
        _agentId: null,
        _supplierId: null,
        _customerId: null,
        _deliveryHubId: null,
        _testCenterId: null,
        _shopId: null,
        _customType: [7],
        _halmarkId: halmarkId,
        _fcmId: '',
        _deviceUniqueId: '',
        _permissions: [],
        _userRole: 0,
        _createdUserId: null,
        _createdAt: -1,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });

      await this.userModel.insertMany(arrayToUsers, {
        session: transactionSession,
      });
      const responseJSON = { message: 'success', data: resultHalmark };
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

  async edit(dto: HalmarkEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.halmarkModel.findOneAndUpdate(
        {
          _id: dto.halmarkCenterId,
        },
        {
          $set: {
            _name: dto.name,
            _cityId: dto.cityId,
            _address: dto.address,
            _mobile: dto.mobile,
            _ahcNo: dto.ahcNo,
            _location: dto.location,
            _dataGuard: dto.dataGuard,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );

      await this.userModel.findOneAndUpdate(
        {
          _halmarkId: dto.halmarkCenterId,
          _customType: [7],
        },
        {
          $set: {
            _name: dto.name,
            _mobile: dto.mobile,
          },
        },
        { new: true, session: transactionSession },
      );

      if (dto.arrayAddUserIdsEsixting.length > 0) {
        await this.userModel.updateMany(
          {
            _id: { $in: dto.arrayAddUserIdsEsixting },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _halmarkId: dto.halmarkCenterId,
            },
          },
          { new: true, session: transactionSession },
        );
      }
      if (dto.arrayRemoveUserIdsEsixting.length > 0) {
        await this.userModel.updateMany(
          {
            _id: { $in: dto.arrayRemoveUserIdsEsixting },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _halmarkId: null,
            },
            $push: {
              _customType: 4,
            },
          },
          { new: true, session: transactionSession },
        );
      }
      if (dto.arrayUsersNew.length > 0) {
        var arrayToUsers = [];

        var encryptedPassword = await crypto
          .pbkdf2Sync(
            '123456',
            process.env.CRYPTO_ENCRYPTION_SALT,
            1000,
            64,
            `sha512`,
          )
          .toString(`hex`);

        dto.arrayUsersNew.map((mapItem) => {
          arrayToUsers.push({
            _email: mapItem.email,
            _name: mapItem.name,
            _gender: mapItem.gender,
            _password: encryptedPassword,
            _mobile: mapItem.mobile,
            _globalGalleryId: null,
            _employeeId: null,
            _agentId: null,
            _deliveryHubId: null,
            _supplierId: null,
            _testCenterId: null,
            _shopId: null,
            _customType: [4],
            _customerId: null,
            _halmarkId: dto.halmarkCenterId,
            _fcmId: '',
            _deviceUniqueId: '',
            _permissions: [],
            _userRole: 0,
            _createdUserId: null,
            _createdAt: -1,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
        await this.userModel.insertMany(arrayToUsers, {
          session: transactionSession,
        });
      }

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

  async addRemoveUsers(dto: HalmarkAddRemoveUsersDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      if (dto.arrayAddUserIdsEsixting.length > 0) {
        await this.userModel.updateMany(
          {
            _id: { $in: dto.arrayAddUserIdsEsixting },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _halmarkId: dto.halmarkCenterId,
            },
          },
          { new: true, session: transactionSession },
        );
      }
      if (dto.arrayRemoveUserIdsEsixting.length > 0) {
        await this.userModel.updateMany(
          {
            _id: { $in: dto.arrayRemoveUserIdsEsixting },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _halmarkId: null,
            },
            $push: {
              _customType: 4,
            },
          },
          { new: true, session: transactionSession },
        );
      }
      if (dto.arrayUsersNew.length > 0) {
        var arrayToUsers = [];

        var encryptedPassword = await crypto
          .pbkdf2Sync(
            '123456',
            process.env.CRYPTO_ENCRYPTION_SALT,
            1000,
            64,
            `sha512`,
          )
          .toString(`hex`);

        dto.arrayUsersNew.map((mapItem) => {
          arrayToUsers.push({
            _email: mapItem.email,
            _name: mapItem.name,
            _gender: mapItem.gender,
            _password: encryptedPassword,
            _mobile: mapItem.mobile,
            _globalGalleryId: null,
            _employeeId: null,
            _agentId: null,
            _testCenterId: null,
            _supplierId: null,
            _shopId: null,
            _customerId: null,
            _deliveryHubId: null,
            _customType: [4],
            _halmarkId: dto.halmarkCenterId,
            _fcmId: '',
            _deviceUniqueId: '',
            _permissions: [],
            _userRole: 0,
            _createdUserId: null,
            _createdAt: -1,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
        await this.userModel.insertMany(arrayToUsers, {
          session: transactionSession,
        });
      }

      const responseJSON = { message: 'success', data: {} };
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

  async status_change(dto: HalmarkStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.halmarkModel.updateMany(
        {
          _id: { $in: dto.halmarkIds },
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

  async list(dto: HalmarkListDto) {
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
              { _address: new RegExp(dto.searchingText, 'i') },
              { _uid: dto.searchingText },
              { _ahcNo: dto.searchingText },
              { _mobile: dto.searchingText },
            ],
          },
        });
      }
      if (dto.halmarkIds.length > 0) {
        var newSettingsId = [];
        dto.halmarkIds.map((mapItem) => {
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

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      arrayAggregation.push({ $sort: { _id: -1 } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      if (dto.screenType.includes( 100)) {
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

      var result = await this.halmarkModel
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

        var resultTotalCount = await this.halmarkModel
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
