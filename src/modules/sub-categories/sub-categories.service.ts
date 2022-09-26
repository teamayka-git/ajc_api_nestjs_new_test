import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { SubCategories } from 'src/tableModels/sub_categories.model';
import * as mongoose from 'mongoose';
import {
  CheckItemExistDto,
  CheckNameExistDto,
  ListFilterLocadingSubCategoryDto,
  SubCategoriesCreateDto,
  SubCategoriesEditDto,
  SubCategoriesListDto,
  SubCategoriesStatusChangeDto,
} from './sub_categories.dto';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { GlobalConfig } from 'src/config/global_config';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { Counters } from 'src/tableModels/counters.model';
import { StringUtils } from 'src/utils/string_utils';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { RateCards } from 'src/tableModels/rateCards.model';
import { RateCardPercentages } from 'src/tableModels/rateCardPercentages.model';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import { Generals } from 'src/tableModels/generals.model';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectModel(ModelNames.SUB_CATEGORIES)
    private readonly subCategoriesModel: Model<SubCategories>,
    @InjectModel(ModelNames.GENERALS)
    private readonly generalsModel: Model<Generals>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
    @InjectModel(ModelNames.RATE_CARDS)
    private readonly rateCardsModel: mongoose.Model<RateCards>,
    @InjectModel(ModelNames.RATE_CARD_PERCENTAGESS)
    private readonly rateCardPercentagesModel: mongoose.Model<RateCardPercentages>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: SubCategoriesCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];

      var arrayGlobalGalleries = [];
      var arrayToRateCardPercentage = [];

      if (file.hasOwnProperty('image')) {
        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: file['image'].length,
            },
          },
          { new: true, session: transactionSession },
        );

        for (var i = 0; i < file['image'].length; i++) {
          // var filePath =
          //   __dirname +
          //   `/../../../public${file['image'][i]['path'].split('public')[1]}`;

          // new ThumbnailUtils().generateThumbnail(
          //   filePath,
          //   UploadedFileDirectoryPath.GLOBAL_GALLERY_SUB_CATEGORY +
          //     new StringUtils().makeThumbImageFileName(
          //       file['image'][i]['filename'],
          //     ),
          // );

          var resultUpload = await new S3BucketUtils().uploadMyFile(
            file['image'][i],
            UploadedFileDirectoryPath.GLOBAL_GALLERY_SUB_CATEGORY,
          );

          if (resultUpload['status'] == 0) {
            throw new HttpException(
              'File upload error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          var globalGalleryId = new mongoose.Types.ObjectId();
          arrayGlobalGalleries.push({
            _id: globalGalleryId,
            _name: file['image'][i]['originalname'],
            _globalGalleryCategoryId: null,
            _docType: 0,
            _type: 1,
            _uid: resultCounterPurchase._count - file['image'].length + (i + 1),
            _url: resultUpload['url'],
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });

          var count = dto.array.findIndex(
            (it) => it.fileOriginalName == file['image'][i]['originalname'],
          );
          if (count != -1) {
            dto.array[count]['globalGalleryId'] = globalGalleryId;
          } else {
            dto.array[count]['globalGalleryId'] = 'nil';
          }
        }
      }

      var resultRateCards = await this.rateCardsModel.find(
        { _status: { $in: [0, 1] } },
        { _id: 1 },
      );

      dto.array.map((mapItem) => {
        var subCategoryId = new mongoose.Types.ObjectId();
        arrayToStates.push({
          _id: subCategoryId,
          _name: mapItem.name,
          _code: mapItem.code,
          _description: mapItem.description,
          _categoryId: mapItem.categoryId,
          _rewardPoint: mapItem.rewardPoint,
          _hmSealing: mapItem.hmsealing,
          _defaultValueAdditionPercentage:
            mapItem.defaultValueAdditionPercentage,
          _globalGalleryId:
            mapItem['globalGalleryId'] == 'nil'
              ? null
              : mapItem['globalGalleryId'],
          _dataGuard: mapItem.dataGuard,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        resultRateCards.map((mapItem1) => {
          arrayToRateCardPercentage.push({
            _rateCardId: mapItem1._id,
            _subCategoryId: subCategoryId,
            _percentage: mapItem.defaultPercentage,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      });

      var result1 = await this.subCategoriesModel.insertMany(arrayToStates, {
        session: transactionSession,
      });

      await this.globalGalleryModel.insertMany(arrayGlobalGalleries, {
        session: transactionSession,
      });
      await this.rateCardPercentagesModel.insertMany(
        arrayToRateCardPercentage,
        {
          session: transactionSession,
        },
      );

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

  async edit(dto: SubCategoriesEditDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      // if (file.hasOwnProperty('image')) {
      //   var filePath =
      //     __dirname +
      //     `/../../../public${file['image'][0]['path'].split('public')[1]}`;

      //   new ThumbnailUtils().generateThumbnail(
      //     filePath,
      //     UploadedFileDirectoryPath.GLOBAL_GALLERY_SUB_CATEGORY +
      //       new StringUtils().makeThumbImageFileName(
      //         file['image'][0]['filename'],
      //       ),
      //   );
      // }

      var resultUpload = {};
      if (file.hasOwnProperty('image')) {
        resultUpload = await new S3BucketUtils().uploadMyFile(
          file['image'][0],
          UploadedFileDirectoryPath.GLOBAL_GALLERY_SUB_CATEGORY,
        );

        if (resultUpload['status'] == 0) {
          throw new HttpException(
            'File upload error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      var updateObject = {
        _name: dto.name,
        _code: dto.code,
        _description: dto.description,
        _categoryId: dto.categoryId,
        _hmSealing: dto.hmsealing,
        _rewardPoint: dto.rewardPoint,
        _defaultValueAdditionPercentage: dto.defaultValueAdditionPercentage,
        _dataGuard: dto.dataGuard,
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
          _type: 1,
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

      var result = await this.subCategoriesModel.findOneAndUpdate(
        {
          _id: dto.subCategoryId,
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

  async status_change(dto: SubCategoriesStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.subCategoriesModel.updateMany(
        {
          _id: { $in: dto.subCategoryIds },
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

  async list(dto: SubCategoriesListDto) {
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
              { _description: new RegExp(dto.searchingText, 'i') },
              { _code: new RegExp(`^${dto.searchingText}$`, 'i') },
            ],
          },
        });
      }
      if (dto.subCategoryIds.length > 0) {
        var newSettingsId = [];
        dto.subCategoryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.categoryIds.length > 0) {
        var newSettingsId = [];
        dto.categoryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _categoryId: { $in: newSettingsId } },
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
          arrayAggregation.push({ $sort: { _code: dto.sortOrder } });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      arrayAggregation.push(
        new ModelWeightResponseFormat().subCategoryTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );
      
      if (dto.screenType.includes(100)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.CATEGORIES,
              let: { categoryId: '$_categoryId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$categoryId'] } } },
              ],
              as: 'categoryDetails',
            },
          },
          {
            $unwind: {
              path: '$categoryDetails',
              preserveNullAndEmptyArrays: true,
            },
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

      var result = await this.subCategoriesModel
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

        var resultTotalCount = await this.subCategoriesModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
        if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
        }
      }

      var generalSetting = [];
      if (dto.screenType.includes(500)) {
        generalSetting = await this.generalsModel.aggregate([
          {
            $match: {
              _code: 1022,
            },
          },
        ]);
      }

      const responseJSON = {
        message: 'success',
        data: {
          list: result,
          totalCount: totalCount, 
          generalSetting: generalSetting,
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

  async listFilterLoadingSubCategory(dto: ListFilterLocadingSubCategoryDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];
      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      arrayAggregation.push({ $group: { _id: '$_categoryId' } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.includes(100)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.CATEGORIES,
              let: { categoryId: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$categoryId'] } } },
              ],
              as: 'categoryDetails',
            },
          },
          {
            $unwind: {
              path: '$categoryDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.subCategoriesModel
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

        var resultTotalCount = await this.subCategoriesModel
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
      var resultCount = await this.subCategoriesModel
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
      var resultCount = await this.subCategoriesModel
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
