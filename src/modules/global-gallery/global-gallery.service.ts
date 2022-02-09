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
} from './global_gallery.dto';
import { GlobalConfig } from 'src/config/global_config';
import { StringUtils } from 'src/utils/string_utils';
import { Counters } from 'src/tableModels/counters.model';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';

@Injectable()
export class GlobalGalleryService {
  constructor(
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,

    @InjectModel(ModelNames.COUNTERS)    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: GlobalGalleryCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    var arrayToStates = [];

    //Doing thumbnail generation
    if (file.hasOwnProperty('documents')) {
      for (var i = 0; i < dto.array.length; i++) {
        var document_location = '';

        if (dto.docType == 0) {
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
            default:
              document_location =
                UploadedFileDirectoryPath.GLOBAL_GALLERY_SUPPLIER;
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

              new ThumbnailUtils().generateThumbnail(filePath,  document_location +
                new StringUtils().makeThumbImageFileName(
                  file['documents'][count]['filename'],
                ));


          
          }
        }
      }
    }


    var resultCounterPurchase= await this.counterModel.findOneAndUpdate(
      { _tableName: ModelNames.GLOBAL_GALLERIES},
      {
        $inc: {
          _count:dto.array.length,
          },
        },
      {  new: true, transactionSession },
    );


    for(var i=0;i<dto.array.length;i++){

        var fileUrl = 'nil';
        var fileUrlThumb = 'nil';
  
        console.log('aaaa   ' + JSON.stringify(file));
          //uploaded files here
          var count = file['documents'].findIndex(
            (it) => it.originalname == dto.array[i].originalname,
          );
  
          console.log('count  ' + count);
  
          if (count != -1) {
            fileUrl = `${process.env.SSL== 'true'?"https":"http"}://${
              process.env.SERVER_DOMAIN
            }:${process.env.PORT}${
              file['documents'][count]['path'].split('public')[1]
            }`;
          }
  
          if (dto.docType == 0) {
            //if image only thumb url need to generate
            fileUrlThumb = new StringUtils().makeThumbImageFileName(fileUrl);
  
            console.log('bbb  ');
          }
     


      arrayToStates.push({
        _name: dto.array[i].name,
        _globalGalleryCategoryId: dto.array[i].globalGalleryCategoryId=="nil"?null:dto.array[i].globalGalleryCategoryId,
        _globalGallerySubCategoryId: dto.array[i].globalGallerySubCategoryId=="nil"?null:dto.array[i].globalGallerySubCategoryId,
        _docType: dto.docType,
        _type: dto.type,
        _url: fileUrl,
        _uid:(resultCounterPurchase._count-dto.array.length+(i+1)),
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
  }

  async status_change(dto: GlobalGalleryStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    var result = await this.globalGalleryModel.updateMany(
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
      { new: true, transactionSession },
    );

    await transactionSession.commitTransaction();
    await transactionSession.endSession();
    return { message: 'success', data: result };
  }

  async list(dto: GlobalGalleryListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

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

    if (dto.subCategoryIds.length > 0) {
      var newSettingsId = [];
      dto.subCategoryIds.map((mapItem) => {
        newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
      });
      arrayAggregation.push({
        $match: { _globalGallerySubCategoryId: { $in: newSettingsId } },
      });
    }
    if (dto.types.length > 0) {
      arrayAggregation.push({ $match: { _type: { $in: dto.types } } });
    }
    if (dto.docTypes.length > 0) {
      arrayAggregation.push({ $match: { _type: { $in: dto.docTypes } } });
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
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$globalGalleryCategoryId'] } } }],
              as: 'globalGalleryCategoryDetails',
            },
          },
          {
            $unwind: { path: '$globalGalleryCategoryDetails', preserveNullAndEmptyArrays: true },
          },
        );
    }
    if (dto.screenType.findIndex((it) => it == 101) != -1) {

      arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERY_SUB_CATEGORIES,
              let: { globalGallerySubCategoryId: '$_globalGallerySubCategoryId' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$globalGallerySubCategoryId'] } } }],
              as: 'globalGallerySubCategoryDetails',
            },
          },
          {
            $unwind: { path: '$globalGallerySubCategoryDetails', preserveNullAndEmptyArrays: true },
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
      arrayAggregation.push({ $group: { _id: null, totalCount: { $sum: 1 } } });

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
  }
}
