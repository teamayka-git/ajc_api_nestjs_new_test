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
  CheckEmailExistDto,
  CheckMobileExistDto,
  ListFilterLocadingAgentDto,
} from './agent.dto';
const crypto = require('crypto');
import { GlobalConfig } from 'src/config/global_config';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.AGENTS)
    private readonly agentModel: mongoose.Model<Agents>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,

    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async login(dto: AgentLoginDto) {
    var dateTime = new Date().getTime();

    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultEmployee = await this.userModel
        .aggregate([{ $match: { _mobile: dto.mobile } }])
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
      if (resultEmployee[0]._agentId == null) {
        throw new HttpException(
          'Not registered as Agent',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.agentModel.findOneAndUpdate(
        { _id: resultEmployee[0]._agentId },
        { $set: { _lastLogin: dateTime } },
        { new: true, session: transactionSession },
      );

      var resultUser = await this.userModel
        .aggregate([
          {
            $match: {
              _agentId: new mongoose.Types.ObjectId(resultEmployee[0]._agentId),
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
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async create(dto: AgentCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    try {
      var resultUpload = {};
      if (file.hasOwnProperty('image')) {
        resultUpload = await new S3BucketUtils().uploadMyFile(
          file['image'][0],
          UploadedFileDirectoryPath.GLOBAL_GALLERY_AGENT,
        );

        if (resultUpload['status'] == 0) {
          throw new HttpException(
            'File upload error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        // var filePath =
        //   __dirname +
        //   `/../../../public${file['image'][0]['path'].split('public')[1]}`;

        // new ThumbnailUtils().generateThumbnail(
        //   filePath,
        //   UploadedFileDirectoryPath.GLOBAL_GALLERY_AGENT +
        //     new StringUtils().makeThumbImageFileName(
        //       file['image'][0]['filename'],
        //     ),
        // );
      }

      var globalGalleryId = null;
      //globalGalleryAdd
      if (file.hasOwnProperty('image')) {
        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: 1,
            },
          },
          { new: true, session: transactionSession },
        );

        const globalGallery = new this.globalGalleryModel({
          _name: file['image'][0]['originalname'],
          _globalGalleryCategoryId: null,
          _docType: 0,
          _type: 3,
          _uid: resultCounterPurchase._count,
          _url: resultUpload['url'],
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
        var resultGlobalGallery = await globalGallery.save({
          session: transactionSession,
        });

        globalGalleryId = resultGlobalGallery._id;
      }
      var userCheck = await this.userModel.find({
        _email: dto.email,
        _status: { $in: [0, 1] },
      });
      if (userCheck.length != 0) {
        if (userCheck[0]._agentId != null) {
          throw new HttpException(
            'Agent already existing',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.AGENTS },
        {
          $inc: {
            _count: 1,
          },
        },
        { new: true, session: transactionSession },
      );

      var password = '';
      if (dto.password == '') {
          // password = new StringUtils().makeid(6);
          password ="123456";
      } else {
        password = dto.password;
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

      var agentId = new mongoose.Types.ObjectId();
      var resultUserUpdated = await this.userModel.findOneAndUpdate(
        { _email: dto.email },
        {
          $setOnInsert: {
            _password: encryptedPassword,
            _customType: [],
            _halmarkId: null,
            _employeeId: null,
            _shopId: null,
            _supplierId: null,
            _customerId: null,
            _deliveryHubId: null,
            _testCenterId:null,
            _logisticPartnerId:null,
            _fcmId: '',
            _deviceUniqueId: '',
            _permissions: [],
            _userType: 3,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
          },
          $set: {
            _name: dto.name,
            _gender: dto.gender,
            _agentId: agentId,
            _mobile: dto.mobile,
            _globalGalleryId: globalGalleryId,
            _status: 1,
          },
        },
        { upsert: true, new: true, session: transactionSession },
      );

      const newsettingsModel = new this.agentModel({
        _id: agentId,
        _uid: resultCounterPurchase._count,
        _cityId: dto.cityId,
        _lastLogin: 0,
        _userId: resultUserUpdated._id,
        _dataGuard: dto.dataGuard,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });
      var result1 = await newsettingsModel.save({
        session: transactionSession,
      });

      const responseJSON = { message: 'success', data: result1 };
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

  async edit(dto: AgentEditDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultUpload = {};
      if (file.hasOwnProperty('image')) {
        resultUpload = await new S3BucketUtils().uploadMyFile(
          file['image'][0],
          UploadedFileDirectoryPath.GLOBAL_GALLERY_AGENT,
        );

        if (resultUpload['status'] == 0) {
          throw new HttpException(
            'File upload error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        // var filePath =
        //   __dirname +
        //   `/../../../public${file['image'][0]['path'].split('public')[1]}`;

        // new ThumbnailUtils().generateThumbnail(
        //   filePath,
        //   UploadedFileDirectoryPath.GLOBAL_GALLERY_AGENT +
        //     new StringUtils().makeThumbImageFileName(
        //       file['image'][0]['filename'],
        //     ),
        // );
      }

      var updateObject = {
        _name: dto.name,
        _gender: dto.gender,
        _mobile: dto.mobile,
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
      };

      var globalGalleryId = null;
      //globalGalleryAdd
      if (file.hasOwnProperty('image')) {
        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: 1,
            },
          },
          { new: true, session: transactionSession },
        );

        const globalGallery = new this.globalGalleryModel({
          _name: file['image'][0]['originalname'],
          _globalGalleryCategoryId: null,
          _docType: 0,
          _type: 3,
          _uid: resultCounterPurchase._count,
          _url: resultUpload['url'],
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
        var resultGlobalGallery = await globalGallery.save({
          session: transactionSession,
        });

        globalGalleryId = resultGlobalGallery._id;
        updateObject['_globalGalleryId'] = globalGalleryId;
      }

      var result = await this.agentModel.findOneAndUpdate(
        {
          _id: dto.agentId,
        },
        {
          $set: {
            _cityId: dto.cityId,
            _dataGuard: dto.dataGuard,
          },
        },
        { new: true, session: transactionSession },
      );

      await this.userModel.findOneAndUpdate(
        {
          _id: result._userId,
        },
        {
          $set: updateObject,
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

  async list(dto: AgentListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo

        var resultUserSearch = await this.userModel
          .aggregate([
            {
              $match: {
                $or: [
                  { _name: new RegExp(dto.searchingText, 'i') },
                  { _email: dto.searchingText },
                  { _mobile: new RegExp(dto.searchingText, 'i') },
                ],
                _status: { $in: dto.statusArray },
              },
            },
            { $project: { _id: 1 } },
          ])
          .session(transactionSession);

        var userIdsSearch = [];
        resultUserSearch.map((mapItem) => {
          userIdsSearch.push(new mongoose.Types.ObjectId(mapItem._id));
        });

        arrayAggregation.push({
          $match: {
            $or: [{ _userId: { $in: userIdsSearch } }, { _uid: dto.searchingText }],
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

      

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({ $sort: { _status: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _uid: dto.sortOrder } });
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
      if (dto.screenType.includes( 101)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_agentId', '$$userId'] } } },
              ],
              as: 'userDetails',
            },
          },
          {
            $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }

      if (dto.screenType.includes( 50) ) {
        arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
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

      var result = await this.agentModel
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

        var resultTotalCount = await this.agentModel
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

  async listFilterLoadingAgent(dto: ListFilterLocadingAgentDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];
      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      arrayAggregation.push({ $group: { _id: '$_cityId' } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.includes( 100)) {
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

      var result = await this.agentModel
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

        var resultTotalCount = await this.agentModel
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

  async checkEmailExisting(dto: CheckEmailExistDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCount = await this.userModel
        .count({
          _email: dto.value,
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

  async checkMobileExisting(dto: CheckMobileExistDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCount = await this.userModel
        .count({
          _mobile: dto.value,
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
