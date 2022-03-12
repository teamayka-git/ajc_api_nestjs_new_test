import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import {
  GlobalGalleryCreateDto,
  GlobalGalleryListDto,
  GlobalGalleryStatusChangeDto,
  HomeDefaultFolderDto,
  HomeItemsDto,
} from './global_gallery.dto';
import { GlobalConfig } from 'src/config/global_config';
import { StringUtils } from 'src/utils/string_utils';
import { Counters } from 'src/tableModels/counters.model';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { GlobalGalleryCategories } from 'src/tableModels/globalGallerycategories.model';

@Injectable()
export class GlobalGalleryService {
  constructor(
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,

    @InjectModel(ModelNames.GLOBAL_GALLERY_CATEGORIES)
    private readonly globalGalleryCategoriesModel: mongoose.Model<GlobalGalleryCategories>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: GlobalGalleryCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];

      //Doing thumbnail generation
      if (file.hasOwnProperty('documents')) {
        for (var i = 0; i < dto.array.length; i++) {
          var document_location = '';

          if (dto.array[i].docType == 0) {
            switch (dto.type) {
              case 0:
                document_location =
                  UploadedFileDirectoryPath.GLOBAL_GALLERY_CATEGORY;
                break;
              case 1:
                document_location =
                  UploadedFileDirectoryPath.GLOBAL_GALLERY_SUB_CATEGORY;
                break;
              case 2:
                document_location =
                  UploadedFileDirectoryPath.GLOBAL_GALLERY_STONE;
                break;
              case 3:
                document_location =
                  UploadedFileDirectoryPath.GLOBAL_GALLERY_AGENT;
                break;
              case 4:
                document_location =
                  UploadedFileDirectoryPath.GLOBAL_GALLERY_BRANCH;
                break;
              case 5:
                document_location =
                  UploadedFileDirectoryPath.GLOBAL_GALLERY_EMPLOYEE;
                break;
              case 6:
                document_location =
                  UploadedFileDirectoryPath.GLOBAL_GALLERY_SUPPLIER;
              case 7:
                document_location =
                  UploadedFileDirectoryPath.GLOBAL_GALLERY_CUSTOMER;
                break;
              default:
                document_location =
                  UploadedFileDirectoryPath.GLOBAL_GALLERY_OTHERS;
                break;
            }

            var count = file['documents'].findIndex(
              (it) => dto.array[i].originalname == it.originalname,
            );
            if (count != -1) {
              var filePath =
                __dirname +
                `/../../../public${
                  file['documents'][count]['path'].split('public')[1]
                }`;

              new ThumbnailUtils().generateThumbnail(
                filePath,
                document_location +
                  new StringUtils().makeThumbImageFileName(
                    file['documents'][count]['filename'],
                  ),
              );
            }
          }
        }
      }

      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.GLOBAL_GALLERIES },
        {
          $inc: {
            _count: dto.array.length,
          },
        },
        { new: true, session: transactionSession },
      );

      for (var i = 0; i < dto.array.length; i++) {
        var fileUrl = 'nil';
        var fileUrlThumb = 'nil';

        //uploaded files here
        var count = file['documents'].findIndex(
          (it) => it.originalname == dto.array[i].originalname,
        );
 

        if (count != -1) {
          fileUrl = `${process.env.SSL == 'true' ? 'https' : 'http'}://${
            process.env.SERVER_DOMAIN
          }:${process.env.PORT}${
            file['documents'][count]['path'].split('public')[1]
          }`;
        }

        if (dto.array[i].docType == 0) {
          //if image only thumb url need to generate
          fileUrlThumb = new StringUtils().makeThumbImageFileName(fileUrl);

        }

        arrayToStates.push({
          _name: dto.array[i].name,
          _globalGalleryCategoryId:
            dto.array[i].categoryId == 'nil' ? null : dto.array[i].categoryId,
          _docType: dto.array[i].docType,
          _type: dto.type,
          _url: fileUrl,
          _uid: resultCounterPurchase._count - dto.array.length + (i + 1),
          _thumbUrl: fileUrlThumb,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      }

      var result1 = await this.globalGalleryModel.insertMany(arrayToStates, {
        session: transactionSession,
      });

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: 'success', data: { list: result1 } };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async status_change(dto: GlobalGalleryStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      const result = await this.globalGalleryModel.updateMany(
        {
          _id: { $in: dto.globalGalleryIds },
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

  async list(dto: GlobalGalleryListDto) {
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
              { _uid: dto.searchingText },
            ],
          },
        });
      }
      if (dto.globalGalleryIds.length > 0) {
        var newSettingsId = [];
        dto.globalGalleryIds.map((mapItem) => {
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
          $match: { _globalGalleryCategoryId: { $in: newSettingsId } },
        });
      }
      if (dto.types.length > 0) {
        arrayAggregation.push({ $match: { _type: { $in: dto.types } } });
      }
      if (dto.docTypes.length > 0) {
        arrayAggregation.push({ $match: { _docType: { $in: dto.docTypes } } });
      }

      arrayAggregation.push({ $sort: { _id: -1 } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.findIndex((it) => it == 100) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERY_CATEGORIES,
              let: { globalGalleryCategoryId: '$_globalGalleryCategoryId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$globalGalleryCategoryId'] },
                  },
                },
              ],
              as: 'globalGalleryCategoryDetails',
            },
          },
          {
            $unwind: {
              path: '$globalGalleryCategoryDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      var result = await this.globalGalleryModel
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

        var resultTotalCount = await this.globalGalleryModel
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

  async home() {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregationMainCategory = [];
      arrayAggregationMainCategory.push({ $match: { _status: 1, _type: 1 } });
      arrayAggregationMainCategory.push({ $sort: { _id: -1 } });

      arrayAggregationMainCategory.push({
        $project: {
          _name: 1,
          _type: 1,
          _dataGuard: 1,
        },
      });

      var resultMainCategories =
        await this.globalGalleryCategoriesModel.aggregate(
          arrayAggregationMainCategory,
        );

      var resultItems = [];
      var resultSubCategory = [];
      if (resultMainCategories.length != 0) {
        var arrayAggregationSubCategory = [];
        arrayAggregationSubCategory.push({ $match: { _status: 1, _type: 2 } });
        arrayAggregationSubCategory.push({
          $match: {
            _globalGalleryCategoryId: new mongoose.Types.ObjectId(
              resultMainCategories[0]._id,
            ),
          },
        });
        arrayAggregationSubCategory.push({ $sort: { _id: -1 } });

        arrayAggregationSubCategory.push({
          $project: {
            _name: 1,
            _type: 1,
            _dataGuard: 1,
          },
        });

        resultSubCategory = await this.globalGalleryCategoriesModel.aggregate(
          arrayAggregationSubCategory,
        );

        var arrayAggregationItems = [];
        arrayAggregationItems.push({
          $match: {
            _status: 1,
            _globalGalleryCategoryId: new mongoose.Types.ObjectId(
              resultMainCategories[0]._id,
            ),
          },
        });

        arrayAggregationItems.push({ $sort: { _id: -1 } });

        arrayAggregationItems.push({
          $project: {
            _name: 1,
            _globalGalleryCategoryId: 1,
            _docType: 1,
            _type: 1,
            _uid: 1,
            _url: 1,
            _thumbUrl: 1,
          },
        });

        var resultItems = await this.globalGalleryModel.aggregate(
          arrayAggregationItems,
        );
      }

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return {
        message: 'success',
        data: {
          listCategories: resultMainCategories,
          listSubCategories: resultSubCategory,
          listItems: resultItems,
        },
      };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async homeDefaultFolder(dto: HomeDefaultFolderDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregationItems = [];
      arrayAggregationItems.push({
        $match: {
          _status: 1,
          _globalGalleryCategoryId: null,
          _type: dto.type,
        },
      });

      arrayAggregationItems.push({ $sort: { _id: -1 } });

      arrayAggregationItems.push({
        $project: {
          _name: 1,
          _globalGalleryCategoryId: 1,
          _docType: 1,
          _type: 1,
          _uid: 1,
          _url: 1,
          _thumbUrl: 1,
        },
      });

      var resultItems = await this.globalGalleryModel.aggregate(
        arrayAggregationItems,
      );

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return {
        message: 'success',
        data: {
          list: resultItems,
        },
      };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async homeItems(dto: HomeItemsDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregationSubCategory = [];
      arrayAggregationSubCategory.push({ $match: { _status: 1, _type: 2 } });
      arrayAggregationSubCategory.push({
        $match: {
          _globalGalleryCategoryId: new mongoose.Types.ObjectId(dto.categoryId),
        },
      });
      arrayAggregationSubCategory.push({ $sort: { _id: -1 } });

      arrayAggregationSubCategory.push({
        $project: {
          _name: 1,
          _type: 1,
          _dataGuard: 1,
        },
      });

      var resultMainCategories =
        await this.globalGalleryCategoriesModel.aggregate(
          arrayAggregationSubCategory,
        );

      var arrayAggregationItems = [];
      arrayAggregationItems.push({
        $match: {
          _status: 1,
          _globalGalleryCategoryId: new mongoose.Types.ObjectId(dto.categoryId),
        },
      });

      arrayAggregationItems.push({ $sort: { _id: -1 } });
      arrayAggregationItems.push(
        {
          $lookup: {
            from: ModelNames.GLOBAL_GALLERY_CATEGORIES,
            let: { categoryId: '$_globalGalleryCategoryId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$categoryId'] } } },
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
      );
      arrayAggregationItems.push({
        $project: {
          _name: 1,
          _globalGalleryCategoryId: 1,
          _docType: 1,
          _type: 1,
          _uid: 1,
          _url: 1,
          _thumbUrl: 1,
          subCategoryDetails: {
            _name: 1,
            _type: 1,
            _dataGuard: 1,
          },
        },
      });

      var resultItems = await this.globalGalleryModel.aggregate(
        arrayAggregationItems,
      );

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return {
        message: 'success',
        data: {
          listCategories: resultMainCategories,
          listItems: resultItems,
        },
      };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }
}
