import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';
import { TestCenterMasters } from 'src/tableModels/testCenterMasters.model';
import { User } from 'src/tableModels/user.model';
const crypto = require('crypto');
import {
  CheckItemExistDto,
  CheckNameExistDto,
  TestCenterMastersCreateDto,
  TestCenterMastersEditDto,
  TestCenterMastersListDto,
  TestCenterMastersStatusChangeDto,
} from './test_center_masters.dto';

@Injectable()
export class TestCenterMastersService {
  constructor(
    @InjectModel(ModelNames.TEST_CENTER_MASTERS)
    private readonly testCenterMastersModel: mongoose.Model<TestCenterMasters>,
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: TestCenterMastersCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];
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

      dto.array.map((mapItem) => {
        var testCenterId = new mongoose.Types.ObjectId();
        arrayToStates.push({
          _id: testCenterId,
          _name: mapItem.name,
          _code: mapItem.code,
          _address: mapItem.address,
          _isTaxIgstEnabled: mapItem.isTaxIgstEnabled,
          _testChargeId: mapItem.testChargeId,
          _cityId: mapItem.cityId,
          _allowerWastage: mapItem.allowedWastage,
          _dataGuard: mapItem.dataGuard,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
        arrayToUsers.push({
          _name: mapItem.name,
          _gender: 2,
          _email: mapItem.email,
          _password: encryptedPassword,
          _mobile: mapItem.mobile,
          _globalGalleryId: null,
          _customType: [9],
          _employeeId: null,
          _agentId: null,
          _testCenterId: testCenterId,
          _supplierId: null,
          _logisticPartnerId:null,
          _shopId: null,
          _halmarkId: null,
          _customerId: null,
          _fcmId: '',
          _isNotificationEnable:1,
          _deliveryHubId: null,
          _deviceUniqueId: '',
          _deliveryCounterId: null,
          _permissions: [],
          _userType: 0,
          _createdUserId: null,
          _createdAt: -1,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      var result1 = await this.testCenterMastersModel.insertMany(
        arrayToStates,
        {
          session: transactionSession,
        },
      );
      await this.userModel.insertMany(arrayToUsers, {
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

  async edit(dto: TestCenterMastersEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.testCenterMastersModel.findOneAndUpdate(
        {
          _id: dto.testCenterMasterId,
        },
        {
          $set: {
            _name: dto.name,
            _code: dto.code,
            _address: dto.address,
            _testChargeId: dto.testChargeId,
            _isTaxIgstEnabled: dto.isTaxIgstEnabled,
            _cityId: dto.cityId,
            _allowerWastage: dto.allowedWastage,
            _dataGuard: dto.dataGuard,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );

      await this.userModel.findOneAndUpdate(
        {
          _testCenterId: dto.testCenterMasterId,
          _customType: {$in:[9]},
        },
        {
          $set: {
            _name: dto.name,
            _mobile: dto.mobile,
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

  async status_change(dto: TestCenterMastersStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.testCenterMastersModel.updateMany(
        {
          _id: { $in: dto.testCenterMastersIds },
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

  async list(dto: TestCenterMastersListDto) {
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
              { _code:new RegExp(`^${dto.searchingText}$`, 'i') },
            ],
          },
        });
      }
      if (dto.testCenterMastersIds.length > 0) {
        var newSettingsId = [];
        dto.testCenterMastersIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }
      
      if (dto.testChargeIds.length > 0) {
        var newSettingsId = [];
        dto.testChargeIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _testChargeId: { $in: newSettingsId } } });
      }

      if (dto.cityIds.length > 0) {
        var newSettingsId = [];
        dto.cityIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _cityId: { $in: newSettingsId } } });
      }
      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({ $sort: { _status: dto.sortOrder  ,_id: dto.sortOrder} });
          break;
        case 2:
          arrayAggregation.push({ $sort: { _name: dto.sortOrder  ,_id: dto.sortOrder} });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _code: dto.sortOrder  ,_id: dto.sortOrder} });
          break;
        case 4:
          arrayAggregation.push({ $sort: { _allowerWastage: dto.sortOrder  ,_id: dto.sortOrder} });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      if (dto.screenType.includes( 100)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    _customType: {$in:[9]},
                    $expr: { $eq: ['$_testCenterId', '$$userId'] },
                  },
                },
              ],
              as: 'userDetails',
            },
          },
          {
            $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }

      if (dto.screenType.includes( 103)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.TEST_CHARGE_MASTERS,
              let: { testChargeId: '$_testChargeId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$testChargeId'] },
                  },
                },
              ],
              as: 'testChargeDetails',
            },
          },
          {
            $unwind: { path: '$testChargeDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }





      if (dto.screenType.includes( 101)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.CITIES,
              let: { cityId: '$_cityId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$cityId'] },
                  },
                },
              ],
              as: 'cityDetails',
            },
          },
          {
            $unwind: { path: '$cityDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }


      if (dto.screenType.includes( 102)) {
        arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
          {
            $lookup: {
              from: ModelNames.DISTRICTS,
              let: { districtId: '$_districtsId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$districtId'] } } },
                {
                  $lookup: {
                    from: ModelNames.STATES,
                    let: { stateId: '$_statesId' },
                    pipeline: [
                      {
                        $match: { $expr: { $eq: ['$_id', '$$stateId'] } },
                      },
                    ],
                    as: 'stateDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$stateDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: 'districtDetails',
            },
          },
          {
            $unwind: {
              path: '$districtDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }


      var result = await this.testCenterMastersModel
        .aggregate(arrayAggregation)
        .session(transactionSession);

      var totalCount = 0;
      if (dto.screenType.includes( 0)) {
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

        var resultTotalCount = await this.testCenterMastersModel
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
  async checkCodeExisting(dto: CheckItemExistDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCount = await this.testCenterMastersModel
        .count({ _code: dto.value, _id: { $nin: dto.existingIds } })
        .session(transactionSession);

      const responseJSON = {
        message: 'success',
        data: { count: resultCount },
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

  async checkNameExisting(dto: CheckNameExistDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCount = await this.testCenterMastersModel
        .count({
          _name: dto.value,
          _id: { $nin: dto.existingIds },
          _status: { $in: [1, 0] },
        })
        .session(transactionSession);

      const responseJSON = {
        message: 'success',
        data: { count: resultCount },
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
