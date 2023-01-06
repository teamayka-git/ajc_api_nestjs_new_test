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
  ShopFreezStatusChangeDto,
  ShopLoginDto,
  ShopThemeEditDto,
} from './shops.dto';
import { Customers } from 'src/tableModels/customers.model';
import { Generals } from 'src/tableModels/generals.model';
import { Company } from 'src/tableModels/companies.model';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { SmsUtils } from 'src/utils/smsUtils';
import { StorePromotions } from 'src/tableModels/store_promotions.model';
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
    @InjectModel(ModelNames.STORE_PROMOTIONS)
    private readonly storePromotionModel: mongoose.Model<StorePromotions>,

    @InjectModel(ModelNames.COMPANIES)
    private readonly companyModel: mongoose.Model<Company>,
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
        .aggregate([{ $match: { _mobile: dto.mobile } }])
        .session(transactionSession);
      if (resultEmployee.length == 0) {
        throw new HttpException(
          'Wrong, Please check mobile and password',
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
      var smsGatewayArray = [];
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

        _displayName: dto.displayName,
        _uid: resultCounterPurchase._count,
        _globalGalleryId: globalGalleryId,
        _orderSaleRate: dto.orderSaleRate,
        _stockSaleRate: dto.stockSaleRate,
        _address: dto.address,
        _shopType: dto.shopType,
        _isTaxIgstEnabled: dto.isTaxIgstEnabled,
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
        _isFreezed: 0,
        _freezedDescription: '',
        _freezedRootCause: null,
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
        for (var i = 0; i < dto.arrayUserIdsEsixting.length; i++) {
          await this.userModel.findOneAndUpdate(
            {
              _id: { $in: dto.arrayUserIdsEsixting[i].userId },
            },
            {
              $set: {
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
                _shopId: shopId,
              },
              $push: {
                _customType: dto.arrayUserIdsEsixting[i].customType,
              },
            },
            { new: true, session: transactionSession },
          );
        }
      }
      if (dto.arrayUsersNew.length > 0) {
        for (var i = 0; i < dto.arrayUsersNew.length; i++) {
          var password = new StringUtils().makeid(6);
          var encryptedPassword = await crypto
            .pbkdf2Sync(
              password,
              process.env.CRYPTO_ENCRYPTION_SALT,
              1000,
              64,
              `sha512`,
            )
            .toString(`hex`);

          arrayToUsers.push({
            _email: dto.arrayUsersNew[i].email,
            _name: dto.arrayUsersNew[i].name,
            _gender: dto.arrayUsersNew[i].gender,
            _password: encryptedPassword,
            _mobile: dto.arrayUsersNew[i].mobile,
            _globalGalleryId: null,
            _employeeId: null,
            _agentId: null,
            _supplierId: null,
            _deliveryHubId: null,
            _logisticPartnerId: null,
            _shopId: shopId,
            _testCenterId: null,
            _customType: [dto.arrayUsersNew[i].customType],
            _halmarkId: null,
            _customerId: null,
            _fcmId: '',
            _deviceUniqueId: '',
            _permissions: [],
            _userType: 0,
            _createdUserId: null,
            _createdAt: -1,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
          smsGatewayArray.push({
            mobile: dto.arrayUsersNew[i].mobile,
            text: password,
            userName: dto.arrayUsersNew[i].name,
          }); //password
        }
      }

      var passwordMainUser = new StringUtils().makeid(6);
      var encryptedPasswordShop = await crypto
        .pbkdf2Sync(
          passwordMainUser,
          process.env.CRYPTO_ENCRYPTION_SALT,
          1000,
          64,
          `sha512`,
        )
        .toString(`hex`);
      arrayToUsers.push({
        _email: dto.email,
        _name: dto.name,
        _gender: 2,
        _password: encryptedPasswordShop,
        _mobile: dto.mobile,
        _globalGalleryId: globalGalleryId,
        _employeeId: null,
        _agentId: null,
        _supplierId: null,
        _shopId: shopId,
        _logisticPartnerId: null,
        _testCenterId: null,
        _customType: [5],
        _deliveryHubId: null,
        _halmarkId: null,
        _customerId: null,
        _fcmId: '',
        _deviceUniqueId: '',
        _permissions: [],
        _userType: 0,
        _createdUserId: null,
        _createdAt: -1,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });
      smsGatewayArray.push({
        mobile: dto.mobile,
        text: passwordMainUser,
        userName: dto.name,
      }); //password

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

      if (smsGatewayArray.length != 0) {
        smsGatewayArray.forEach((elementSmsGateway) => {
          new SmsUtils().sendSmsSMSBits(
            elementSmsGateway.mobile,
            elementSmsGateway.text,
            elementSmsGateway.userName,
          );
        });
      }

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
      var smsGatewayArray = [];
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

        _displayName: dto.displayName,
        _address: dto.address,
        _orderHeadId: dto.orderHeadId,
        _relationshipManagerId: dto.relationshipManagerId,
        _isSupplier: dto.isSupplier,
        _commisionType: dto.commisionType,
        _panCardNumber: dto.panCardNumber,
        _isTaxIgstEnabled: dto.isTaxIgstEnabled,
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
        _agentId:
          dto.agentId == 'nil' || dto.agentId == '' ? null : dto.agentId,
        _agentCommision: dto.agentCommision,
        _dataGuard: dto.dataGuard,
      };
      var objUser = {
        _email: dto.email,
        _name: dto.name,
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
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
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
          _customType: { $in: [5] },
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
            $push: {
              _customType: 4,
            },
          },
          { new: true, session: transactionSession },
        );
      }
      if (dto.arrayUsersNew.length > 0) {
        var arrayToUsers = [];

        for (var i = 0; i < dto.arrayUsersNew.length; i++) {
          var password = new StringUtils().makeid(6);
          var encryptedPassword = await crypto
            .pbkdf2Sync(
              password,
              process.env.CRYPTO_ENCRYPTION_SALT,
              1000,
              64,
              `sha512`,
            )
            .toString(`hex`);

          arrayToUsers.push({
            _email: dto.arrayUsersNew[i].email,
            _name: dto.arrayUsersNew[i].name,
            _gender: dto.arrayUsersNew[i].gender,
            _password: encryptedPassword,
            _mobile: dto.arrayUsersNew[i].mobile,
            _globalGalleryId: null,
            _employeeId: null,
            _agentId: null,
            _supplierId: null,
            _shopId: dto.shopUserId,
            _customType: [4],
            _logisticPartnerId: null,
            _halmarkId: null,
            _testCenterId: null,
            _deliveryHubId: null,
            _fcmId: '',
            _customerId: null,
            _deviceUniqueId: '',
            _permissions: [],
            _userType: 0,
            _createdUserId: null,
            _createdAt: -1,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
          smsGatewayArray.push({
            mobile: dto.arrayUsersNew[i].mobile,
            text: password,
            userName: dto.arrayUsersNew[i].name,
          });
        }

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

      if (smsGatewayArray.length != 0) {
        smsGatewayArray.forEach((elementSmsGateway) => {
          new SmsUtils().sendSmsSMSBits(
            elementSmsGateway.mobile,
            elementSmsGateway.text,
            elementSmsGateway.userName,
          );
        });
      }

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
              { _uid: new RegExp(`^${dto.searchingText}$`, 'i') },
              { _name: new RegExp(dto.searchingText, 'i') },
              { _displayName: new RegExp(dto.searchingText, 'i') },
              // { _address: new RegExp(dto.searchingText, 'i') },
              // { _panCardNumber: new RegExp(`^${dto.searchingText}$`, 'i') },
              // { _gstNumber: new RegExp(`^${dto.searchingText}$`, 'i') },
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
      if (dto.orderHeadIds.length > 0) {
        var newSettingsId = [];
        dto.orderHeadIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _orderHeadId: { $in: newSettingsId } },
        });
      }

      if (dto.relationshipManagerIds.length > 0) {
        var newSettingsId = [];
        dto.relationshipManagerIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _relationshipManagerId: { $in: newSettingsId } },
        });
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
          arrayAggregation.push({
            $sort: { _status: dto.sortOrder, _id: dto.sortOrder },
          });
          break;

        case 2:
          arrayAggregation.push({
            $sort: { _uid: dto.sortOrder, _id: dto.sortOrder },
          });
          break;

        case 3:
          arrayAggregation.push({
            $sort: { _orderSaleRate: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 4:
          arrayAggregation.push({
            $sort: { _stockSaleRate: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 5:
          arrayAggregation.push({
            $sort: { _shopType: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 6:
          arrayAggregation.push({
            $sort: { _billingModeSale: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 7:
          arrayAggregation.push({
            $sort: { _billingModePurchase: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 8:
          arrayAggregation.push({
            $sort: {
              _hallmarkingMandatoryStatus: dto.sortOrder,
              _id: dto.sortOrder,
            },
          });
          break;
        case 9:
          arrayAggregation.push({
            $sort: { _creditAmount: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 10:
          arrayAggregation.push({
            $sort: { _creditDays: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 11:
          arrayAggregation.push({
            $sort: { _stonePricing: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 12:
          arrayAggregation.push({
            $sort: { _agentCommision: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      arrayAggregation.push(
        new ModelWeightResponseFormat().shopTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );
      if (dto.screenType.includes(111)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    _customType: { $in: [5] },
                    $expr: { $eq: ['$_shopId', '$$userId'] },
                  },
                },

                new ModelWeightResponseFormat().userTableResponseFormat(
                  1110,
                  dto.responseFormat,
                ),
              ],
              as: 'userDetails',
            },
          },
          {
            $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }
      if (dto.screenType.includes(50)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERIES,
              let: { globalGalleryId: '$_globalGalleryId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } } },

                new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                  500,
                  dto.responseFormat,
                ),
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
              from: ModelNames.BRANCHES,
              let: { branchId: '$_branchId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$branchId'] } } },

                new ModelWeightResponseFormat().branchTableResponseFormat(
                  1000,
                  dto.responseFormat,
                ),
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

      if (dto.screenType.includes(104)) {
        const ratecardPipeline = () => {
          const pipeline = [];
          pipeline.push(
            { $match: { $expr: { $eq: ['$_id', '$$rateCardId'] } } },
            new ModelWeightResponseFormat().ratecardTableResponseFormat(
              1040,
              dto.responseFormat,
            ),
          );
          const ratecardPercentages = dto.screenType.includes(112);
          if (ratecardPercentages) {
            pipeline.push({
              $lookup: {
                from: ModelNames.RATE_CARD_PERCENTAGESS,
                let: { ratecardIdId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_rateCardId', '$$ratecardIdId'] },
                    },
                  },

                  new ModelWeightResponseFormat().ratecardPercentagesTableResponseFormat(
                    1120,
                    dto.responseFormat,
                  ),
                ],
                as: 'rateCardPercentages',
              },
            });
          }
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.RATE_CARDS,
              let: { rateCardId: '$_rateCardId' },
              pipeline: ratecardPipeline(),
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
      }

      if (dto.screenType.includes(106)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.CITIES,
              let: { cityId: '$_cityId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$cityId'] } } },

                new ModelWeightResponseFormat().cityTableResponseFormat(
                  1060,
                  dto.responseFormat,
                ),
              ],
              as: 'cityDetails',
            },
          },
          {
            $unwind: { path: '$cityDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }
      if (dto.screenType.includes(107)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.TDS_MASTERS,
              let: { tdsId: '$_tdsId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$tdsId'] } } },

                new ModelWeightResponseFormat().tdsMasterTableResponseFormat(
                  1070,
                  dto.responseFormat,
                ),
              ],
              as: 'tdsDetails',
            },
          },
          {
            $unwind: { path: '$tdsDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }
      if (dto.screenType.includes(108)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.TCS_MASTERS,
              let: { tcsId: '$_tcsId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$tcsId'] } } },
                new ModelWeightResponseFormat().tcsMasterTableResponseFormat(
                  1080,
                  dto.responseFormat,
                ),
              ],
              as: 'tcsDetails',
            },
          },
          {
            $unwind: { path: '$tcsDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }
      if (dto.screenType.includes(109)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.RATE_BASE_MASTERS,
              let: { ratebaseId: '$_rateBaseMasterId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$ratebaseId'] } } },
                new ModelWeightResponseFormat().rateBaseMasterTableResponseFormat(
                  1090,
                  dto.responseFormat,
                ),
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

      if (dto.screenType.includes(101)) {
        const orderHeadPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );

          const orderHeadGlobalGallery = dto.screenType.includes(113);
          if (orderHeadGlobalGallery) {
            pipeline.push(
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
                    new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                      1130,
                      dto.responseFormat,
                    ),
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
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_orderHeadId' },
              pipeline: orderHeadPipeline(),
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
      if (dto.screenType.includes(102)) {
        const relationshipManagerPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1020,
              dto.responseFormat,
            ),
          );
          const relationshipManagerGlobalGallery = dto.screenType.includes(114);
          if (relationshipManagerGlobalGallery) {
            pipeline.push(
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
                    new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                      1140,
                      dto.responseFormat,
                    ),
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
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_relationshipManagerId' },
              pipeline: relationshipManagerPipeline(),
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

      if (dto.screenType.includes(110)) {
        const agentPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$agentUserId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1100,
              dto.responseFormat,
            ),
          );
          const agentGlobalGallery = dto.screenType.includes(115);
          if (agentGlobalGallery) {
            pipeline.push(
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
                    new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                      1150,
                      dto.responseFormat,
                    ),
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
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { agentUserId: '$_agentId' },
              pipeline: agentPipeline(),
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
      if (dto.screenType.includes(116)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
              let: { rootCauseId: '$_freezedRootCause' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$rootCauseId'] },
                  },
                },
                new ModelWeightResponseFormat().rootcauseTableResponseFormat(
                  1160,
                  dto.responseFormat,
                ),
              ],
              as: 'freezedRootCauseDetails',
            },
          },
          {
            $unwind: {
              path: '$freezedRootCauseDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      var result = [];
      result = await this.shopsModel
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
      var resultCompany = {};
      /*
         0 - tax
    1 - Shop
    2 - currency
    3 - product
    4 - order
      */

      if (dto.screenType.includes(200)) {
        generalSettingsTypes.push(0);
      }
      if (dto.screenType.includes(201)) {
        generalSettingsTypes.push(1);
      }
      if (dto.screenType.includes(202)) {
        generalSettingsTypes.push(2);
      }
      if (dto.screenType.includes(203)) {
        generalSettingsTypes.push(3);
      }
      if (dto.screenType.includes(204)) {
        generalSettingsTypes.push(4);
      }
      if (dto.screenType.includes(205)) {
        generalSettingsTypes.push(5);
      }
      if (dto.screenType.includes(206)) {
        generalSettingsTypes.push(6);
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

      if (dto.screenType.includes(250)) {
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
      }

      const responseJSON = {
        message: 'success',
        data: {
          list: result,
          totalCount: totalCount,
          generals: resultGenerals,
          company: resultCompany,
        },
      };

      if (dto.screenType.includes(251)) {
        var resultMainImage = await this.storePromotionModel.aggregate([
          { $match: { _type: 0, _status: 1 } },
          { $sort: { _priority: 1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERIES,
              let: { ggMobileId: '$_globalGalleryMobileId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$ggMobileId'] } },
                },
                {
                  $project: {
                    _url: 1,
                  },
                },
              ],
              as: 'ggMobileDetails',
            },
          },
          {
            $unwind: {
              path: '$ggMobileDetails',
            },
          },
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERIES,
              let: { ggDeskId: '$_globalGalleryDeskId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$ggDeskId'] } },
                },
                {
                  $project: {
                    _url: 1,
                  },
                },
              ],
              as: 'ggDeskDetails',
            },
          },
          {
            $unwind: {
              path: '$ggDeskDetails',
            },
          },
        ]);

        var resultSlideImage = await this.storePromotionModel.aggregate([
          { $match: { _type: 1, _status: 1 } },
          { $sort: { _priority: 1 } },
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERIES,
              let: { ggMobileId: '$_globalGalleryMobileId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$ggMobileId'] } },
                },
                {
                  $project: {
                    _url: 1,
                  },
                },
              ],
              as: 'ggMobileDetails',
            },
          },
          {
            $unwind: {
              path: '$ggMobileDetails',
            },
          },
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERIES,
              let: { ggDeskId: '$_globalGalleryDeskId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$ggDeskId'] } },
                },
                {
                  $project: {
                    _url: 1,
                  },
                },
              ],
              as: 'ggDeskDetails',
            },
          },
          {
            $unwind: {
              path: '$ggDeskDetails',
            },
          },
        ]);

        var mobileMainImage = '';
        var deskMainImage = '';
        var mobileSlideImage = [];
        var deskSlideImage = [];

        if (resultMainImage.length != 0) {
          mobileMainImage = resultMainImage[0].ggMobileDetails._url;
          deskMainImage = resultMainImage[0].ggDeskDetails._url;
        }

        if (resultSlideImage.length != 0) {
          resultSlideImage.forEach((elementSlideImageItem) => {
            mobileSlideImage.push(elementSlideImageItem.ggMobileDetails._url);
            deskSlideImage.push(elementSlideImageItem.ggDeskDetails._url);
          });
          // mobileMainImage=resultSlideImage[0].ggMobileDetails._url;
          // deskMainImage=resultSlideImage[0].ggDeskDetails._url;
        }

        var dueDateGenerals = await this.generalsModel.find({
          _code: 1022,
          _status: 1,
        });
        if (dueDateGenerals.length == 0) {
          throw new HttpException(
            'General settings due date not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        responseJSON.data['themeManufactureData'] = {
          mobileMainImageUrl: mobileMainImage,
          mobileMainImageRatio: 3.5,
          mobileSliderImages: mobileSlideImage,
          mobileSliderImageRatio: 3.6,
          deskMainImageUrl: deskMainImage,
          deskMainImageRatio: 5,
          deskSliderImageRatio: 5,
          deskSliderImages: deskSlideImage,
          dueDateMaximumDaysCount: dueDateGenerals[0]._number,
        };
      }

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
      var smsGatewayArray = [];
      if (dto.arrayUserIdsEsixting.length > 0) {
        for (var i = 0; i < dto.arrayUserIdsEsixting.length; i++) {
          await this.userModel.findOneAndUpdate(
            {
              _id: { $in: dto.arrayUserIdsEsixting[i].userId },
            },
            {
              $set: {
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
                _shopId: dto.shopUserId,
              },
              $push: {
                _customType: dto.arrayUserIdsEsixting[i].customType,
              },
            },
            { new: true, session: transactionSession },
          );
        }
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

        for (var i = 0; i < dto.arrayUsersNew.length; i++) {
          var password = new StringUtils().makeid(6);
          var encryptedPassword = await crypto
            .pbkdf2Sync(
              password,
              process.env.CRYPTO_ENCRYPTION_SALT,
              1000,
              64,
              `sha512`,
            )
            .toString(`hex`);

          arrayToUsers.push({
            _email: dto.arrayUsersNew[i].email,
            _name: dto.arrayUsersNew[i].name,
            _gender: dto.arrayUsersNew[i].gender,
            _password: encryptedPassword,
            _mobile: dto.arrayUsersNew[i].mobile,
            _globalGalleryId: null,
            _testCenterId: null,
            _employeeId: null,
            _agentId: null,
            _logisticPartnerId: null,
            _supplierId: null,
            _deliveryHubId: null,
            _customerId: null,
            _shopId: dto.shopUserId,
            _customType: [dto.arrayUsersNew[i].customType],
            _halmarkId: null,
            _fcmId: '',
            _deviceUniqueId: '',
            _permissions: [],
            _userType: 0,
            _createdUserId: null,
            _createdAt: -1,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
          smsGatewayArray.push({
            mobile: dto.arrayUsersNew[i].mobile,
            text: password,
            userName: dto.arrayUsersNew[i].name,
          }); //password
        }

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

      if (smsGatewayArray.length != 0) {
        smsGatewayArray.forEach((elementSmsGateway) => {
          new SmsUtils().sendSmsSMSBits(
            elementSmsGateway.mobile,
            elementSmsGateway.text,
            elementSmsGateway.userName,
          );
        });
      }

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
      var smsGatewayArray = [];
      if (dto.arrayUserIdsEsixting.length > 0) {
        for (var i = 0; i < dto.arrayUserIdsEsixting.length; i++) {
          await this.userModel.findOneAndUpdate(
            {
              _id: { $in: dto.arrayUserIdsEsixting[i].userId },
            },
            {
              $set: {
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
                _shopId: dto.shopUserId,
              },
              $push: {
                _customType: dto.arrayUserIdsEsixting[i].customType,
              },
            },
            { new: true, session: transactionSession },
          );
        }
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

        for (var i = 0; i < dto.arrayUsersNew.length; i++) {
          var password = new StringUtils().makeid(6);
          var encryptedPassword = await crypto
            .pbkdf2Sync(
              password,
              process.env.CRYPTO_ENCRYPTION_SALT,
              1000,
              64,
              `sha512`,
            )
            .toString(`hex`);
          var customerId = new mongoose.Types.ObjectId();
          arrayToCustomers.push({
            _id: customerId,
            _uid:
              resultCounterCustomers._count -
              dto.arrayUsersNew.length +
              (i + 1),
            _field1: dto.arrayUsersNew[i].field1,
            _field2: dto.arrayUsersNew[i].field2,
            _field3: dto.arrayUsersNew[i].field3,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });

          arrayToUsers.push({
            _email: dto.arrayUsersNew[i].email,
            _name: dto.arrayUsersNew[i].name,
            _gender: dto.arrayUsersNew[i].gender,
            _password: encryptedPassword,
            _mobile: dto.arrayUsersNew[i].mobile,
            _globalGalleryId: null,
            _employeeId: null,
            _deliveryHubId: null,
            _testCenterId: null,
            _agentId: null,
            _supplierId: null,
            _logisticPartnerId: null,
            _customerId: customerId,
            _shopId: dto.shopUserId,
            _customType: [dto.arrayUsersNew[i].customType],
            _halmarkId: null,
            _fcmId: '',
            _deviceUniqueId: '',
            _permissions: [],
            _userType: 0,
            _createdUserId: null,
            _createdAt: -1,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
          smsGatewayArray.push({
            mobile: dto.arrayUsersNew[i].mobile,
            text: password,
            userName: dto.arrayUsersNew[i].name,
          });
        }

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

      if (smsGatewayArray.length != 0) {
        smsGatewayArray.forEach((elementSmsGateway) => {
          new SmsUtils().sendSmsSMSBits(
            elementSmsGateway.mobile,
            elementSmsGateway.text,
            elementSmsGateway.userName,
          );
        });
      }

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
                $or: [{ _uid: new RegExp(`^${dto.searchingText}$`, 'i') }],
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
              { _email: new RegExp(`^${dto.searchingText}$`, 'i') },
              { _name: new RegExp(dto.searchingText, 'i') },
              { _mobile: new RegExp(`^${dto.searchingText}$`, 'i') },
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

      if (dto.screenType.includes(52)) {
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
          arrayAggregation.push({
            $sort: { _status: dto.sortOrder, _id: dto.sortOrder },
          });
          break;

        case 2:
          arrayAggregation.push({
            $sort: { _name: dto.sortOrder, _id: dto.sortOrder },
          });
          break;

        case 3:
          arrayAggregation.push({
            $sort: { _gender: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 4:
          arrayAggregation.push({
            $sort: { _email: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 5:
          arrayAggregation.push({
            $sort: { _mobile: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      arrayAggregation.push(
        new ModelWeightResponseFormat().userTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );
      if (dto.screenType.includes(50)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERIES,
              let: { globalGalleryId: '$_globalGalleryId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } } },

                new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                  500,
                  dto.responseFormat,
                ),
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
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$shopId'] } } },

                new ModelWeightResponseFormat().shopTableResponseFormat(
                  1000,
                  dto.responseFormat,
                ),
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
        );
      }

      if (dto.screenType.includes(101)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.CUSTOMERS,
              let: { customerId: '$_customerId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$customerId'] } } },

                new ModelWeightResponseFormat().customerTableResponseFormat(
                  1010,
                  dto.responseFormat,
                ),
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
  async freezedStatusChange(dto: ShopFreezStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.shopsModel.updateMany(
        {
          _id: { $in: dto.shopIds },
        },
        {
          $set: {
            _isFreezed: dto.isFreezed,
            _freezedDescription: dto.freezedDescription,
            _freezedRootCause:
              dto.freezedRootCause == '' ? null : dto.freezedRootCause,
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

  async themeEdit(dto: ShopThemeEditDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {



      console.log("resultUploadSplash___0");
      var resultUploadSplash = {};
      var resultUploadIcon = {};
      if (file.hasOwnProperty('splashImage')) {
        console.log("resultUploadSplash___1");

        // var filePath =
        //   __dirname +
        //   `/../../../public${file['image'][0]['path'].split('public')[1]}`;

        //   new ThumbnailUtils().generateThumbnail(filePath,  UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP +
        //     new StringUtils().makeThumbImageFileName(
        //       file['image'][0]['filename'],
        //     ));

        resultUploadSplash = await new S3BucketUtils().uploadMyFile(
          file['splashImage'][0],
          UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP,
        );

        if (resultUploadSplash['status'] == 0) {
          throw new HttpException(
            'File upload error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

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
          _name: file['splashImage'][0]['originalname'],
          _globalGalleryCategoryId: null,
          _docType: 0,
          _type: 7,
          _uid: resultCounterPurchase._count,
          _url: resultUploadSplash['url'],
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
        var resultGlobalGallery = await globalGallery.save({
          session: transactionSession,
        });



        console.log("resultUploadSplash['url']   "+resultUploadSplash['url']);


      }


      
      if (file.hasOwnProperty('iconImage')) {
        console.log("resultUploadSplash___2");
        // var filePath =
        //   __dirname +
        //   `/../../../public${file['image'][0]['path'].split('public')[1]}`;

        //   new ThumbnailUtils().generateThumbnail(filePath,  UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP +
        //     new StringUtils().makeThumbImageFileName(
        //       file['image'][0]['filename'],
        //     ));

        resultUploadIcon = await new S3BucketUtils().uploadMyFile(
          file['iconImage'][0],
          UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP,
        );

        if (resultUploadIcon['status'] == 0) {
          throw new HttpException(
            'File upload error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

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
          _name: file['iconImage'][0]['originalname'],
          _globalGalleryCategoryId: null,
          _docType: 0,
          _type: 7,
          _uid: resultCounterPurchase._count,
          _url: resultUploadIcon['url'],
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
        var resultGlobalGallery = await globalGallery.save({
          session: transactionSession,
        });




        console.log("resultUploadIcon['url']   "+resultUploadIcon['url']);


      }
  

































      var result = await this.shopsModel.findOneAndUpdate(
        {
          _id: dto.shopId,
        },
        {
          $set: {
            _themeStore: {
              splashImageUrl:(file.hasOwnProperty('splashImage'))?resultUploadSplash['url']:
                'https://vismayacart.s3.ap-south-1.amazonaws.com/splash-removebg-preview.png',
              splashText: dto.splashText,
              splashBgColor: dto.splashBgColor,
              splashTextColor: dto.splashTextColor,
              splashDuration: dto.splashDuration,
              actionbarBgColor: dto.actionbarBgColor,
              actionbarIconColor: dto.actionbarIconColor,
              actionbarTextColor: dto.actionbarTextColor,
              actionbarText: dto.actionbarText,
              actionbarLogo:(file.hasOwnProperty('iconImage'))?resultUploadIcon['url']:
                'https://vismayacart.s3.ap-south-1.amazonaws.com/splash-removebg-preview.png',
              actionbarSearchBgColor: dto.actionbarSearchBgColor,
              actionbarSearchHint: dto.actionbarSearchHint,
              actionbarSearchHintColor: dto.actionbarSearchHintColor,
              actionbarSearchIconColor: dto.actionbarSearchIconColor,
              actionbarSearchTextColor: dto.actionbarSearchTextColor,
              linearProgressbarColor: dto.linearPbColor,
              roundedProgressbarColor: dto.roundedPbColor,
            },
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
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
}
