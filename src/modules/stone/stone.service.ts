import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { Stone } from 'src/tableModels/stone.model';
import {
  CheckNameExistDto,
  StoneCreateDto,
  StoneEditDto,
  StoneListDto,
  StoneStatusChangeDto,
} from './stone.dto';
import { GlobalConfig } from 'src/config/global_config';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { Counters } from 'src/tableModels/counters.model';
import { StringUtils } from 'src/utils/string_utils';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import { StoneColourLinking } from 'src/tableModels/stoneColourLinking.model';

@Injectable()
export class StoneService {
  constructor(
    @InjectModel(ModelNames.STONE)
    private readonly stoneModel: mongoose.Model<Stone>,
    @InjectModel(ModelNames.STONE_COLOUR_LINKINGS)
    private readonly stoneColourLinkingsModel: mongoose.Model<StoneColourLinking>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: StoneCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];
      var arrayToStoneColourLinkings = [];
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
          // var filePath =
          //   __dirname +
          //   `/../../../public${file['image'][i]['path'].split('public')[1]}`;

          // new ThumbnailUtils().generateThumbnail(
          //   filePath,
          //   UploadedFileDirectoryPath.GLOBAL_GALLERY_STONE +
          //     new StringUtils().makeThumbImageFileName(
          //       file['image'][i]['filename'],
          //     ),
          // );

          var resultUpload = await new S3BucketUtils().uploadMyFile(
            file['image'][i],
            UploadedFileDirectoryPath.GLOBAL_GALLERY_STONE,
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
            _type: 2,
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

      dto.array.map((mapItem) => {
        var stoneId = new mongoose.Types.ObjectId();
        arrayToStates.push({
          _id: stoneId,
          _name: mapItem.name,
          _dataGuard: mapItem.dataGuard,
          _globalGalleryId:
            mapItem['globalGalleryId'] == 'nil'
              ? null
              : mapItem['globalGalleryId'],
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
        mapItem.colourIds.map((mapItem1) => {
          arrayToStoneColourLinkings.push({
            _stoneId: stoneId,
            _colourId: mapItem1,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      });

      var result1 = await this.stoneModel.insertMany(arrayToStates, {
        session: transactionSession,
      });

      await this.stoneColourLinkingsModel.insertMany(
        arrayToStoneColourLinkings,
        {
          session: transactionSession,
        },
      );

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

  async edit(dto: StoneEditDto, _userId_: string, file: Object) {
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
      //     UploadedFileDirectoryPath.GLOBAL_GALLERY_STONE +
      //       new StringUtils().makeThumbImageFileName(
      //         file['image'][0]['filename'],
      //       ),
      //   );
      // }

      var resultUpload = {};
      if (file.hasOwnProperty('image')) {
        resultUpload = await new S3BucketUtils().uploadMyFile(
          file['image'][0],
          UploadedFileDirectoryPath.GLOBAL_GALLERY_STONE,
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
        _dataGuard: dto.dataGuard,
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
      };

      var arrayToStoneColourLinkings = [];

      dto.addColourIds.map((mapItem) => {
        arrayToStoneColourLinkings.push({
          _stoneId: dto.stoneId,
          _colourId: mapItem,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

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
          _type: 2,
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

      var result = await this.stoneModel.findOneAndUpdate(
        {
          _id: dto.stoneId,
        },
        {
          $set: updateObject,
        },
        { new: true, session: transactionSession },
      );
      await this.stoneColourLinkingsModel.updateMany(
        { _id: { $in: dto.deleteColourLinkingIds } },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _status: 2,
          },
        },
        { new: true, session: transactionSession },
      );
      await this.stoneColourLinkingsModel.insertMany(
        arrayToStoneColourLinkings,
        {
          session: transactionSession,
        },
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

  async status_change(dto: StoneStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.stoneModel.updateMany(
        {
          _id: { $in: dto.stoneIds },
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

  async list(dto: StoneListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _name: new RegExp(dto.searchingText, 'i') }],
          },
        });
      }
      if (dto.stoneIds.length > 0) {
        var newSettingsId = [];
        dto.stoneIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
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
          arrayAggregation.push({ $sort: { _name: dto.sortOrder ,_id: dto.sortOrder } });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.includes( 50)) {
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

      if (dto.screenType.includes( 100)) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.STONE_COLOUR_LINKINGS,
            let: { stoneId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_stoneId', '$$stoneId'] },
                },
              },
              {
                $lookup: {
                  from: ModelNames.COLOUR_MASTERS,
                  let: { colourId: '$_colourId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$colourId'] } } },
                  ],
                  as: 'colourDetails',
                },
              },
              {
                $unwind: {
                  path: '$colourDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: 'stoneLinkings',
          },
        });
      }
      var result = await this.stoneModel
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

        var resultTotalCount = await this.stoneModel
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
  async checkNameExisting(dto: CheckNameExistDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCount = await this.stoneModel
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
