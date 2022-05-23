import { HttpException, HttpStatus, Injectable, Session } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { Counters } from 'src/tableModels/counters.model';
import { Shops } from 'src/tableModels/shops.model';
import { User } from 'src/tableModels/user.model';
import * as mongoose from 'mongoose';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';

import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { StringUtils } from 'src/utils/string_utils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { GlobalGalleryCategories } from 'src/tableModels/globalGallerycategories.model';
import { CommonNames } from 'src/common/common_names';
import { GlobalConfig } from 'src/config/global_config';
const crypto = require('crypto');

import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import {
  CheckEmailExistDto,
  CheckMobileExistDto,
  ListShopDto,
  ShopAcrossEmployeesAndCustomersDto,
  ShopAddRemoveCustomerDto,
  ShopAddRemoveUsersDto,
  ShopCreateDto,
  ShopEditeDto,
  ShopLoginDto,
} from './shops.dto';
import { Customers } from 'src/tableModels/customers.model';
import { Generals } from 'src/tableModels/generals.model';
@Injectable()
export class ShopsService {
  constructor(
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.SHOPS)
    private readonly shopsModel: mongoose.Model<Shops>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectModel(ModelNames.GENERALS)
    private readonly generalsModel: mongoose.Model<Generals>,
    @InjectModel(ModelNames.CUSTOMERS)
    private readonly customersModel: mongoose.Model<Customers>,

