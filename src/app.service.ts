import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { GetUserDto, MeDto } from './app.dto';
import { CommonNames } from './common/common_names';
import { ModelNames } from './common/model_names';
import { GlobalConfig } from './config/global_config';
import { Colours } from './tableModels/colourMasters.model';
import { Company } from './tableModels/companies.model';
import { Counters } from './tableModels/counters.model';
import { Departments } from './tableModels/departments.model';
import { Employee } from './tableModels/employee.model';
import { Generals } from './tableModels/generals.model';
import { GlobalGalleryCategories } from './tableModels/globalGallerycategories.model';
import { ProcessMaster } from './tableModels/processMaster.model';
import { Purity } from './tableModels/purity.model';
import { User } from './tableModels/user.model';
import { IndexUtils } from './utils/IndexUtils';
const crypto = require('crypto');

@Injectable()
export class AppService {
  constructor(
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.GENERALS)
    private readonly generalsModel: mongoose.Model<Generals>,
    @InjectModel(ModelNames.DEPARTMENT)
    private readonly departmentModel: mongoose.Model<Departments>,
    @InjectModel(ModelNames.PURITY)
    private readonly purityModel: mongoose.Model<Purity>,
    @InjectModel(ModelNames.COMPANIES)
    private readonly companyModel: mongoose.Model<Company>,
    @InjectModel(ModelNames.PROCESS_MASTER)
    private readonly processMastersModel: mongoose.Model<ProcessMaster>,
    @InjectModel(ModelNames.GLOBAL_GALLERY_CATEGORIES)
    private readonly globalGalleryCategoriesModel: mongoose.Model<GlobalGalleryCategories>,

    @InjectModel(ModelNames.COLOUR_MASTERS)
    private readonly coloursModel: mongoose.Model<Colours>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly countersModel: mongoose.Model<Counters>,
    @InjectModel(ModelNames.EMPLOYEES)
    private readonly employeeModel: mongoose.Model<Employee>,

    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  getHello(): string {
    // throw new HttpException('User not found', HttpStatus.INTERNAL_SERVER_ERROR);
    return 'Hello Worldwwwww!';
  }

