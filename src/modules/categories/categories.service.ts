import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Categories } from 'src/tableModels/categories.model';
import {
  CategoriesCreateDto,
  CategoriesEditDto,
  CategoriesListDto,
  CategoriesStatusChangeDto,
  CheckItemExistDto,
  CheckNameExistDto,
  ListFilterLocadingCategoryDto,
} from './categories.dto';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { GlobalConfig } from 'src/config/global_config';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { Counters } from 'src/tableModels/counters.model';
import { StringUtils } from 'src/utils/string_utils';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { FilesS3Service } from 'src/s3_services/file.s3.services';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(ModelNames.CATEGORIES)
    private readonly categoriesModel: Model<Categories>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    private readonly filesService: FilesS3Service,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: CategoriesCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];
      var arrayGlobalGalleries = [];

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
          var filePath =
            __dirname +
            `/../../../public${file['image'][i]['path'].split('public')[1]}`;

          new ThumbnailUtils().generateThumbnail(
            filePath,
            UploadedFileDirectoryPath.GLOBAL_GALLERY_CATEGORY +
              new StringUtils().makeThumbImageFileName(
                file['image'][i]['filename'],
              ),
          );

          var globalGalleryId = new mongoose.Types.ObjectId();
          arrayGlobalGalleries.push({
            _id: globalGalleryId,
            _name: file['image'][i]['originalname'],
            _globalGalleryCategoryId: null,
            _docType: 0,
            _type: 0,
            _uid: resultCounterPurchase._count - file['image'].length + (i + 1),
            _url: `${process.env.SSL == 'true' ? 'https' : 'http'}://${
              process.env.SERVER_DOMAIN
            }:${process.env.PORT}${
              file['image'][i]['path'].split('public')[1]
            }`,
            _thumbUrl: new StringUtils().makeThumbImageFileName(
              `${process.env.SSL == 'true' ? 'https' : 'http'}://${
                process.env.SERVER_DOMAIN
              }:${process.env.PORT}${
                file['image'][i]['path'].split('public')[1]
              }`,
            ),
            _created_user_id: _userId_,
            _created_at: dateTime,
            _updated_user_id: null,
            _updated_at: -1,
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

      dto.array.map((mapItem) => {
        arrayToStates.push({
          _name: mapItem.name,
          _code: mapItem.code,
          _description: mapItem.description,
          _groupId: mapItem.groupId,
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
      });

      var result1 = await this.categoriesModel.insertMany(arrayToStates, {
        session: transactionSession,
      });
      await this.globalGalleryModel.insertMany(arrayGlobalGalleries, {
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

  async testS3Bucket1(_userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];
      var arrayGlobalGalleries = [];

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
          var filePath =
            __dirname +
            `/../../../public${file['image'][i]['path'].split('public')[1]}`;

          new ThumbnailUtils().generateThumbnail(
            filePath,
            UploadedFileDirectoryPath.GLOBAL_GALLERY_CATEGORY +
              new StringUtils().makeThumbImageFileName(
                file['image'][i]['filename'],
              ),
          );

          var globalGalleryId = new mongoose.Types.ObjectId();
          arrayGlobalGalleries.push({
            _id: globalGalleryId,
            _name: file['image'][i]['originalname'],
            _globalGalleryCategoryId: null,
            _docType: 0,
            _type: 0,
            _uid: resultCounterPurchase._count - file['image'].length + (i + 1),
            _url: `${process.env.SSL == 'true' ? 'https' : 'http'}://${
              process.env.SERVER_DOMAIN
            }:${process.env.PORT}${
              file['image'][i]['path'].split('public')[1]
            }`,
            _thumbUrl: new StringUtils().makeThumbImageFileName(
              `${process.env.SSL == 'true' ? 'https' : 'http'}://${
                process.env.SERVER_DOMAIN
              }:${process.env.PORT}${
                file['image'][i]['path'].split('public')[1]
              }`,
            ),
            _created_user_id: _userId_,
            _created_at: dateTime,
            _updated_user_id: null,
            _updated_at: -1,
            _status: 1,
          });
        }
      }

      var globalGalleryList = await this.globalGalleryModel.insertMany(
        arrayGlobalGalleries,
        {
          session: transactionSession,
        },
      );

      const responseJSON = {
        message: 'success',
        data: { list: globalGalleryList },
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

  async testS3Bucket2(_userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];
      var arrayGlobalGalleries = [];

      console.log('___z1');

      // if (file.hasOwnProperty('image')) {
      //   var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
      //     { _tableName: ModelNames.GLOBAL_GALLERIES },
      //     {
      //       $inc: {
      //         _count: file['image'].length,
      //       },
      //     },
      //     { new: true, session: transactionSession },
      //   );

      //   for (var i = 0; i < file['image'].length; i++) {
      //     var filePath =
      //       __dirname +
      //       `/../../../public${file['image'][i]['path'].split('public')[1]}`;

      //     new ThumbnailUtils().generateThumbnail(
      //       filePath,
      //       UploadedFileDirectoryPath.GLOBAL_GALLERY_CATEGORY +
      //         new StringUtils().makeThumbImageFileName(
      //           file['image'][i]['filename'],
      //         ),
      //     );

      //     var globalGalleryId = new mongoose.Types.ObjectId();
      //     arrayGlobalGalleries.push({
      //       _id: globalGalleryId,
      //       _name: file['image'][i]['originalname'],
      //       _globalGalleryCategoryId: null,
      //       _docType: 0,
      //       _type: 0,
      //       _uid: resultCounterPurchase._count - file['image'].length + (i + 1),
      //       _url: `${process.env.SSL == 'true' ? 'https' : 'http'}://${
      //         process.env.SERVER_DOMAIN
      //       }:${process.env.PORT}${
      //         file['image'][i]['path'].split('public')[1]
      //       }`,
      //       _thumbUrl: new StringUtils().makeThumbImageFileName(
      //         `${process.env.SSL == 'true' ? 'https' : 'http'}://${
      //           process.env.SERVER_DOMAIN
      //         }:${process.env.PORT}${
      //           file['image'][i]['path'].split('public')[1]
      //         }`,
      //       ),
      //       _created_user_id: _userId_,
      //       _created_at: dateTime,
      //       _updated_user_id: null,
      //       _updated_at: -1,
      //       _status: 1,
      //     });
      //   }
      // }

      // var globalGalleryList = await this.globalGalleryModel.insertMany(
      //   arrayGlobalGalleries,
      //   {
      //     session: transactionSession,
      //   },
      // );
      console.log('___z2');

      console.log('___z3   ' + JSON.stringify(file));

      console.log('___z4');
      var aaa = await this.filesService.uploadFile(
        file['image']['buffer'],
        file['image']['originalname'],
      );
      console.log('___z5');
      const responseJSON = {
        message: 'success',
        data: aaa,
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

  async edit(dto: CategoriesEditDto, _userId_: string, file: Object) {
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
          UploadedFileDirectoryPath.GLOBAL_GALLERY_CATEGORY +
            new StringUtils().makeThumbImageFileName(
              file['image'][0]['filename'],
            ),
        );
      }

      var updateObject = {
        _name: dto.name,
        _code: dto.code,
        _description: dto.description,
        _groupId: dto.groupId,
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
          _type: 0,
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

      var result = await this.categoriesModel.findOneAndUpdate(
        {
          _id: dto.categoryId,
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

  async status_change(dto: CategoriesStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.categoriesModel.updateMany(
        {
          _id: { $in: dto.categoryIds },
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

  async list(dto: CategoriesListDto) {
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
              { _code: dto.searchingText },
            ],
          },
        });
      }
      if (dto.categoryIds.length > 0) {
        var newSettingsId = [];
        dto.categoryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.groupIds.length > 0) {
        var newSettingsId = [];
        dto.groupIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _groupId: { $in: newSettingsId } } });
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

      if (dto.screenType.findIndex((it) => it == 100) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GROUP_MASTERS,
              let: { groupId: '$_groupId' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$groupId'] } } }],
              as: 'groupDetails',
            },
          },
          {
            $unwind: {
              path: '$groupDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
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

      // arrayAggregation.push({
      //   $switch:{
      //     branches:[
      //       { case: { $eq: [ dto.skip, -1 ] }, then: {
      //             $lookup: {
      //               from: ModelNames.USER,
      //               let: { userId: '$_createdUserId' },
      //               pipeline: [{ $match: {_status:1, $expr: {$and:[{$eq: [dto.skip, -1]},{$eq: ['$_id', '$$userId']}]       } } },],
      //               as: 'userDetails',
      //             },
      //           } }
      //     ]
      //   }
      // });

      // arrayAggregation.push(
      //   {
      //     $lookup: {
      //       from: ModelNames.USER,
      //       let: { userId: '$_createdUserId' },
      //       pipeline: [{ $match: {_status:1, $expr: {$and:[{$eq: [dto.skip, -1]},{$eq: ['$_id', '$$userId']}]       } } },],
      //       as: 'userDetails',
      //     },
      //   },
      //   {
      //     $unwind: {
      //       path: '$userDetails',
      //       preserveNullAndEmptyArrays: true,
      //     },
      //   },
      // );

      arrayAggregation.push({ $project: { _id: 1 } });
      var result = await this.categoriesModel
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

        var resultTotalCount = await this.categoriesModel
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

  async listFilterLoadingCategory(dto: ListFilterLocadingCategoryDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];
      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      arrayAggregation.push({ $group: { _id: '$_groupId' } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.findIndex((it) => it == 100) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GROUP_MASTERS,
              let: { groupId: '$_id' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$groupId'] } } }],
              as: 'groupDetails',
            },
          },
          {
            $unwind: {
              path: '$groupDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.categoriesModel
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

        var resultTotalCount = await this.categoriesModel
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
      var resultCount = await this.categoriesModel
        .count({ _code: dto.value })
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
      var resultCount = await this.categoriesModel
        .count({ _name: dto.value, _status: { $in: [1, 0] } })
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
