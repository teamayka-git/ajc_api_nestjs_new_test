import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CheckEmailExistDto,
  EmployeeCreateDto,
  EmployeeEditDto,
  EmployeeListDto,
  EmployeeLoginDto,
  EmployeeStatusChangeDto,
} from './employees.dto';
import * as mongoose from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { User } from 'src/tableModels/user.model';
import { Employee } from 'src/tableModels/employee.model';
import { Counters } from 'src/tableModels/counters.model';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { StringUtils } from 'src/utils/string_utils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
const crypto = require('crypto');

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
    @InjectModel(ModelNames.EMPLOYEES)
    private readonly employeeModel: mongoose.Model<Employee>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async login(dto: EmployeeLoginDto) {
    var dateTime = new Date().getTime();

    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultEmployee = await this.employeeModel
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

      await this.employeeModel.findOneAndUpdate(
        { _id: resultEmployee[0]._id },
        { $set: { _lastLogin: dateTime } },
        { new: true, session: transactionSession },
      );

      var resultUser = await this.userModel
        .aggregate([
          {
            $match: {
              _employeeId: new mongoose.Types.ObjectId(resultEmployee[0]._id),
              _type: 0,
              _status: 1,
            },
          },

          { $sort: { _id: -1 } },
          {
            $lookup: {
              from: ModelNames.EMPLOYEES,
              let: { employeeId: '$_employeeId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$employeeId'] } } },
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
  async create(dto: EmployeeCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      if (file.hasOwnProperty('image')) {
        var filePath =
          __dirname +
          `/../../../public${file['image'][0]['path'].split('public')[1]}`;

        new ThumbnailUtils().generateThumbnail(
          filePath,
          UploadedFileDirectoryPath.GLOBAL_GALLERY_EMPLOYEE +
            new StringUtils().makeThumbImageFileName(
              file['image'][0]['filename'],
            ),
        );
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
          __name: file['image'][0]['originalname'],
          _globalGalleryCategoryId: null,
          _docType: 0,
          _type: 5,
          _uid: resultCounterPurchase._count,
          _url: `${process.env.SSL == 'true' ? 'https' : 'http'}://${
            process.env.SERVER_DOMAIN
          }:${process.env.PORT}${file['image'][0]['path'].split('public')[1]}`,
          _thumbUrl: new StringUtils().makeThumbImageFileName(
            `${process.env.SSL == 'true' ? 'https' : 'http'}://${
              process.env.SERVER_DOMAIN
            }:${process.env.PORT}${
              file['image'][0]['path'].split('public')[1]
            }`,
          ),
          _created_user_id: _userId_,
          _created_at: dateTime,
          _updated_user_id: null,
          _updated_at: -1,
          _status: 1,
        });
        var resultGlobalGallery = await globalGallery.save({
          session: transactionSession,
        });

        globalGalleryId = resultGlobalGallery._id;
      }

      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.EMPLOYEES },
        {
          $inc: {
            _count: 1,
          },
        },
        { new: true, session: transactionSession },
      );

      var password = '';
      if (dto.password == '') {
        password = new StringUtils().makeid(6);
      }else{
        password=dto.password;
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

      const newsettingsModel = new this.employeeModel({
        _name: dto.name,
        _gender: dto.gender,
        _email: dto.email,
        _password: encryptedPassword,
        _mobile: dto.mobile,
        _uid: resultCounterPurchase._count,
        _lastLogin: 0,
        _globalGalleryId: globalGalleryId,
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
      const userModel = new this.userModel({
        _type: 0,
        _employeeId: result1._id,
        _agentId: null,
        _supplierId: null,
        _fcmId: '',
        _deviceUniqueId: '',
        _permissions: [],
        _userRole: 3,
        _created_user_id: _userId_,
        _created_at: dateTime,
        _updated_user_id: null,
        _updated_at: -1,
        _status: 1,
      });
      await userModel.save({
        session: transactionSession,
      });

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: 'success', data: result1 };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async edit(dto: EmployeeEditDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      if (file.hasOwnProperty('image')) {
        var filePath =
          __dirname +
          `/../../../public${file['image'][0]['path'].split('public')[1]}`;

        new ThumbnailUtils().generateThumbnail(
          filePath,
          UploadedFileDirectoryPath.GLOBAL_GALLERY_EMPLOYEE +
            new StringUtils().makeThumbImageFileName(
              file['image'][0]['filename'],
            ),
        );
      }

      var updateObject = {
        _name: dto.name,
        _gender: dto.gender,
        _mobile: dto.mobile,
        __dataGuard: dto.dataGuard,
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
          __name: file['image'][0]['originalname'],
          _globalGalleryCategoryId: null,
          _docType: 0,
          _type: 5,
          _uid: resultCounterPurchase._count,
          _url: `${process.env.SSL == 'true' ? 'https' : 'http'}://${
            process.env.SERVER_DOMAIN
          }:${process.env.PORT}${file['image'][0]['path'].split('public')[1]}`,
          _thumbUrl: new StringUtils().makeThumbImageFileName(
            `${process.env.SSL == 'true' ? 'https' : 'http'}://${
              process.env.SERVER_DOMAIN
            }:${process.env.PORT}${
              file['image'][0]['path'].split('public')[1]
            }`,
          ),
          _created_user_id: _userId_,
          _created_at: dateTime,
          _updated_user_id: null,
          _updated_at: -1,
          _status: 1,
        });
        var resultGlobalGallery = await globalGallery.save({
          session: transactionSession,
        });

        globalGalleryId = resultGlobalGallery._id;
        updateObject['_globalGalleryId'] = globalGalleryId;
      }

      var result = await this.employeeModel.findOneAndUpdate(
        {
          _id: dto.employeeId,
        },
        {
          $set: updateObject,
        },
        { new: true, session: transactionSession },
      );

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: 'success', data: result };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async status_change(dto: EmployeeStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.employeeModel.updateMany(
        {
          _id: { $in: dto.employeeIds },
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

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: 'success', data: result };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async list(dto: EmployeeListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
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
      if (dto.employeeIds.length > 0) {
        var newSettingsId = [];
        dto.employeeIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.genders.length > 0) {
        arrayAggregation.push({ $match: { _gender: { $in: dto.genders } } });
      }

      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({ $sort: { _status: dto.sortOrder } });
          break;
        case 2:
          arrayAggregation.push({ $sort: { _name: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _uid: dto.sortOrder } });
          break;
      }

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
              from: ModelNames.USER,
              let: { employeeId: '$_id' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_employeeId', '$$employeeId'] } },
                },
                { $project: { _id: 1 } },
              ],
              as: 'userDetails',
            },
          },
          {
            $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }

      var result = await this.employeeModel
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

        var resultTotalCount = await this.employeeModel
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
    var resultCount = await this.employeeModel
      .count({ _email: dto.value,_status:{$in:[1,0]} })
      .session(transactionSession);

    await transactionSession.commitTransaction();
    await transactionSession.endSession();
    return {
      message: 'success',
      data: { count: resultCount },
    };
  } catch (error) {
    await transactionSession.abortTransaction();
    await transactionSession.endSession();
    throw error;
  }
}
}
