import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';
import { Counters } from 'src/tableModels/counters.model';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { TagMaters } from 'src/tableModels/tag_masters.model';
import * as mongoose from 'mongoose';
import {
  CheckNameExistDto,
  TagLinkedProductListDto,
  TagMasterCreateDto,
  TagMasterEditDto,
  TagMasterListDto,
  TagMasterStatusChangeDto,
} from './tag_masters.dto';
import { TagMasterDocuments } from 'src/tableModels/tag_master_documents.model';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { ProductTagLinkings } from 'src/tableModels/product_tag_linkings.model';

@Injectable()
export class TagMastersService {
  constructor(
    @InjectModel(ModelNames.TAG_MASTERS)
    private readonly tagMasterModel: Model<TagMaters>,
    @InjectModel(ModelNames.TAG_MASTER_DOCUMENTS)
    private readonly tagMasterDocumentModel: Model<TagMasterDocuments>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly countersModel: Model<Counters>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: Model<GlobalGalleries>,
    @InjectModel(ModelNames.PRODUCT_TAG_LINKINGS)
    private readonly productTagLinkingModel: Model<ProductTagLinkings>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: TagMasterCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var tagMasterId = new mongoose.Types.ObjectId();

      var arrayGlobalGalleries = [];
      var arrayGlobalGalleriesDocuments = [];

      if (file.hasOwnProperty('documents')) {
        var resultCounterPurchase = await this.countersModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: dto.arrayDocuments.length,
            },
          },
          { new: true, session: transactionSession },
        );

        // for (var i = 0; i < dto.arrayDocuments.length; i++) {
        //   var count = file['documents'].findIndex(
        //     (it) => dto.arrayDocuments[i].fileOriginalName == it.originalname,
        //   );

        //   if (count != -1) {
        //     if (dto.arrayDocuments[i].docType == 0) {
        //       var filePath =
        //         __dirname +
        //         `/../../../public${
        //           file['documents'][count]['path'].split('public')[1]
        //         }`;

        //       new ThumbnailUtils().generateThumbnail(
        //         filePath,
        //         UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP +
        //           new StringUtils().makeThumbImageFileName(
        //             file['documents'][count]['filename'],
        //           ),
        //       );
        //     }
        //   }
        // }

        for (var i = 0; i < file['documents'].length; i++) {
          var resultUpload = await new S3BucketUtils().uploadMyFile(
            file['documents'][i],
            UploadedFileDirectoryPath.GLOBAL_GALLERY_TAG_MASTER,
          );

          if (resultUpload['status'] == 0) {
            throw new HttpException(
              'File upload error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          var count = dto.arrayDocuments.findIndex(
            (it) => it.fileOriginalName == file['documents'][i]['originalname'],
          );
          if (count != -1) {
            dto.arrayDocuments[count]['url'] = resultUpload['url'];
          } else {
            dto.arrayDocuments[count]['url'] = 'nil';
          }
        }

        for (var i = 0; i < dto.arrayDocuments.length; i++) {
          var count = file['documents'].findIndex(
            (it) => it.originalname == dto.arrayDocuments[i].fileOriginalName,
          );
          if (count != -1) {
            var globalGalleryId = new mongoose.Types.ObjectId();
            arrayGlobalGalleries.push({
              _id: globalGalleryId,
              _name: dto.arrayDocuments[i].fileOriginalName,
              _globalGalleryCategoryId: null,
              _docType: dto.arrayDocuments[i].docType,
              _type: 7,
              _uid:
                resultCounterPurchase._count -
                dto.arrayDocuments.length +
                (i + 1),
              _url: dto.arrayDocuments[i]['url'],
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
            });
            arrayGlobalGalleriesDocuments.push({
              _tagId: tagMasterId,
              _globalGalleryId: globalGalleryId,
              _priority: dto.arrayDocuments[i].priority,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
            });
          }
        }
        await this.globalGalleryModel.insertMany(arrayGlobalGalleries, {
          session: transactionSession,
        });
        await this.tagMasterDocumentModel.insertMany(
          arrayGlobalGalleriesDocuments,
          {
            session: transactionSession,
          },
        );
      }

      const newsettingsModel = new this.tagMasterModel({
        _id: tagMasterId,
        _name: dto.name,
        _dataGuard: dto.dataGuard,
        _priority: dto.priority,
        _startAt: dto.startAt,
        _endAt: dto.endAt,
        _type: dto.type,
        _isShowEcommerce: dto.isShowEcommerce,
        _tagId: dto.tagId == '' ? null : dto.tagId,
        _createdUserId: null,
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

  async edit(dto: TagMasterEditDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    try {
      //   _globalGalleryId:globalGalleryId,

      var arrayGlobalGalleries = [];
      var arrayGlobalGalleriesDocuments = [];

      if (file.hasOwnProperty('documents')) {
        var resultCounterPurchase = await this.countersModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: dto.arrayDocuments.length,
            },
          },
          { new: true, session: transactionSession },
        );

        // for (var i = 0; i < dto.arrayDocuments.length; i++) {
        //   var count = file['documents'].findIndex(
        //     (it) => dto.arrayDocuments[i].fileOriginalName == it.originalname,
        //   );

        //   if (count != -1) {
        //     if (dto.arrayDocuments[i].docType == 0) {
        //       var filePath =
        //         __dirname +
        //         `/../../../public${
        //           file['documents'][count]['path'].split('public')[1]
        //         }`;

        //       new ThumbnailUtils().generateThumbnail(
        //         filePath,
        //         UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP +
        //           new StringUtils().makeThumbImageFileName(
        //             file['documents'][count]['filename'],
        //           ),
        //       );
        //     }
        //   }
        // }

        for (var i = 0; i < file['documents'].length; i++) {
          var resultUpload = await new S3BucketUtils().uploadMyFile(
            file['documents'][i],
            UploadedFileDirectoryPath.GLOBAL_GALLERY_TAG_MASTER,
          );

          if (resultUpload['status'] == 0) {
            throw new HttpException(
              'File upload error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          var count = dto.arrayDocuments.findIndex(
            (it) => it.fileOriginalName == file['documents'][i]['originalname'],
          );
          if (count != -1) {
            dto.arrayDocuments[count]['url'] = resultUpload['url'];
          } else {
            dto.arrayDocuments[count]['url'] = 'nil';
          }
        }

        for (var i = 0; i < dto.arrayDocuments.length; i++) {
          var count = file['documents'].findIndex(
            (it) => it.originalname == dto.arrayDocuments[i].fileOriginalName,
          );
          if (count != -1) {
            var globalGalleryId = new mongoose.Types.ObjectId();
            arrayGlobalGalleries.push({
              _id: globalGalleryId,
              _name: dto.arrayDocuments[i].fileOriginalName,
              _globalGalleryCategoryId: null,
              _docType: dto.arrayDocuments[i].docType,
              _type: 7,
              _uid:
                resultCounterPurchase._count -
                dto.arrayDocuments.length +
                (i + 1),
              _url: dto.arrayDocuments[i]['url'],
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
            });
            arrayGlobalGalleriesDocuments.push({
              _tagId: dto.tagMasterId,
              _globalGalleryId: globalGalleryId,
              _priority: dto.arrayDocuments[i].priority,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
            });
          }
        }
        await this.tagMasterDocumentModel.updateMany(
          { _tagId: dto.tagMasterId, _status: 1 },
          { $set: { _status: 0 } },
          { new: true, session: transactionSession },
        );
      }
      await this.globalGalleryModel.insertMany(arrayGlobalGalleries, {
        session: transactionSession,
      });
      await this.tagMasterDocumentModel.insertMany(
        arrayGlobalGalleriesDocuments,
        {
          session: transactionSession,
        },
      );

      var updateObject = {
        _name: dto.name,
        _dataGuard: dto.dataGuard,
        _priority: dto.priority,
        _type: dto.type,
        _startAt: dto.startAt,
        _endAt: dto.endAt,
        _tagId: dto.tagId == '' ? null : dto.tagId,
        _isShowEcommerce: dto.isShowEcommerce,
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
      };

      var result = await this.tagMasterModel.findOneAndUpdate(
        {
          _id: dto.tagMasterId,
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

  async status_change(dto: TagMasterStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.tagMasterModel.updateMany(
        {
          _id: { $in: dto.tagMasterIds },
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

  async list(dto: TagMasterListDto) {
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
      if (dto.tagMasterIds.length > 0) {
        var newSettingsId = [];
        dto.tagMasterIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }
      if (dto.parentTagMasterIds.length > 0) {
        var newSettingsId = [];
        dto.parentTagMasterIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _tagId: { $in: newSettingsId } } });
      }
      if (dto.isShowEcommerce.length > 0) {
        arrayAggregation.push({
          $match: { _isShowEcommerce: { $in: dto.isShowEcommerce } },
        });
      }

      if (dto.type.length > 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.type } },
        });
      }
      if (dto.startAt != -1) {
        arrayAggregation.push({
          $match: {
            $or: [
              { _startAt: { $eq: -1 } },
              { _startAt: { $gte: dto.startAt } },
            ],
          },
        });
      }
      if (dto.endAt != -1) {
        arrayAggregation.push({
          $match: {
            $or: [{ _endAt: { $eq: -1 } }, { _endAt: { $lte: dto.endAt } }],
          },
        });
      }

      // _endAt: { $eq: -1, $lte: dto.endAt }
      // _startAt: { $eq: -1, $gte: dto.startAt }
      // requestConference.push({
      //   $match: {
      //     $or: [{ _expiryDate: { $gt: dateTime } }, { _expiryDate: -1 }],
      //   },
      // });

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({ $sort: { _status: dto.sortOrder  ,_id: dto.sortOrder} });
          break;
        case 2:
          arrayAggregation.push({ $sort: { _name: dto.sortOrder  ,_id: dto.sortOrder} });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _priority: dto.sortOrder  ,_id: dto.sortOrder} });
          break;
        case 4:
          arrayAggregation.push({ $sort: { _startAt: dto.sortOrder ,_id: dto.sortOrder } });
          break;
        case 5:
          arrayAggregation.push({ $sort: { _endAt: dto.sortOrder ,_id: dto.sortOrder } });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      arrayAggregation.push(
        new ModelWeightResponseFormat().tagMasterResponseFormat(
          0,
          dto.responseFormat,
        ),
      );


      if (dto.screenType.includes(103)) {//tag

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.TAG_MASTERS,
              let: { mainTagId: '$_id' },
              pipeline: [
                {
                  $match: {_status:1, $expr: { $eq: ['$_tagId', '$$mainTagId'] } },
                },
               {$project:{
                _id:1
               }},

               {
                $lookup: {
                  from: ModelNames.PRODUCT_TAG_LINKINGS,
                  let: { tagId: '$_id' },
                  pipeline: [
                    {
                      $match: {_status:1, $expr: { $eq: ['$_tagId', '$$tagId'] } },
                    },
                  {$project:{_id:1}},{ "$count": "count" },
                  ],
                  as: 'tagProductLinking',
                },
              },
              {
                $unwind: {
                  path: '$tagProductLinking',
                  preserveNullAndEmptyArrays: true,
                },
              },



              ],
              as: 'subTagCount',
            },
          }
        );




      }
      if (dto.screenType.includes(104)) {//subtag
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.PRODUCT_TAG_LINKINGS,
              let: { tagId: '$_id' },
              pipeline: [
                {
                  $match: {_status:1, $expr: { $eq: ['$_tagId', '$$tagId'] } },
                },
              {$project:{_id:1}},{ "$count": "count" },
              ],
              as: 'tagProductLinking',
            },
          },
          {
            $unwind: {
              path: '$tagProductLinking',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }




      if (dto.screenType.includes(100)) {
        const tagDocumentsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: { _status: 1, $expr: { $eq: ['$_tagId', '$$tagId'] } },
            },
            new ModelWeightResponseFormat().tagDocumentsLinkingResponseFormat(
              1000,
              dto.responseFormat,
            ),
          );
          if (dto.screenType.includes(101)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } },
                    },
                    new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                      1010,
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

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.TAG_MASTER_DOCUMENTS,
            let: { tagId: '$_id' },
            pipeline: tagDocumentsPipeline(),
            as: 'tagDocumentsList',
          },
        });
      }

      if (dto.screenType.includes(102)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.TAG_MASTERS,
              let: { tagId: '$_tagId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$tagId'] } },
                },
                new ModelWeightResponseFormat().tagMasterResponseFormat(
                  1020,
                  dto.responseFormat,
                ),
              ],
              as: 'tagMasterDetails',
            },
          },
          {
            $unwind: {
              path: '$tagMasterDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.tagMasterModel
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

        var resultTotalCount = await this.tagMasterModel
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

  async tagLinkedProducts(dto: TagLinkedProductListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      console.log('___ tag master  ' + JSON.stringify(dto));

      if (
        dto.searchingText != '' ||
        (dto.gwStart != -1 && dto.gwEnd != -1) ||
        (dto.nwStart != -1 && dto.nwEnd != -1) ||
        (dto.swStart != -1 && dto.swEnd != -1)
      ) {
        var pipeline = [];
        pipeline.push({
          $match: {
            $expr: { $eq: ['$_id', '$$productId'] },
          },
        });

        if (dto.searchingText != '') {
          pipeline.push({
            $match: { _name: new RegExp(dto.searchingText, 'i') },
          });
        }
        if (dto.gwStart != -1 && dto.gwEnd != -1) {
          pipeline.push({
            $match: { _grossWeight: { $lte: dto.gwEnd, $gte: dto.gwStart } },
          });
        }
        if (dto.swStart != -1 && dto.swEnd != -1) {
          pipeline.push({
            $match: {
              _totalStoneWeight: { $lte: dto.swEnd, $gte: dto.swStart },
            },
          });
        }
        if (dto.nwStart != -1 && dto.nwEnd != -1) {
          pipeline.push({
            $match: { _netWeight: { $lte: dto.nwEnd, $gte: dto.nwStart } },
          });
        }

        pipeline.push({ $project: { _id: 1 } });
        // _name: new RegExp(dto.searchingText, 'i'),
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.PRODUCTS,
              let: { productId: '$_productId' },
              pipeline: pipeline,
              as: 'productNameMongoCheck',
            },
          },
          {
            $unwind: {
              path: '$productNameMongoCheck',
            },
          },
        );
      }

      if (dto.tagIds.length > 0) {
        var newSettingsId = [];
        dto.tagIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _tagId: { $in: newSettingsId } } });
      }
      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({ $sort: { _status: dto.sortOrder  ,_id: dto.sortOrder} });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      arrayAggregation.push(
        new ModelWeightResponseFormat().productTagLinkingResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(100)) {
        const productPipeline = () => {
          const pipeline = [];
          pipeline.push(
            { $match: { $expr: { $eq: ['$_id', '$$productId'] } } },
            new ModelWeightResponseFormat().productTableResponseFormat(
              1000,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(101)) {
            const productDocumentLinkingPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: { $expr: { $eq: ['$_productId', '$$productSubId'] } },
                },
                new ModelWeightResponseFormat().productDocumentLinkingTableResponseFormat(
                  1010,
                  dto.responseFormat,
                ),
              );

              if (dto.screenType.includes(102)) {
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
                          1020,
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

            pipeline.push({
              $lookup: {
                from: ModelNames.PRODUCT_DOCUMENTS_LINKIGS,
                let: { productSubId: '$_id' },
                pipeline: productDocumentLinkingPipeline(),
                as: 'productDocumentLinking',
              },
            });
          }

          if (dto.screenType.includes(103)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.SUB_CATEGORIES,
                  let: { subcategoryId: '$_subCategoryId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$subcategoryId'] },
                      },
                    },
                    new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                      1030,
                      dto.responseFormat,
                    ),
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
          }

          if (dto.screenType.includes(104)) {
            const productStoneLinkingPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_productId', '$$productId'] },
                  },
                },
                new ModelWeightResponseFormat().productStoneLinkingTableResponseFormat(
                  1040,
                  dto.responseFormat,
                ),
              );

              if (dto.screenType.includes(105)) {
                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.COLOUR_MASTERS,
                      let: { colorId: '$_stoneColourId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: { $eq: ['$_id', '$$colorId'] },
                          },
                        },
                        new ModelWeightResponseFormat().colourMasterTableResponseFormat(
                          1050,
                          dto.responseFormat,
                        ),
                      ],
                      as: 'colorDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$colorDetails',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                );
              }
              return pipeline;
            };

            pipeline.push({
              $lookup: {
                from: ModelNames.PRODUCT_STONE_LINKIGS,
                let: { productId: '$_id' },
                pipeline: productStoneLinkingPipeline(),
                as: 'productStoneLinking',
              },
            });
          }

          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.PRODUCTS,
              let: { productId: '$_productId' },
              pipeline: productPipeline(),
              as: 'productDetails',
            },
          },
          {
            $unwind: {
              path: '$productDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      console.log('___arrayAggregation   ' + JSON.stringify(arrayAggregation));

      // if (dto.screenType.includes(100)) {
      //   const tagDocumentsPipeline = () => {
      //     const pipeline = [];
      //     pipeline.push(
      //       {
      //         $match: { _status: 1, $expr: { $eq: ['$_tagId', '$$tagId'] } },
      //       },
      //       new ModelWeightResponseFormat().tagDocumentsLinkingResponseFormat(
      //         1000,
      //         dto.responseFormat,
      //       ),
      //     );
      //     if (dto.screenType.includes(101)) {
      //       pipeline.push(
      //         {
      //           $lookup: {
      //             from: ModelNames.GLOBAL_GALLERIES,
      //             let: { globalGalleryId: '$_globalGalleryId' },
      //             pipeline: [
      //               {
      //                 $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } },
      //               },
      //               new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
      //                 1010,
      //                 dto.responseFormat,
      //               ),
      //             ],
      //             as: 'globalGalleryDetails',
      //           },
      //         },
      //         {
      //           $unwind: {
      //             path: '$globalGalleryDetails',
      //             preserveNullAndEmptyArrays: true,
      //           },
      //         },
      //       );
      //     }
      //     return pipeline;
      //   };

      //   arrayAggregation.push({
      //     $lookup: {
      //       from: ModelNames.TAG_MASTER_DOCUMENTS,
      //       let: { tagId: '$_id' },
      //       pipeline: tagDocumentsPipeline(),
      //       as: 'tagDocumentsList',
      //     },
      //   });
      // }

      var result = await this.productTagLinkingModel
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

        var resultTotalCount = await this.productTagLinkingModel
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
      var resultCount = await this.tagMasterModel
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
