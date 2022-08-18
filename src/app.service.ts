import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {
  ChangeMyPasswordDto,
  ChangeUserPasswordDto,
  GetUserDto,
  MeDto,
} from './app.dto';
import { CommonNames } from './common/common_names';
import { ModelNames } from './common/model_names';
import { GlobalConfig } from './config/global_config';
import { Categories } from './tableModels/categories.model';
import { Cities } from './tableModels/cities.model';
import { Colours } from './tableModels/colourMasters.model';
import { Company } from './tableModels/companies.model';
import { Counters } from './tableModels/counters.model';
import { Departments } from './tableModels/departments.model';
import { Districts } from './tableModels/districts.model';
import { Employee } from './tableModels/employee.model';
import { Generals } from './tableModels/generals.model';
import { GlobalGalleryCategories } from './tableModels/globalGallerycategories.model';
import { GoldRateTimelines } from './tableModels/gold_rate_timelines.model';
import { GroupMasters } from './tableModels/groupMasters.model';
import { ProcessMaster } from './tableModels/processMaster.model';
import { Purity } from './tableModels/purity.model';
import { RootCausesModel } from './tableModels/rootCause.model';
import { States } from './tableModels/states.model';
import { SubCategories } from './tableModels/sub_categories.model';
import { User } from './tableModels/user.model';
import { UserAttendance } from './tableModels/user_attendances.model';
import { IndexUtils } from './utils/IndexUtils';
import { SmsUtils } from './utils/smsUtils';

const twilioClient = require('twilio')(
  'AC9bf34a6b64db1480be17402f908aded8',
  'e142df6719a87d15b748fcb5dd3f99c9',
);

const crypto = require('crypto');

