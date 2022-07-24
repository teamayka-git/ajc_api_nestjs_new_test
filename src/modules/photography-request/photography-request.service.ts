import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';
import * as mongoose from 'mongoose';
import { PhotographerRequests } from 'src/tableModels/photographer_requests.model';
import {
  PhotographyRequestCreateDto,
  PhotographyRequestListDto,
  PhotographyRequestStatusChangeDto,
  PhotographyStatusChangeDto,
  ProductDocumentsStatusChangeDto,
} from './photography_request.dto';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { Counters } from 'src/tableModels/counters.model';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { ProductsDocuments } from 'src/tableModels/products_documents.model';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';

@Injectable()
export class PhotographyRequestService {
  constructor(
    @InjectModel(ModelNames.PHOTOGRAPHER_REQUESTS)
    private readonly photographyRequestModel: mongoose.Model<PhotographerRequests>,
    @InjectModel(ModelNames.PRODUCT_DOCUMENTS_LINKIGS)
    private readonly productDocumentsModel: mongoose.Model<ProductsDocuments>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: PhotographyRequestCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];

      var resultCounterPhotographer = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.PHOTOGRAPHER_REQUESTS },
        {
          $inc: {
            _count: dto.array.length,
          },
        },
        { new: true, session: transactionSession },
      );

      dto.array.map((mapItem, index) => {
        arrayToStates.push({
          _rootCauseId: null,
          _orderItemId: mapItem.orderItemId,
          _productId: mapItem.productId,
          _requestStatus: 0,
          _description: mapItem.description,
          _userId: mapItem.assignUserId,
          _uid: resultCounterPhotographer._count - index,
          _finishedAt: -1,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      var result1 = await this.photographyRequestModel.insertMany(
        arrayToStates,
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

  async status_change(dto: PhotographyStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.photographyRequestModel.updateMany(
        {
          _id: { $in: dto.photographyIds },
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
  async status_change_product_documents(
    dto: ProductDocumentsStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.productDocumentsModel.updateMany(
        {
          _id: { $in: dto.productDocumentsIds },
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

  async request_status_change(
    dto: PhotographyRequestStatusChangeDto,
    _userId_: string,
    file: Object,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayGlobalGalleries = [];
      var arrayProductsDocuments = [];

      if (file.hasOwnProperty('documents')) {
        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: file['documents'].length,
            },
          },
          { new: true, session: transactionSession },
        );

        for (var i = 0; i < file['documents'].length; i++) {
          var resultUpload = await new S3BucketUtils().uploadMyFile(
            file['documents'][i],
            UploadedFileDirectoryPath.GLOBAL_GALLERY_PRODUCT,
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
            _name: file['documents'][i]['originalname'],
            _globalGalleryCategoryId: null,
            _docType: 0,
            _type: 2,
            _uid:
              resultCounterPurchase._count - file['documents'].length + (i + 1),
            _url: resultUpload['url'],
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        }

        arrayGlobalGalleries.map((mapItem) => {
          arrayProductsDocuments.push({
            _productId: dto.productId,
            _globalGalleryId: mapItem._id,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: 0,
            _status: 1,
          });
        });

        await this.productDocumentsModel.insertMany(arrayProductsDocuments, {
          session: transactionSession,
        });
        await this.globalGalleryModel.insertMany(arrayGlobalGalleries, {
          session: transactionSession,
        });
      }

      var objUpdate = {
        _requestStatus: dto.requestStatus,
        _rootCauseId:
          dto.rootCauseId == '' || dto.rootCauseId == 'nil'
            ? null
            : dto.rootCauseId,
        _description: dto.description,
      };

      if (dto.requestStatus == 3) {
        objUpdate['_finishedAt'] = dateTime;
      }

      var result = await this.photographyRequestModel.updateMany(
        {
          _id: { $in: dto.photographyIds },
        },
        {
          $set: objUpdate,
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

  async list(dto: PhotographyRequestListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _description: new RegExp(dto.searchingText, 'i') }],
          },
        });
      }
      if (dto.photographerRequestIds.length > 0) {
        var newSettingsId = [];
        dto.photographerRequestIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }
      if (dto.rootCauseIds.length > 0) {
        var newSettingsId = [];
        dto.rootCauseIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _rootCauseId: { $in: newSettingsId } },
        });
      }

      if (dto.orderIds.length > 0) {
        var newSettingsId = [];
        dto.orderIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { orderIds: { $in: newSettingsId } } });
      }
      if (dto.requestedUserIds.length > 0) {
        var newSettingsId = [];
        dto.requestedUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _userId: { $in: newSettingsId } } });
      }
      if (dto.createdUserIds.length > 0) {
        var newSettingsId = [];
        dto.createdUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _createdUserId: { $in: newSettingsId } },
        });
      }

      if (dto.requestStatusArray.length > 0) {
        arrayAggregation.push({
          $match: { _requestStatus: { $in: dto.requestStatusArray } },
        });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      arrayAggregation.push({ $sort: { _id: -1 } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      if (dto.screenType.includes(100)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderId: '$_orderItemId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$orderId'] } } },
                new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
                  1000,
                  dto.responseFormat,
                ),
              ],
              as: 'orderDetails',
            },
          },
          {
            $unwind: {
              path: '$orderDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.includes(101)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
              let: { rootCauseId: '$_rootCauseId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$rootCauseId'] } } },

                new ModelWeightResponseFormat().rootcauseTableResponseFormat(
                  1010,
                  dto.responseFormat,
                ),
              ],
              as: 'rootCauseDetails',
            },
          },
          {
            $unwind: {
              path: '$rootCauseDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.includes(102)) {
        const photographyUserPipeline = () => {
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
            ),);
            const photographerUserGlobalGallery = dto.screenType.includes(104);
            if (photographerUserGlobalGallery) {
            pipeline.push( {
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
                    1040,
                    dto.responseFormat,
                  )
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
          );}
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_userId' },
              pipeline: photographyUserPipeline(),
              as: 'assignedUserDetails',
            },
          },
          {
            $unwind: {
              path: '$assignedUserDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }




      if (dto.screenType.includes(103)) {
        const photographyCreatedUserPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$createdUserId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1030,
              dto.responseFormat,
            ),);
            const photographerUserGlobalGallery = dto.screenType.includes(105);
            if (photographerUserGlobalGallery) {
            pipeline.push( {
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
                    1050,
                    dto.responseFormat,
                  )
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
          );}
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { createdUserId: '$_createdUserId' },
              pipeline: photographyCreatedUserPipeline(),
              as: 'createdUserDetails',
            },
          },
          {
            $unwind: {
              path: '$createdUserDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }


      var result = await this.photographyRequestModel
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

        var resultTotalCount = await this.photographyRequestModel
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