    @InjectModel(ModelNames.GLOBAL_GALLERY_CATEGORIES)
    private readonly globalGalleryCategoriesModel: mongoose.Model<GlobalGalleryCategories>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async login(dto: ShopLoginDto) {
    var dateTime = new Date().getTime();

    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultEmployee = await this.userModel
        .aggregate([{ $match: { _email: dto.email } }])
        .session(transactionSession);
      console.log('___shop login ' + JSON.stringify(resultEmployee));
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
      if (resultEmployee[0]._shopId == null) {
        throw new HttpException(
          'Not registered as Shop',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.shopsModel.findOneAndUpdate(
        { _id: resultEmployee[0]._shopId },
        { $set: { _lastLogin: dateTime } },
        { new: true, session: transactionSession },
      );

      var resultUser = await this.userModel
        .aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(resultEmployee[0]._id),
              _status: 1,
            },
          },

          { $sort: { _id: -1 } },
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$shopId'] } } },
                { $project: { _password: 0 } },
              ],
              as: 'shopDetails',
            },
          },
          {
            $unwind: {
              path: '$shopDetails',
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

  async create(dto: ShopCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    try {
      var resultUpload = {};
      if (file.hasOwnProperty('image')) {
        // var filePath =
        //   __dirname +
        //   `/../../../public${file['image'][0]['path'].split('public')[1]}`;

        //   new ThumbnailUtils().generateThumbnail(filePath,  UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP +
        //     new StringUtils().makeThumbImageFileName(
        //       file['image'][0]['filename'],
        //     ));

        resultUpload = await new S3BucketUtils().uploadMyFile(
          file['image'][0],
          UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP,
        );

        if (resultUpload['status'] == 0) {
          throw new HttpException(
            'File upload error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
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
          _type: 7,
          _uid: resultCounterPurchase._count,
          _url: resultUpload['url'],
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
      var arrayToUsers = [];
      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.SHOPS },
        {
          $inc: {
            _count: 1,
          },
        },
        { new: true, session: transactionSession },
      );

      var shopId = new mongoose.Types.ObjectId();

      const newsettingsModel = new this.shopsModel({
        _id: shopId,
        _name: dto.name,
        _uid: resultCounterPurchase._count,
        _globalGalleryId: globalGalleryId,
        _orderSaleRate: dto.orderSaleRate,
        _stockSaleRate: dto.stockSaleRate,
        _shopType: dto.shopType,
        _commisionType: dto.commisionType,
        _branchId: dto.branchId,
        _orderHeadId: dto.orderHeadId,
        _relationshipManagerId: dto.relationshipManagerId,
        _isSupplier: dto.isSupplier,
        _panCardNumber: dto.panCardNumber,
        _billingModeSale: dto.billingModeSale,
        _billingModePurchase: dto.billingModePurchase,
        _hallmarkingMandatoryStatus: dto.hallmarkingMandatoryStatus,
        _rateCardId: dto.rateCardId,
        _gstNumber: dto.gstNumber,
        _tdsTcsStatus: dto.tdsTcsStatus,
        _cityId: dto.cityId,
        _tdsId: dto.tdsId == 'nil' || dto.tdsId == '' ? null : dto.tdsId,
        _tcsId: dto.tcsId == 'nil' || dto.tcsId == '' ? null : dto.tcsId,
        _creditAmount: dto.creditAmount,
        _creditDays: dto.creditDays,
        _rateBaseMasterId: dto.rateBaseMasterId,
        _stonePricing: dto.stonePricing,
        _chatPermissions: dto.chatPermissions,
        _agentId:
          dto.agentId == 'nil' || dto.agentId == '' ? null : dto.agentId,
        _agentCommision: dto.agentCommision,
        _location: { type: 'Point', coordinates: dto.location },

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

      if (dto.arrayUserIdsEsixting.length > 0) {
        await this.userModel.updateMany(
          {
            _id: { $in: dto.arrayUserIdsEsixting },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _shopId: shopId,
            },
          },
          { new: true, session: transactionSession },
        );
      }
      if (dto.arrayUsersNew.length > 0) {
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
            _supplierId: null,
            _deliveryHubId: null,
            _shopId: shopId,
            _customType: mapItem.customType,
            _halmarkId: null,
            _customerId: null,
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

      var encryptedPasswordShop = await crypto
        .pbkdf2Sync(
          '123456',
          process.env.CRYPTO_ENCRYPTION_SALT,
          1000,
          64,
          `sha512`,
        )
        .toString(`hex`);
      arrayToUsers.push({
        _email: dto.email,
        _name: dto.name,
        _gender: dto.gender,
        _password: encryptedPasswordShop,
        _mobile: dto.mobile,
        _globalGalleryId: globalGalleryId,
        _employeeId: null,
        _agentId: null,
        _supplierId: null,
        _shopId: shopId,
        _customType: 5,
        _deliveryHubId: null,
        _halmarkId: null,
        _customerId: null,
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

      var globalGalleryManinCategoryForShop =
        await this.globalGalleryCategoriesModel
          .find(
            {
              _status: 1,
              _name: CommonNames.GLOBAL_GALLERY_SHOP,
              _type: 1,
            },
            { _id: 1 },
          )
          .session(transactionSession);
      if (globalGalleryManinCategoryForShop.length == 0) {
        throw new HttpException(
          'Global gallery category not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var globalGalleryCategory = new this.globalGalleryCategoriesModel({
        _name: dto.name,
        _globalGalleryCategoryId: globalGalleryManinCategoryForShop[0]._id,
        _dataGuard: [0, 1, 2],
        _type: 2,
        _createdUserId: null,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });

      var globalGallerySpecificShop = await globalGalleryCategory.save({
        session: transactionSession,
      });

      var globalGalleryCategoryProducts = new this.globalGalleryCategoriesModel(
        {
          _name: CommonNames.GLOBAL_GALLERY_SHOP_PRODUCTS,
          _globalGalleryCategoryId: globalGallerySpecificShop._id,
          _dataGuard: [0, 1, 2],
          _type: 2,
          _createdUserId: null,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        },
      );

      await globalGalleryCategoryProducts.save({
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

  async edit(dto: ShopEditeDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      // if (file.hasOwnProperty('image')) {
      // var filePath =
      //   __dirname +
      //   `/../../../public${file['image'][0]['path'].split('public')[1]}`;
      //   new ThumbnailUtils().generateThumbnail(filePath,  UploadedFileDirectoryPath.GLOBAL_GALLERY_AGENT +
      //     new StringUtils().makeThumbImageFileName(
      //       file['image'][0]['filename'],
      //     ));
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
      }
      // }

      var objShop = {
        _name: dto.name,
        _orderSaleRate: dto.orderSaleRate,
        _stockSaleRate: dto.stockSaleRate,
        _shopType: dto.shopType,
        _location: dto.location,
        _branchId: dto.branchId,
        _orderHeadId: dto.orderHeadId,
        _relationshipManagerId: dto.relationshipManagerId,
        _isSupplier: dto.isSupplier,
        _commisionType: dto.commisionType,
        _panCardNumber: dto.panCardNumber,
        _billingModeSale: dto.billingModeSale,
        _billingModePurchase: dto.billingModePurchase,
        _hallmarkingMandatoryStatus: dto.hallmarkingMandatoryStatus,
        _rateCardId: dto.rateCardId,
        _gstNumber: dto.gstNumber,
        _cityId: dto.cityId,
        _tdsTcsStatus: dto.tdsTcsStatus,
        _tdsId: dto.tdsId == 'nil' || dto.tdsId == '' ? null : dto.tdsId,
        _tcsId: dto.tcsId == 'nil' || dto.tcsId == '' ? null : dto.tcsId,
        _creditAmount: dto.creditAmount,
        _creditDays: dto.creditDays,
        _rateBaseMasterId: dto.rateBaseMasterId,
        _stonePricing: dto.stonePricing,
        _chatPermissions: dto.chatPermissions,
        _agentId: dto.agentId,
        _agentCommision: dto.agentCommision,
        _dataGuard: dto.dataGuard,
      };
      var objUser = {
        _email: dto.email,
        _name: dto.name,
        _gender: dto.gender,
        _mobile: dto.mobile,
      };
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
          _type: 7,
          _uid: resultCounterPurchase._count,
          _url: resultUpload['url'],
          _created_user_id: _userId_,
          _created_at: dateTime,
          _updated_user_id: null,
          _updated_at: -1,
          _status: 1,
        });
        var resultGlobalGallery = await globalGallery.save({
          session: transactionSession,
        });

        objShop['_globalGalleryId'] = resultGlobalGallery._id;
        objUser['_globalGalleryId'] = resultGlobalGallery._id;
      }

      var result = await this.shopsModel.findOneAndUpdate(
        {
          _id: dto.shopId,
        },
        {
          $set: objShop,
        },
        { new: true, session: transactionSession },
      );

      await this.userModel.findOneAndUpdate(
        {
          _shopId: dto.shopId,
          _customType: 5,
        },
        {
          $set: objUser,
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
              _shopId: dto.shopUserId,
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
              _shopId: dto.shopUserId,
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
            _supplierId: null,
            _shopId: dto.shopUserId,
            _customType: 4,
            _halmarkId: null,
            _deliveryHubId: null,
            _fcmId: '',
            _customerId: null,
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
      // if (oldShopName != dto.name) {
      //   var globalGalleryManinCategoryForShop =
      //     await this.globalGalleryCategoriesModel
      //       .find(
      //         {
      //           _status: 1,
      //           _name: CommonNames.GLOBAL_GALLERY_SHOP,
      //           _type: 1,
      //         },
      //         { _id: 1 },
      //       )
      //       .session(transactionSession);
      //   if (globalGalleryManinCategoryForShop.length == 0) {
      //     throw new HttpException(
      //       'Global gallery category not found',
      //       HttpStatus.INTERNAL_SERVER_ERROR,
      //     );
      //   }
      //   await this.globalGalleryCategoriesModel.findOneAndUpdate(
      //     {
      //       _name: oldShopName,
      //       _globalGalleryCategoryId:
      //         globalGalleryManinCategoryForShop[0]._id,
      //       _status: 1,
      //     },
      //     { $set: { _name: dto.name } },
      //     { new: true, session: transactionSession },
      //   );
      // }

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

  async list(dto: ListShopDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo

        // var resultUserSearch = await this.userModel
        //   .aggregate([
        //     {
        //       $match: {
        //         $or: [
        //           { _name: new RegExp(dto.searchingText, 'i') },
        //           { _email: dto.searchingText },
        //           { _mobile: new RegExp(dto.searchingText, 'i') },
        //         ],
        //         _status: { $in: dto.statusArray },
        //       },
        //     },
        //     { $project: { _id: 1 } },
        //   ])
        //   .session(transactionSession);

        // var userIdsSearch = [];
        // resultUserSearch.map((mapItem) => {
        //   userIdsSearch.push(new mongoose.Types.ObjectId(mapItem._id));
        // });

        arrayAggregation.push({
          $match: {
            $or: [
              // { _id: { $in: userIdsSearch } },
              { _uid: dto.searchingText },
              { _name: new RegExp(dto.searchingText, 'i') },
              { _panCardNumber: dto.searchingText },
              { _gstNumber: dto.searchingText },
            ],
          },
        });
      }

      if (dto.shopIds.length > 0) {
        var newSettingsId = [];
        dto.shopIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.orderSaleRates.length > 0) {
        arrayAggregation.push({
          $match: { _orderSaleRate: { $in: dto.orderSaleRates } },
        });
      }

      if (dto.commisionType.length > 0) {
        arrayAggregation.push({
          $match: { _commisionType: { $in: dto.commisionType } },
        });
      }
      if (dto.stockSaleRates.length > 0) {
        arrayAggregation.push({
          $match: { _stockSaleRate: { $in: dto.stockSaleRates } },
        });
      }
      if (dto.shopTypes.length > 0) {
        arrayAggregation.push({
          $match: { _shopType: { $in: dto.shopTypes } },
        });
      }

      if (dto.isSupplier.length > 0) {
        arrayAggregation.push({
          $match: { _isSupplier: { $in: dto.isSupplier } },
        });
      }
      if (dto.billingModelSales.length > 0) {
        arrayAggregation.push({
          $match: { _billingModeSale: { $in: dto.billingModelSales } },
        });
      }
      if (dto.billingModelPurchases.length > 0) {
        arrayAggregation.push({
          $match: { _billingModePurchase: { $in: dto.billingModelPurchases } },
        });
      }
      if (dto.hallmarkingMandatoryStatuses.length > 0) {
        arrayAggregation.push({
          $match: {
            _hallmarkingMandatoryStatus: {
              $in: dto.hallmarkingMandatoryStatuses,
            },
          },
        });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({ $sort: { _status: dto.sortOrder } });
          break;

        case 2:
          arrayAggregation.push({ $sort: { _uid: dto.sortOrder } });
          break;

        case 3:
          arrayAggregation.push({ $sort: { _orderSaleRate: dto.sortOrder } });
          break;
        case 4:
          arrayAggregation.push({ $sort: { _stockSaleRate: dto.sortOrder } });
          break;
        case 5:
          arrayAggregation.push({ $sort: { _shopType: dto.sortOrder } });
          break;
        case 6:
          arrayAggregation.push({ $sort: { _billingModeSale: dto.sortOrder } });
          break;
        case 7:
          arrayAggregation.push({
            $sort: { _billingModePurchase: dto.sortOrder },
          });
          break;
        case 8:
          arrayAggregation.push({
            $sort: { _hallmarkingMandatoryStatus: dto.sortOrder },
          });
          break;
        case 9:
          arrayAggregation.push({ $sort: { _creditAmount: dto.sortOrder } });
          break;
        case 10:
          arrayAggregation.push({ $sort: { _creditDays: dto.sortOrder } });
          break;
        case 11:
          arrayAggregation.push({ $sort: { _stonePricing: dto.sortOrder } });
          break;
        case 12:
          arrayAggregation.push({ $sort: { _agentCommision: dto.sortOrder } });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.findIndex((it) => it == 111) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    _customType: 5,
                    $expr: { $eq: ['$_shopId', '$$userId'] },
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
      if (dto.screenType.findIndex((it) => it == 50) != -1) {
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
      if (dto.screenType.findIndex((it) => it == 100) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.BRANCHES,
              let: { branchId: '$_branchId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$branchId'] } } },
              ],
              as: 'branchDetails',
            },
          },
          {
            $unwind: {
              path: '$branchDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.findIndex((it) => it == 104) != -1) {
        arrayAggregation.push(
          {
            $lookup: { 
              from: ModelNames.RATE_CARDS,
              let: { rateCardId: '$_rateCardId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$rateCardId'] } } },
              ],
              as: 'rateCardDetails',
            },
          },
          {
            $unwind: {
              path: '$rateCardDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );


        if (dto.screenType.findIndex((it) => it == 112) != -1) {
          arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
            {
              $lookup: {
                from: ModelNames.RATE_CARD_PERCENTAGESS,
                let: { ratecardIdId: '$_id' },
                pipeline: [{ $match: { $expr: { $eq: ['$_rateCardId', '$$ratecardId'] } } },
              
              
              
                {
                  $lookup: { 
                    from: ModelNames.SUB_CATEGORIES,
                    let: { subCategoryId: '$_subCategoryId' },
                    pipeline: [
                      { $match: { $expr: { $eq: ['$_id', '$$subCategoryId'] } } },
                    ],
                    as: 'subCategoryDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$subCategoryDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              
              
              ],
                as: 'rateCardPercentages',
              },
            },
            
          );
        }

      }

      if (dto.screenType.findIndex((it) => it == 106) != -1) {
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
      if (dto.screenType.findIndex((it) => it == 107) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.TDS_MASTERS,
              let: { tdsId: '$_tdsId' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$tdsId'] } } }],
              as: 'tdsDetails',
            },
          },
          {
            $unwind: { path: '$tdsDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }
      if (dto.screenType.findIndex((it) => it == 108) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.TCS_MASTERS,
              let: { tcsId: '$_tcsId' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$tcsId'] } } }],
              as: 'tcsDetails',
            },
          },
          {
            $unwind: { path: '$tcsDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }
      if (dto.screenType.findIndex((it) => it == 109) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.RATE_BASE_MASTERS,
              let: { ratebaseId: '$_rateBaseMasterId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$ratebaseId'] } } },
              ],
              as: 'ratebaseMasterDetails',
            },
          },
          {
            $unwind: {
              path: '$ratebaseMasterDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.findIndex((it) => it == 101) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_orderHeadId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$userId'] },
                  },
                },

                {
                  $lookup: {
                    from: ModelNames.GLOBAL_GALLERIES,
                    let: { globalGalleryId: '$_globalGalleryId' },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ['$_id', '$$globalGalleryId'] },
                        },
                      },
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
              ],
              as: 'orderHeadDetails',
            },
          },
          {
            $unwind: {
              path: '$orderHeadDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.findIndex((it) => it == 102) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_relationshipManagerId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$userId'] },
                  },
                },

                {
                  $lookup: {
                    from: ModelNames.GLOBAL_GALLERIES,
                    let: { globalGalleryId: '$_globalGalleryId' },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ['$_id', '$$globalGalleryId'] },
                        },
                      },
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
              ],
              as: 'relationshipManagerDetails',
            },
          },
          {
            $unwind: {
              path: '$relationshipManagerDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.findIndex((it) => it == 110) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { agentUserId: '$_agentId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$agentUserId'] },
                  },
                },

                {
                  $lookup: {
                    from: ModelNames.GLOBAL_GALLERIES,
                    let: { globalGalleryId: '$_globalGalleryId' },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ['$_id', '$$globalGalleryId'] },
                        },
                      },
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
              ],
              as: 'agentUserDetails',
            },
          },
          {
            $unwind: {
              path: '$agentUserDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.shopsModel
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

        var resultTotalCount = await this.shopsModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
        if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
        }
      }

      var resultGenerals = [];
      var arrayAggregationGenerals = [];
      var generalSettingsTypes = [];
      /*
         0 - tax
    1 - Shop
    2 - currency
    3 - product
    4 - order
      */

      if (dto.screenType.findIndex((it) => it == 200) != -1) {
        generalSettingsTypes.push(0);
      }
      if (dto.screenType.findIndex((it) => it == 201) != -1) {
        generalSettingsTypes.push(1);
      }
      if (dto.screenType.findIndex((it) => it == 202) != -1) {
        generalSettingsTypes.push(2);
      }
      if (dto.screenType.findIndex((it) => it == 203) != -1) {
        generalSettingsTypes.push(3);
      }
      if (dto.screenType.findIndex((it) => it == 204) != -1) {
        generalSettingsTypes.push(4);
      }
      if (generalSettingsTypes.length != 0) {
        arrayAggregationGenerals.push({
          $match: {
            _type: { $in: generalSettingsTypes },
            _status: 1,
          },
        });

        resultGenerals = await this.generalsModel.aggregate(
          arrayAggregationGenerals,
        );
      }

      const responseJSON = {
        message: 'success',
        data: {
          list: result,
          totalCount: totalCount,
          generals: resultGenerals,
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
  async checkEmailUserGet(dto: CheckEmailExistDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCount = await this.userModel
        .find({
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
        .count({ _mobile: dto.value, _status: { $in: [1, 0] } })
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

  async addRemoveUsers(dto: ShopAddRemoveUsersDto, _userId_: string) {
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
              _shopId: dto.shopUserId,
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
              _shopId: null,
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
            _supplierId: null,
            _deliveryHubId: null,
            _customerId: null,
            _shopId: dto.shopUserId,
            _customType: mapItem.customType,
            _halmarkId: null,
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

  async addRemoveCustomers(dto: ShopAddRemoveCustomerDto, _userId_: string) {
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
              _customerId: dto.shopUserId,
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
              _customerId: null,
            },
          },
          { new: true, session: transactionSession },
        );
      }
      if (dto.arrayUsersNew.length > 0) {
        var arrayToUsers = [];
        var arrayToCustomers = [];

        var resultCounterCustomers = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.CUSTOMERS },
          {
            $inc: {
              _count: dto.arrayUsersNew.length,
            },
          },
          { new: true, session: transactionSession },
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

        dto.arrayUsersNew.map((mapItem, index) => {
          var customerId = new mongoose.Types.ObjectId();
          arrayToCustomers.push({
            _id: customerId,
            _uid:
              resultCounterCustomers._count -
              dto.arrayUsersNew.length +
              (index + 1),
            _field1: mapItem.field1,
            _field2: mapItem.field2,
            _field3: mapItem.field3,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });

          arrayToUsers.push({
            _email: mapItem.email,
            _name: mapItem.name,
            _gender: mapItem.gender,
            _password: encryptedPassword,
            _mobile: mapItem.mobile,
            _globalGalleryId: null,
            _employeeId: null,
            _deliveryHubId: null,
            _agentId: null,
            _supplierId: null,
            _customerId: customerId,
            _shopId: dto.shopUserId,
            _customType: mapItem.customType,
            _halmarkId: null,
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

        await this.customersModel.insertMany(arrayToCustomers, {
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
  async listCustomersAndEmployeeShopAcross(
    dto: ShopAcrossEmployeesAndCustomersDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo

        var resultUserSearch = await this.customersModel
          .aggregate([
            {
              $match: {
                $or: [{ _uid: dto.searchingText }],
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
            $or: [
              { _customerId: { $in: userIdsSearch } },
              { _email: dto.searchingText },
              { _name: new RegExp(dto.searchingText, 'i') },
              { _mobile: dto.searchingText },
            ],
          },
        });
      }

      if (dto.shopIds.length > 0) {
        var newSettingsId = [];
        dto.shopIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _shopId: { $in: newSettingsId } } });
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
      if (dto.userIds.length > 0) {
        var newSettingsId = [];
        dto.userIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.customType.length > 0) {
        arrayAggregation.push({
          $match: { _customType: { $in: dto.customType } },
        });
      }

      if (dto.screenType.findIndex((it) => it == 52) != -1) {
        arrayAggregation.push({
          $match: { _customerId: { $ne: null } },
        });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

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
          arrayAggregation.push({ $sort: { _gender: dto.sortOrder } });
          break;
        case 4:
          arrayAggregation.push({ $sort: { _email: dto.sortOrder } });
          break;
        case 5:
          arrayAggregation.push({ $sort: { _mobile: dto.sortOrder } });
          break;
        case 6:
          arrayAggregation.push({ $sort: { _customType: dto.sortOrder } });
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

      if (dto.screenType.findIndex((it) => it == 101) != -1) {
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
}