@Injectable()
export class AppService {
  constructor(
    @InjectModel(ModelNames.ROOT_CAUSES)
    private readonly rootCauseModel: mongoose.Model<RootCausesModel>,
    @InjectModel(ModelNames.USER_ATTENDANCES)
    private readonly userAttendanceModel: mongoose.Model<UserAttendance>,
    @InjectModel(ModelNames.STATES)
    private readonly stateModel: mongoose.Model<States>,
    @InjectModel(ModelNames.GROUP_MASTERS)
    private readonly groupmasterModel: mongoose.Model<GroupMasters>,
    @InjectModel(ModelNames.CATEGORIES)
    private readonly categoryModel: mongoose.Model<Categories>,
    @InjectModel(ModelNames.SUB_CATEGORIES)
    private readonly subCategoryModel: mongoose.Model<SubCategories>,
    @InjectModel(ModelNames.DISTRICTS)
    private readonly districtModel: mongoose.Model<Districts>,
    @InjectModel(ModelNames.CITIES)
    private readonly cityModel: mongoose.Model<Cities>,
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

    @InjectModel(ModelNames.GOLD_RATE_TIMELINES)
    private readonly goldRateTimelinesModel: mongoose.Model<GoldRateTimelines>,
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

  async test() {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var asdf = await twilioClient.messages.create({
        // from:'AJCGOLD',
        body: 'BODYaaabbbd',
        messagingServiceSid: 'MG2d9b32cf7d39a5ceb380fdbb25a80eea',
        to: '+919895680203',
      });

      // new SmsUtils().sendSms("9895680203","AAAAAA");

      const responseJSON = {
        message: 'success',
        data: asdf,
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
  async getDashboard(_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultUserAttendance = await this.userAttendanceModel.aggregate([
        {
          $match: {
            _userId: new mongoose.Types.ObjectId(_userId_),
          },
        },

        { $sort: { _id: -1 } },

        { $limit:1 }
      ]);

      const responseJSON = {
        message: 'success',
        data: {
          listAttendance:resultUserAttendance
        },
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

              {
                $lookup: {
                  from: ModelNames.DEPARTMENT,
                  let: { departmentId: '$_departmentId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$departmentId'] } } },
                  ],
                  as: 'departmentDetails',
                },
              },
              {
                $unwind: {
                  path: '$departmentDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
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

    var listGoldTimelines = await this.goldRateTimelinesModel
      .find({ _status: 1 })
      .sort({ _id: -1 })
      .limit(1);

    var resultCompany = {};
    var resultCompanyList = await this.companyModel.aggregate([
      { $match: { _status: 1 } },

      {
        $lookup: {
          from: ModelNames.CITIES,
          let: { cityId: '$_cityId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$cityId'] } } },

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
          ],
          as: 'cityDetails',
        },
      },
      {
        $unwind: {
          path: '$cityDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (resultCompanyList.length == 0) {
      throw new HttpException(
        'Company not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    resultCompany = resultCompanyList[0];

    await transactionSession.commitTransaction();
    await transactionSession.endSession();

    return {
      message: 'success',
      data: {
        userDetails: resultEmployee[0],
        goldTimelinesList: listGoldTimelines,
        currentDateTime: dateTime,
        company: resultCompany,
      },
    };
  }

  async changeMyPassword(dto: ChangeMyPasswordDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var oldPasswordEncrypted = await crypto
        .pbkdf2Sync(
          dto.oldPassword,
          process.env.CRYPTO_ENCRYPTION_SALT,
          1000,
          64,
          `sha512`,
        )
        .toString(`hex`);

      var oldUser = await this.userModel.find({
        _id: _userId_,
        _password: oldPasswordEncrypted,
      });
      if (oldUser.length == 0) {
        throw new HttpException(
          'Current pasword incorrect',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var newPasswordEncrypted = await crypto
        .pbkdf2Sync(
          dto.newPassword,
          process.env.CRYPTO_ENCRYPTION_SALT,
          1000,
          64,
          `sha512`,
        )
        .toString(`hex`);
      await this.userModel.findOneAndUpdate(
        {
          _id: _userId_,
        },
        {
          $set: {
            _password: newPasswordEncrypted,
          },
        },
        { new: true, session: transactionSession },
      );

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

  async changeUserPassword(dto: ChangeUserPasswordDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var newPasswordEncrypted = await crypto
        .pbkdf2Sync(
          dto.newPassword,
          process.env.CRYPTO_ENCRYPTION_SALT,
          1000,
          64,
          `sha512`,
        )
        .toString(`hex`);
      await this.userModel.findOneAndUpdate(
        {
          _id: dto.userId,
        },
        {
          $set: {
            _password: newPasswordEncrypted,
          },
        },
        { new: true, session: transactionSession },
      );

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

      if (dto.screenType.includes(50)) {
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
      if (dto.screenType.includes(100)) {
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

        if (dto.screenType.includes(108)) {
          arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
            {
              $lookup: {
                from: ModelNames.DEPARTMENT,
                let: { departmentId: '$_departmentId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$departmentId'] } } },
                ],
                as: 'departmentDetails',
              },
            },
            {
              $unwind: {
                path: '$departmentDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
          );
        }

        if (dto.screenType.includes(109)) {
          arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
            {
              $lookup: {
                from: ModelNames.PROCESS_MASTER,
                let: { processMasterId: '$_processMasterId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$processMasterId'] } } },
                ],
                as: 'processMasterDetails',
              },
            },
            {
              $unwind: {
                path: '$processMasterDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
          );
        }
      }
      if (dto.screenType.includes(101)) {
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

        if (dto.screenType.includes(110)) {
          arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
            {
              $lookup: {
                from: ModelNames.CITIES,
                let: { cityId: '$_cityId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$cityId'] } } },
                ],
                as: 'cityDetails',
              },
            },
            {
              $unwind: {
                path: '$cityDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
          );
        }
      }
      if (dto.screenType.includes(102)) {
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
        if (dto.screenType.includes(111)) {
          arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
            {
              $lookup: {
                from: ModelNames.CITIES,
                let: { cityId: '$_cityId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$cityId'] } } },
                ],
                as: 'cityDetails',
              },
            },
            {
              $unwind: {
                path: '$cityDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
          );
        }
      }
      if (dto.screenType.includes(107)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.TEST_CENTER_MASTERS,
              let: { testCenterId: '$_testCenterId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$testCenterId'] } } },
              ],
              as: 'testCenterDetails',
            },
          },
          {
            $unwind: {
              path: '$testCenterDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.includes(112)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.LOGISTICS_PARTNERS,
              let: { logisticsPartnerId: '$_logisticPartnerId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$logisticsPartnerId'] } },
                },
              ],
              as: 'logisticsPartnerDetails',
            },
          },
          {
            $unwind: {
              path: '$logisticsPartnerDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(103)) {
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

      if (dto.screenType.includes(104)) {
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

      if (dto.screenType.includes(105)) {
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

      if (dto.screenType.includes(106)) {
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
        { _tableName: ModelNames.ORDER_SALES_MAIN },
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
      await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.GOLD_TESTING_REQUESTS },
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
        { _tableName: ModelNames.PHOTOGRAPHER_REQUESTS },
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
        { _tableName: ModelNames.DELIVERY },
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
        { _tableName: ModelNames.DELIVERY_RETURN },
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
        { _email: 'apkashraf@gmail.com' },
        {
          $setOnInsert: {
            _name: 'super admin',
            _gender: 0,
            _password: encryptedPassword,
            _mobile: '9961005004',
            _globalGalleryId: null,
            _employeeId: employeeId,
            _agentId: null,
            _supplierId: null,
            _testCenterId: null,
            _logisticPartnerId: null,
            _shopId: null,
            _customType: [],
            _halmarkId: null,
            _customerId: null,
            _deliveryHubId: null,
            _fcmId: '',
            _deviceUniqueId: '',
            _permissions: GlobalConfig().SUPER_ADMIN_PERMISSIONS,
            _userType: 0,
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

      var resultGroup = await this.groupmasterModel.findOneAndUpdate(
        {
          _name: '22K GOLD',
        },
        {
          $setOnInsert: {
            _rawMaterialStatus: 1,
            _hsnCode: '7113',
            _descriptionArray: [],
            _meltingPurity: 91.75,
            _taxPercentage: 3,
            _purity: 92,
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

      var resultCategory = await this.categoryModel.findOneAndUpdate(
        {
          _code: 1,
        },
        {
          $setOnInsert: {
            name: 'PLANE ORNAMENTS',
            _description: '',
            _groupId: resultGroup._id,
            _globalGalleryId: null,

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

      var resultSubCategory = await this.subCategoryModel.findOneAndUpdate(
        {
          _code: 1,
        },
        {
          $setOnInsert: {
            name: 'PLANE RING',
            _description: '',
            _categoryId: resultCategory._id,
            _hmSealing: 1,
            _defaultValueAdditionPercentage: 4,
            _rewardPoint: 1,
            _globalGalleryId: null,
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

      await this.rootCauseModel.findOneAndUpdate(
        { _name: 'Not as per requirement' },
        {
          $setOnInsert: {
            _type: [0, 1, 2, 3, 4],
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

      var resultState = await this.stateModel.findOneAndUpdate(
        { _code: 1 },
        {
          $setOnInsert: {
            _name: 'KERALA',
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
      var resultDistrict = await this.districtModel.findOneAndUpdate(
        { _code: 10 },
        {
          $setOnInsert: {
            _name: 'MALAPPURAM',
            _statesId: resultState._id,
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
      var resultCity = await this.cityModel.findOneAndUpdate(
        { _code: 1 },
        {
          $setOnInsert: {
            _name: 'MALAPPURAM',
            _districtsId: resultDistrict._id,
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

      await this.companyModel.findOneAndUpdate(
        { _email: 'ajc@gmail.com' },
        {
          $setOnInsert: {
            _name: 'AJC JEWEL MANUFACTURERS PVT LTD',
            _place: 'MALAPPURAM',
            _phone: '+91 9961005004',
            _address:
              '38/227-Z, INKEL GREENS EDU CITY, KARATHODE - KONAMPPARA ROAD, PANAKKAD VILLAGE , MALAPPURAM DT 676519',
            _pan: 'AAJCP7687C',
            _cin: 'U93090KL2018PTC052621',
            _gst: '32AAJCP7687C128',
            _cityId: resultCity._id,
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
      await this.coloursModel.findOneAndUpdate(
        { _hexCode: '0xFFFFFF', _hexCodeSecond: '', _type: 0 },
        {
          $setOnInsert: {
            _name: 'White',
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

      await this.generalsModel.findOneAndUpdate(
        { _code: 100 },
        {
          $setOnInsert: {
            _string: '',
            _name: 'Mobile Employee application Build number',
            _number: 1,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 7,
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
        { _code: 101 },
        {
          $setOnInsert: {
            _string: '',
            _name: 'Mobile Customer application Build number',
            _number: 1,
            _vlaueType: 0,
            _json: { basic: 'basic' },
            _type: 7,
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
      await this.generalsModel.findOneAndUpdate(
        { _code: 1019 },
        {
          $setOnInsert: {
            _name: 'invoice template',
            _string: '',
            _number: 0,
            _vlaueType: 2,
            _json: {
              item: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                19, 20, 21, 22,
              ],
            },
            _type: 5,
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

      await this.generalsModel.findOneAndUpdate(
        { _code: 1020 },
        {
          $setOnInsert: {
            _name: 'Halmarking charge',
            _string: '',
            _number: 30,
            _vlaueType: 0,
            _json: { basic: 'Basic' },
            _type: 3,
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

      await this.generalsModel.findOneAndUpdate(
        { _code: 1021 },
        {
          $setOnInsert: {
            _name: 'General tax',
            _string: '',
            _number: 10,
            _vlaueType: 0,
            _json: { basic: 'Basic' },
            _type: 0,
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
      await this.generalsModel.findOneAndUpdate(
        { _code: 1022 },
        {
          $setOnInsert: {
            _name: 'Order maximum due date count',
            _string: '',
            _number: 7,
            _vlaueType: 0,
            _json: { basic: 'Basic' },
            _type: 4,
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
      await this.generalsModel.findOneAndUpdate(
        { _code: 1023 },
        {
          $setOnInsert: {
            _name: 'Invoice prefix',
            _string: 'IN',
            _number: -1,
            _vlaueType: 1,
            _json: { basic: 'Basic' },
            _type: 5,
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

      await this.purityModel.findOneAndUpdate(
        { _name: '916' },
        {
          $setOnInsert: {
            _purity: 916,
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

      await this.purityModel.findOneAndUpdate(
        { _name: '22' },
        {
          $setOnInsert: {
            _purity: 22,
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

      await this.purityModel.findOneAndUpdate(
        { _name: '18' },
        {
          $setOnInsert: {
            _purity: 18,
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

      await this.purityModel.findOneAndUpdate(
        { _name: '144' },
        {
          $setOnInsert: {
            _purity: 144,
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

      await this.departmentModel.findOneAndUpdate(
        { _name: 'Order head' },
        {
          $setOnInsert: {
            _prefix: 'OH',
            _processMasterStatus: 0,
            _code: 1000,
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

      await this.departmentModel.findOneAndUpdate(
        { _name: 'Sales executive' },
        {
          $setOnInsert: {
            _prefix: 'SE',
            _processMasterStatus: 0,
            _code: 1001,
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

      await this.departmentModel.findOneAndUpdate(
        { _name: 'Relationship manager' },
        {
          $setOnInsert: {
            _prefix: 'RM',
            _processMasterStatus: 0,
            _code: 1002,
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

      await this.departmentModel.findOneAndUpdate(
        { _name: 'Worker' },
        {
          $setOnInsert: {
            _prefix: 'WK',
            _processMasterStatus: 1,
            _code: 1003,
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

      await this.departmentModel.findOneAndUpdate(
        { _name: 'Photographer' },
        {
          $setOnInsert: {
            _prefix: 'PG',
            _processMasterStatus: 0,
            _code: 1004,
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
      await this.departmentModel.findOneAndUpdate(
        { _name: 'Delivery' },
        {
          $setOnInsert: {
            _prefix: 'DV',
            _processMasterStatus: 0,
            _code: 1005,
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

      await this.processMastersModel.findOneAndUpdate(
        { _code: 1000 },
        {
          $setOnInsert: {
            _name: 'Master Design',
            _isAutomatic: 0,
            _parentId: null,
            _maxHours: 2,
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
