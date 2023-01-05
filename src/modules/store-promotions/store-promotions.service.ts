import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { StorePromotions } from 'src/tableModels/store_promotions.model';
import { GlobalConfig } from 'src/config/global_config';
import {
  StorePromotionsCreateDto,
  StorePromotionsListDto,
  StorePromotionsStatusChangeDto,
} from './store_promotions.dto';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import { Counters } from 'src/tableModels/counters.model';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';

@Injectable()
export class StorePromotionsService {
  constructor(
    @InjectModel(ModelNames.STORE_PROMOTIONS)
    private readonly storePromotionModel: mongoose.Model<StorePromotions>,

    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: StorePromotionsCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayGlobalGalleries = [];
      if (file.hasOwnProperty('documents')) {
        console.log('___d1.1');
        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: dto.array.length,
            },
          },
          { new: true, session: transactionSession },
        );

        for (var i = 0; i < file['documents'].length; i++) {
          var resultUpload = await new S3BucketUtils().uploadMyFile(
            file['documents'][i],
            UploadedFileDirectoryPath.GLOBAL_GALLERY_STORE_PROMOTIONS,
          );

          if (resultUpload['status'] == 0) {
            throw new HttpException(
              'File upload error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          //   var count = dto.array.findIndex(
          //     (it) => it.fileOriginalName == file['documents'][i]['originalname'],
          //   );
          //   if (count != -1) {
          //     dto.array[count]['url'] = resultUpload['url'];
          //   } else {
          //     dto.array[count]['url'] = 'nil';
          //   }

          var globalGalleryId = new mongoose.Types.ObjectId();
          arrayGlobalGalleries.push({
            _id: globalGalleryId,
            _name: file['documents'][i]['originalname'],
            _globalGalleryCategoryId: null,
            _docType: 0,
            _type: 0,
            _uid:
              resultCounterPurchase._count - file['documents'].length + (i + 1),
            _url: resultUpload['url'],
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
          var count = dto.array.findIndex(
            (it) => it.fileOriginalName == file['documents'][i]['originalname'],
          );
          if (count != -1) {
            dto.array[count]['globalGalleryMobileId'] = globalGalleryId;
          } else {
            dto.array[count]['globalGalleryMobileId'] = 'nil';
          }
        }
        // console.log('___d2');
        // for (var i = 0; i < dto.array.length; i++) {
        //   var count = file['documents'].findIndex(
        //     (it) => it.originalname == dto.array[i].fileOriginalName,
        //   );
        //   if (count != -1) {
        //     var globalGalleryId = new mongoose.Types.ObjectId();
        //     arrayGlobalGalleries.push({
        //       _id: globalGalleryId,
        //       _name: dto.array[i].fileOriginalName,
        //       _globalGalleryCategoryId: null,
        //       _docType: 0,
        //       _type: 7,
        //       _uid:
        //         resultCounterPurchase._count -
        //         dto.array.length +
        //         (i + 1),
        //       _url: dto.array[i]['url'],
        //       _createdUserId: _userId_,
        //       _createdAt: dateTime,
        //       _updatedUserId: null,
        //       _updatedAt: -1,
        //       _status: 1,
        //     });

        //   }
        // }
        // console.log('___d3');
        await this.globalGalleryModel.insertMany(arrayGlobalGalleries, {
          session: transactionSession,
        });
      }
      if (file.hasOwnProperty('documentsDesk')) {
        console.log('___d1.1');
        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: dto.array.length,
            },
          },
          { new: true, session: transactionSession },
        );

        for (var i = 0; i < file['documentsDesk'].length; i++) {
          var resultUpload = await new S3BucketUtils().uploadMyFile(
            file['documentsDesk'][i],
            UploadedFileDirectoryPath.GLOBAL_GALLERY_STORE_PROMOTIONS,
          );

          if (resultUpload['status'] == 0) {
            throw new HttpException(
              'File upload error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          //   var count = dto.array.findIndex(
          //     (it) => it.fileOriginalName == file['documentsDesk'][i]['originalname'],
          //   );
          //   if (count != -1) {
          //     dto.array[count]['url'] = resultUpload['url'];
          //   } else {
          //     dto.array[count]['url'] = 'nil';
          //   }

          var globalGalleryId = new mongoose.Types.ObjectId();
          arrayGlobalGalleries.push({
            _id: globalGalleryId,
            _name: file['documentsDesk'][i]['originalname'],
            _globalGalleryCategoryId: null,
            _docType: 0,
            _type: 0,
            _uid:
              resultCounterPurchase._count -
              file['documentsDesk'].length +
              (i + 1),
            _url: resultUpload['url'],
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
          var count = dto.array.findIndex(
            (it) =>
              it.fileOriginalName == file['documentsDesk'][i]['originalname'],
          );
          if (count != -1) {
            dto.array[count]['globalGalleryDeskId'] = globalGalleryId;
          } else {
            dto.array[count]['globalGalleryDeskId'] = 'nil';
          }
        }
        // console.log('___d2');
        // for (var i = 0; i < dto.array.length; i++) {
        //   var count = file['documents'].findIndex(
        //     (it) => it.originalname == dto.array[i].fileOriginalName,
        //   );
        //   if (count != -1) {
        //     var globalGalleryId = new mongoose.Types.ObjectId();
        //     arrayGlobalGalleries.push({
        //       _id: globalGalleryId,
        //       _name: dto.array[i].fileOriginalName,
        //       _globalGalleryCategoryId: null,
        //       _docType: 0,
        //       _type: 7,
        //       _uid:
        //         resultCounterPurchase._count -
        //         dto.array.length +
        //         (i + 1),
        //       _url: dto.array[i]['url'],
        //       _createdUserId: _userId_,
        //       _createdAt: dateTime,
        //       _updatedUserId: null,
        //       _updatedAt: -1,
        //       _status: 1,
        //     });

        //   }
        // }
        // console.log('___d3');
        await this.globalGalleryModel.insertMany(arrayGlobalGalleries, {
          session: transactionSession,
        });
      }

      var arrayToStates = [];

      dto.array.map((mapItem) => {
        arrayToStates.push({
          _type: mapItem.type,
          _priority: mapItem.priority,
          _group: mapItem.group,
          _globalGalleryMobileId:
            mapItem['globalGalleryMobileId'] == 'nil'
              ? null
              : mapItem['globalGalleryMobileId'],
          _globalGalleryDeskId:
            mapItem['globalGalleryDeskId'] == 'nil'
              ? null
              : mapItem['globalGalleryDeskId'],
          _createdAt: dateTime,
          _createdUserId: _userId_,
          _status: 1,
        });
      });

      var result1 = await this.storePromotionModel.insertMany(arrayToStates, {
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

  async status_change(dto: StorePromotionsStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.storePromotionModel.updateMany(
        {
          _id: { $in: dto.storePromotionIds },
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

  async list(dto: StorePromotionsListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.storePromotionIds.length > 0) {
        var newSettingsId = [];
        dto.storePromotionIds.map((mapItem) => {
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
          arrayAggregation.push({
            $sort: { _status: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 2:
          arrayAggregation.push({
            $sort: { _type: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 3:
          arrayAggregation.push({
            $sort: { _priority: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 4:
          arrayAggregation.push({
            $sort: { _group: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      if (dto.screenType.includes(50)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERIES,
              let: { globalGalleryId: '$_globalGalleryMobileId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } } },
              ],
              as: 'globalGalleryMobileDetails',
            },
          },
          {
            $unwind: {
              path: '$globalGalleryMobileDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(51)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERIES,
              let: { globalGalleryId: '$_globalGalleryDeskId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } } },
              ],
              as: 'globalGalleryDeskDetails',
            },
          },
          {
            $unwind: {
              path: '$globalGalleryDeskDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      var result = await this.storePromotionModel
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

        var resultTotalCount = await this.storePromotionModel
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