  async me(dto: MeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    var resultEmployee = await this.userModel
      .aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(_userId_) } },
        { $sort: { _id: -1 } },
        {
          $lookup: {
            from: ModelNames.EMPLOYEES,
            let: { employeeId: '$_employeeId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$employeeId'] } } },
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
        // {
        //   $lookup: {
        //     from: ModelNames.AGENTS,
        //     let: { agentId: '$_agentId' },
        //     pipeline: [
        //       { $match: { $expr: { $eq: ['$_id', '$$agentId'] } } },
        //     ],
        //     as: 'userDetails',
        //   },
        // },
        // {
        //   $unwind: {
        //     path: '$userDetails',
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
        // {
        //   $lookup: {
        //     from: ModelNames.SUPPLIERS,
        //     let: { supplierId: '$_supplierId' },
        //     pipeline: [
        //       { $match: { $expr: { $eq: ['$_id', '$$supplierId'] } } },
        //     ],
        //     as: 'userDetails',
        //   },
        // },
        // {
        //   $unwind: {
        //     path: '$userDetails',
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
        {
          $lookup: {
            from: ModelNames.SHOPS,
            let: { shopId: '$_shopId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shopId'] } } }],
            as: 'shopDetails',
          },
        },
        {
          $unwind: {
            path: '$shopDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: ModelNames.USER_ATTENDANCES,
            let: { userId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_userId', '$$userId'] } } },
              { $sort: { _id: -1 } },
              { $skip: 0 },
              { $limit: 1 },
            ],
            as: 'employeeAttendanceDetails',
          },
        },
        {
          $unwind: {
            path: '$employeeAttendanceDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .session(transactionSession);

    if (resultEmployee.length == 0) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    await transactionSession.commitTransaction();
    await transactionSession.endSession();

    return { message: 'success', data: resultEmployee[0] };
  }

  async getUser(dto: GetUserDto) {
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
              { _email: dto.searchingText },
              { _mobile: dto.searchingText },
              { _deviceUniqueId: dto.searchingText },
            ],
          },
        });
      }
      if (dto.gender.length > 0) {
        arrayAggregation.push({ $match: { _gender: { $in: dto.gender } } });
      }
      if (dto.customType.length > 0) {
        arrayAggregation.push({
          $match: { _customType: { $in: dto.customType } },
        });
      }
      if (dto.userIds.length > 0) {
        var newSettingsId = [];
        dto.userIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }
      if (dto.employeeIds.length > 0) {
        var newSettingsId = [];
        dto.employeeIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _employeeId: { $in: newSettingsId } },
        });
      }
      if (dto.agentIds.length > 0) {
        var newSettingsId = [];
        dto.agentIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _agentId: { $in: newSettingsId } } });
      }
      if (dto.supplierIds.length > 0) {
        var newSettingsId = [];
        dto.supplierIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _supplierId: { $in: newSettingsId } },
        });
      }
      if (dto.shopIds.length > 0) {
        var newSettingsId = [];
        dto.shopIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _shopId: { $in: newSettingsId } } });
      }
      if (dto.halmarkIds.length > 0) {
        var newSettingsId = [];
        dto.halmarkIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _halmarkId: { $in: newSettingsId } },
        });
      }
      if (dto.deliveryHubIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryHubIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _deliveryHubId: { $in: newSettingsId } },
        });
      }
      if (dto.customerIds.length > 0) {
        var newSettingsId = [];
        dto.customerIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _customerId: { $in: newSettingsId } },
        });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      arrayAggregation.push({ $sort: { _id: -1 } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.findIndex((it) => it == 50) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERIES,
              let: { globalGalleryId: '$_globalGalleryId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } } },
              ],
              as: 'globalGalleryDetails',
            },
          },
          {
            $unwind: {
              path: '$globalGalleryDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.findIndex((it) => it == 100) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.EMPLOYEES,
              let: { employeeId: '$_employeeId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$employeeId'] } } },
              ],
              as: 'employeeDetails',
            },
          },
          {
            $unwind: {
              path: '$employeeDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.findIndex((it) => it == 101) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.AGENTS,
              let: { agentId: '$_agentId' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$agentId'] } } }],
              as: 'agentDetails',
            },
          },
          {
            $unwind: {
              path: '$agentDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.findIndex((it) => it == 102) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SUPPLIERS,
              let: { supplierId: '$_supplierId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$supplierId'] } } },
              ],
              as: 'supplierDetails',
            },
          },
          {
            $unwind: {
              path: '$supplierDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.findIndex((it) => it == 103) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shopId'] } } }],
              as: 'shopDetails',
            },
          },
          {
            $unwind: {
              path: '$shopDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.findIndex((it) => it == 104) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.HALMARK_CENTERS,
              let: { halmarkId: '$_halmarkId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$halmarkId'] } } },
              ],
              as: 'halmarkDetails',
            },
          },
          {
            $unwind: {
              path: '$halmarkDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.findIndex((it) => it == 105) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.DELIVERY_HUBS,
              let: { deliveryHubId: '$_deliveryHubId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$deliveryHubId'] } } },
              ],
              as: 'deliveryHubDetails',
            },
          },
          {
            $unwind: {
              path: '$deliveryHubDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.findIndex((it) => it == 106) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.CUSTOMERS,
              let: { customerId: '$_customerId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$customerId'] } } },
              ],
              as: 'customerDetails',
            },
          },
          {
            $unwind: {
              path: '$customerDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.userModel
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
        arrayAggregation.push({
          $group: { _id: null, totalCount: { $sum: 1 } },
        });

        var resultTotalCount = await this.userModel
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
  async project_init() {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    var userId = '';
    var resultCheckUser = await this.userModel.find({}).limit(1);
    if (resultCheckUser.length == 0) {
      //only first time

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.EMPLOYEES },
        {
          $setOnInsert: {
            _count: 1,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.SUPPLIERS },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.AGENTS },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.GLOBAL_GALLERIES },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.BRANCHES },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.ORDER_SALES },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.PRODUCTS },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.HALMARK_CENTERS },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.SHOPS },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.CUSTOMERS },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.DELIVERY_CHALLANS },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.INVOICES },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.HALMARKING_REQUESTS },
        {
          $setOnInsert: {
            _count: 0,
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      var encryptedPassword = await crypto
        .pbkdf2Sync(
          '123456',
          process.env.CRYPTO_ENCRYPTION_SALT,
          1000,
          64,
          `sha512`,
        )
        .toString(`hex`);

      var employeeId = new mongoose.Types.ObjectId();
      var resultUser = await this.userModel.findOneAndUpdate(
        { _email: 'admin@ayka.com' },
        {
          $setOnInsert: {
            _name: 'super admin',
            _gender: 0,
            _password: encryptedPassword,
            _mobile: '',
            _globalGalleryId: null,
            _employeeId: employeeId,
            _agentId: null,
            _supplierId: null,
            _shopId: null,
            _customType: 0,
            _halmarkId: null,
            _customerId: null,
            _deliveryHubId: null,
            _fcmId: '',
            _deviceUniqueId: '',
            _permissions: [],
            _userRole: 0,
            _createdUserId: null,
            _createdAt: -1,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      var resultEmployee = await this.employeeModel.findOneAndUpdate(
        {
          _userId: resultUser._id,
        },
        {
          $setOnInsert: {
            _id: employeeId,
            _uid: 1,
            _departmentId: null,
            _processMasterId: null,
            _lastLogin: -1,
            _dataGuard: [1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      userId = resultUser._id;

      await this.companyModel.findOneAndUpdate(
        { _email: 'ajc@gmail.com' },
        {
          $setOnInsert: {
            _name: 'AJC',
            _place: 'Malappuram',
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.coloursModel.findOneAndUpdate(
        { _hexCode: '0xFFFFFF', _hexCodeSecond: '', _type: 0 },
        {
          $setOnInsert: {
            _name: 'White',
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.coloursModel.findOneAndUpdate(
        { _hexCode: '0xFFFFFF', _hexCodeSecond: '', _type: 0 },
        {
          $setOnInsert: {
            _name: 'White',
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.generalsModel.findOneAndUpdate(
        { _code: 1000 },
        {
          $setOnInsert: {
            _string: 'Rs',
            _name: 'currency denominator text',
            _number: -1,
            _vlaueType: 1,
            _json: { basic: 'basic' },
            _type: 2,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.generalsModel.findOneAndUpdate(
        { _code: 1001 },
        {
          $setOnInsert: {
            _string: '₹',
            _number: -1,
            _name: 'currency denominator symbol',
            _json: { basic: 'basic' },
            _vlaueType: 1,
            _type: 2,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.generalsModel.findOneAndUpdate(
        { _code: 1002 },
        {
          $setOnInsert: {
            _string: '',
            _name: 'product floating digit weight',
            _number: 2,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 3,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.generalsModel.findOneAndUpdate(
        { _code: 1003 },
        {
          $setOnInsert: {
            _name: '',
            _string: 'product purity',
            _number: 10,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 3,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.generalsModel.findOneAndUpdate(
        { _code: 1004 },
        {
          $setOnInsert: {
            _name: 'shop credit amount limit percentage',
            _string: '',
            _number: 30,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 1,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.generalsModel.findOneAndUpdate(
        { _code: 1005 },
        {
          $setOnInsert: {
            _name: 'shop credit days limit',
            _string: '',
            _number: 14,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 1,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.generalsModel.findOneAndUpdate(
        { _code: 1006 },
        {
          $setOnInsert: {
            _name: 'tax gold manufacturing tax rate %',
            _string: '',
            _number: 1,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 0,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.generalsModel.findOneAndUpdate(
        { _code: 1007 },
        {
          $setOnInsert: {
            _name: 'tax product CGST %',
            _string: '',
            _number: 1,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 0,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.generalsModel.findOneAndUpdate(
        { _code: 1008 },
        {
          $setOnInsert: {
            _name: 'tax product SGST %',
            _string: '',
            _number: 1,
            _json: { basic: 'basic' },
            _vlaueType: 0,
            _type: 0,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.generalsModel.findOneAndUpdate(
        { _code: 1009 },
        {
          $setOnInsert: {
            _name: 'tax product IGST %',
            _string: '',
            _number: 1,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 0,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.generalsModel.findOneAndUpdate(
        { _code: 1010 },
        {
          $setOnInsert: {
            _name: 'tax holemarking tax %',
            _string: '',
            _number: 1,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 0,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.generalsModel.findOneAndUpdate(
        { _code: 1011 },
        {
          $setOnInsert: {
            _name: 'tax other charge tax %',
            _string: '',
            _number: 1,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 0,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.generalsModel.findOneAndUpdate(
        { _code: 1012 },
        {
          $setOnInsert: {
            _name: 'tax job work tax %',
            _string: '',
            _number: 1,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 0,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.generalsModel.findOneAndUpdate(
        { _code: 1013 },
        {
          $setOnInsert: {
            _name: 'order sale new order suffix',
            _string: 'AJC',
            _vlaueType: 1,
            _number: -1,
            _json: { basic: 'basic' },
            _type: 4,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.generalsModel.findOneAndUpdate(
        { _code: 1014 },
        {
          $setOnInsert: {
            _name: 'order sale new order prefix',
            _string: 'GOLD',
            _number: -1,
            _json: { basic: 'basic' },
            _vlaueType: 1,
            _type: 4,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.generalsModel.findOneAndUpdate(
        { _code: 1015 },
        {
          $setOnInsert: {
            _name: 'order sale new order suffix status',
            _string: '',
            _number: 1,
            _json: { basic: 'basic' },
            _vlaueType: 0,
            _type: 4,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.generalsModel.findOneAndUpdate(
        { _code: 1016 },
        {
          $setOnInsert: {
            _name: 'order sale new order prefix status',
            _string: '',
            _number: 1,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 4,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.generalsModel.findOneAndUpdate(
        { _code: 1017 },
        {
          $setOnInsert: {
            _name: 'order headname prefix',
            _string: 'AJC',
            _number: -1,
            _vlaueType: 1,
            _json: { basic: 'basic' },
            _type: 4,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.generalsModel.findOneAndUpdate(
        { _code: 1018 },
        {
          $setOnInsert: {
            _name: 'photo min respond time',
            _string: '',
            _number: 24,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 3,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.purityModel.findOneAndUpdate(
        { _name: '916' },
        {
          $setOnInsert: {
            _purity: 916,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.purityModel.findOneAndUpdate(
        { _name: '22' },
        {
          $setOnInsert: {
            _purity: 22,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.purityModel.findOneAndUpdate(
        { _name: '18' },
        {
          $setOnInsert: {
            _purity: 18,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.purityModel.findOneAndUpdate(
        { _name: '144' },
        {
          $setOnInsert: {
            _purity: 144,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.departmentModel.findOneAndUpdate(
        { _name: 'Order head' },
        {
          $setOnInsert: {
            _prefix: 'OH',
            _processMasterStatus: 0,
            _code: 1000,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.departmentModel.findOneAndUpdate(
        { _name: 'Sales executive' },
        {
          $setOnInsert: {
            _prefix: 'SE',
            _processMasterStatus: 0,
            _code: 1001,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.departmentModel.findOneAndUpdate(
        { _name: 'Relationship manager' },
        {
          $setOnInsert: {
            _prefix: 'RM',
            _processMasterStatus: 0,
            _code: 1002,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.departmentModel.findOneAndUpdate(
        { _name: 'Worker' },
        {
          $setOnInsert: {
            _prefix: 'WK',
            _processMasterStatus: 1,
            _code: 1003,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.processMastersModel.findOneAndUpdate(
        { _code: 1000 },
        {
          $setOnInsert: {
            _name: 'Master Design',
            _isAutomatic: 0,
            _parentId: null,
            _maxHours: 2,
            _dataGuard: [0, 1, 2],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      /*

  0-category
    1-sub category
    2-stone
    3-agent
    4-branch
    5-employee
    6-supplier
*/

      await this.globalGalleryCategoriesModel.findOneAndUpdate(
        { _name: 'Categories' },
        {
          $setOnInsert: {
            _globalGalleryCategoryId: null,
            _type: 1,
            _dataGuard: [0, 1, 2, 3],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.globalGalleryCategoriesModel.findOneAndUpdate(
        { _name: 'Sub Categories' },
        {
          $setOnInsert: {
            _globalGalleryCategoryId: null,
            _type: 1,
            _dataGuard: [0, 1, 2, 3],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.globalGalleryCategoriesModel.findOneAndUpdate(
        { _name: 'Stones' },
        {
          $setOnInsert: {
            _globalGalleryCategoryId: null,
            _type: 1,
            _dataGuard: [0, 1, 2, 3],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.globalGalleryCategoriesModel.findOneAndUpdate(
        { _name: 'Agents' },
        {
          $setOnInsert: {
            _globalGalleryCategoryId: null,
            _type: 1,
            _dataGuard: [0, 1, 2, 3],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.globalGalleryCategoriesModel.findOneAndUpdate(
        { _name: 'Branches' },
        {
          $setOnInsert: {
            _globalGalleryCategoryId: null,
            _type: 1,
            _dataGuard: [0, 1, 2, 3],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
      await this.globalGalleryCategoriesModel.findOneAndUpdate(
        { _name: 'Employees' },
        {
          $setOnInsert: {
            _globalGalleryCategoryId: null,
            _type: 1,
            _dataGuard: [0, 1, 2, 3],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.globalGalleryCategoriesModel.findOneAndUpdate(
        { _name: 'Suppliers' },
        {
          $setOnInsert: {
            _globalGalleryCategoryId: null,
            _type: 1,
            _dataGuard: [0, 1, 2, 3],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      await this.globalGalleryCategoriesModel.findOneAndUpdate(
        { _name: CommonNames.GLOBAL_GALLERY_SHOP },
        {
          $setOnInsert: {
            _globalGalleryCategoryId: null,
            _type: 1,
            _dataGuard: [0, 1, 2, 3],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: { _status: 1 },
        },
        { upsert: true, new: true, session: transactionSession },
      );
    } else {
      userId = resultCheckUser[0]._id;
    }
    //always work

    await transactionSession.commitTransaction();
    await transactionSession.endSession();

    return { message: 'Success', data: {} };
  }
}
//
