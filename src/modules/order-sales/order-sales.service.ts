import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { OrderSales } from 'src/tableModels/order_sales.model';
import * as mongoose from 'mongoose';
import { OrderSalesDocuments } from 'src/tableModels/order_sales_documents.model';
import {
  OrderSaleListDto,
  OrderSalesChangeDto,
  OrderSalesCreateDto,
  OrderSalesEditDto,
} from './order_sales.dto';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { Counters } from 'src/tableModels/counters.model';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { StringUtils } from 'src/utils/string_utils';

@Injectable()
export class OrderSalesService {
  constructor(
    @InjectModel(ModelNames.ORDER_SALES)
    private readonly orderSaleModel: Model<OrderSales>,
    @InjectModel(ModelNames.ORDER_SALES_DOCUMENTS)
    private readonly orderSaleDocumentsModel: Model<OrderSalesDocuments>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: Model<Counters>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: Model<GlobalGalleries>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: OrderSalesCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var orderSaleId = new mongoose.Types.ObjectId();

      var arrayGlobalGalleries = [];
      var arrayGlobalGalleriesDocuments = [];
      if (file.hasOwnProperty('documents')) {
        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: dto.documents.length,
            },
          },
          { new: true, session: transactionSession },
        );

        for (var i = 0; i < dto.documents.length; i++) {
          var count = file['documents'].findIndex(
            (it) => dto.documents[i].fileOriginalName == it.originalname,
          );
          if (count != -1) {
            if (dto.documents[i].docType == 0) {
              var filePath =
                __dirname +
                `/../../../public${
                  file['documents'][count]['path'].split('public')[1]
                }`;

              new ThumbnailUtils().generateThumbnail(
                filePath,
                UploadedFileDirectoryPath.GLOBAL_GALLERY_CUSTOMER +
                  new StringUtils().makeThumbImageFileName(
                    file['documents'][count]['filename'],
                  ),
              );
            }
          }
        }

        for (var i = 0; i < dto.documents.length; i++) {
          var count = dto.documents.findIndex(
            (it) => it.fileOriginalName == file['image'][i]['originalname'],
          );
          if (count != -1) {
            var globalGalleryId = new mongoose.Types.ObjectId();
            arrayGlobalGalleries.push({
              _id: globalGalleryId,
              __name: file['documents'][count]['originalname'],
              _globalGalleryCategoryId: null,
              _docType: dto.documents[i].docType,
              _type: 7,
              _uid:
                resultCounterPurchase._count - dto.documents.length + (i + 1),
              _url: `${process.env.SSL == 'true' ? 'https' : 'http'}://${
                process.env.SERVER_DOMAIN
              }:${process.env.PORT}${
                file['documents'][count]['path'].split('public')[1]
              }`,
              _thumbUrl:
                dto.documents[i].docType == 0
                  ? new StringUtils().makeThumbImageFileName(
                      `${process.env.SSL == 'true' ? 'https' : 'http'}://${
                        process.env.SERVER_DOMAIN
                      }:${process.env.PORT}${
                        file['documents'][count]['path'].split('public')[1]
                      }`,
                    )
                  : 'nil',
              _created_user_id: _userId_,
              _created_at: dateTime,
              _updated_user_id: null,
              _updated_at: -1,
              _status: 1,
            });

            arrayGlobalGalleriesDocuments.push({
              _orderSaleId: orderSaleId,
              _globalGalleryId: globalGalleryId,
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
        await this.orderSaleDocumentsModel.insertMany(
          arrayGlobalGalleriesDocuments,
          {
            session: transactionSession,
          },
        );
      }

      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.ORDER_SALES },
        {
          $inc: {
            _count: 1,
          },
        },
        { new: true, session: transactionSession },
      );

      const newsettingsModel = new this.orderSaleModel({
        _id: orderSaleId,
        _customerId: _userId_,
        _subCategoryId: dto.subCategoryId,
        _quantity: dto.quantity,
        _size: dto.size,
        _uid: resultCounterPurchase._count,
        _weight: dto.weight,
        _stoneColour: dto.stoneColor,
        _dueDate: dto.dueDate,
        _salesPersonId: dto.salsPersonId,
        _description: dto.description,
        _isRhodium: dto.isRhodium,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });
      var result1 = await newsettingsModel.save({
        session: transactionSession,
      });

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: 'success', data: result1 };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async edit(dto: OrderSalesEditDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    try {
      var arrayGlobalGalleries = [];
      var arrayGlobalGalleriesDocuments = [];
      if (file.hasOwnProperty('documents')) {
        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: dto.documents.length,
            },
          },
          { new: true, session: transactionSession },
        );

        for (var i = 0; i < dto.documents.length; i++) {
          var count = file['documents'].findIndex(
            (it) => dto.documents[i].fileOriginalName == it.originalname,
          );
          if (count != -1) {
            if (dto.documents[i].docType == 0) {
              var filePath =
                __dirname +
                `/../../../public${
                  file['documents'][count]['path'].split('public')[1]
                }`;

              new ThumbnailUtils().generateThumbnail(
                filePath,
                UploadedFileDirectoryPath.GLOBAL_GALLERY_CUSTOMER +
                  new StringUtils().makeThumbImageFileName(
                    file['documents'][count]['filename'],
                  ),
              );
            }
          }
        }

        for (var i = 0; i < dto.documents.length; i++) {
          var count = dto.documents.findIndex(
            (it) => it.fileOriginalName == file['image'][i]['originalname'],
          );
          if (count != -1) {
            var globalGalleryId = new mongoose.Types.ObjectId();
            arrayGlobalGalleries.push({
              _id: globalGalleryId,
              __name: file['documents'][count]['originalname'],
              _globalGalleryCategoryId: null,
              _docType: dto.documents[i].docType,
              _type: 7,
              _uid:
                resultCounterPurchase._count - dto.documents.length + (i + 1),
              _url: `${process.env.SSL == 'true' ? 'https' : 'http'}://${
                process.env.SERVER_DOMAIN
              }:${process.env.PORT}${
                file['documents'][count]['path'].split('public')[1]
              }`,
              _thumbUrl:
                dto.documents[i].docType == 0
                  ? new StringUtils().makeThumbImageFileName(
                      `${process.env.SSL == 'true' ? 'https' : 'http'}://${
                        process.env.SERVER_DOMAIN
                      }:${process.env.PORT}${
                        file['documents'][count]['path'].split('public')[1]
                      }`,
                    )
                  : 'nil',
              _created_user_id: _userId_,
              _created_at: dateTime,
              _updated_user_id: null,
              _updated_at: -1,
              _status: 1,
            });

            arrayGlobalGalleriesDocuments.push({
              _orderSaleId: dto.orderSaleId,
              _globalGalleryId: globalGalleryId,
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
        await this.orderSaleDocumentsModel.insertMany(
          arrayGlobalGalleriesDocuments,
          {
            session: transactionSession,
          },
        );
      }

      var updateObject = {
        _subCategoryId: dto.subCategoryId,
        _quantity: dto.quantity,
        _size: dto.size,
        _weight: dto.weight,
        _stoneColour: dto.stoneColor,
        _dueDate: dto.dueDate,
        _salesPersonId: dto.salsPersonId,
        _description: dto.description,
        _isRhodium: dto.isRhodium,
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
      };

      var result = await this.orderSaleModel.findOneAndUpdate(
        {
          _id: dto.orderSaleId,
        },
        {
          $set: updateObject,
        },
        { new: true, session: transactionSession },
      );

      if (dto.documentsLinkingIdsForDelete.length != 0) {
        await this.orderSaleDocumentsModel.updateMany(
          { _id: { $in: dto.documentsLinkingIdsForDelete } },
          { $set: { _status: 2 } },
          { new: true, session: transactionSession },
        );
      }

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: 'success', data: result };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async status_change(dto: OrderSalesChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.orderSaleModel.updateMany(
        {
          _id: { $in: dto.orderSaleIds },
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

  async list(dto: OrderSaleListDto) {
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
      if (dto.orderSaleIdsIds.length > 0) {
        var newSettingsId = [];
        dto.orderSaleIdsIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
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

      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({ $sort: { _status: dto.sortOrder } });
          break;
        case 2:
          arrayAggregation.push({ $sort: { _dueDate: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _isRhodium: dto.sortOrder } });
          break;
        case 4:
          arrayAggregation.push({ $sort: { _quantity: dto.sortOrder } });
          break;
        case 5:
          arrayAggregation.push({ $sort: { _size: dto.sortOrder } });
          break;
        case 6:
          arrayAggregation.push({ $sort: { _weight: dto.sortOrder } });
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
        );
      }
      if (dto.screenType.findIndex((it) => it == 101) != -1) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALES_DOCUMENTS,
            let: { orderSaleIdId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_orderSaleId', '$$orderSaleIdId'] },
                },
              },
              {
                $project: {
                  _orderSaleId: 1,
                  _globalGalleryId: 1,
                },
              },
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } },
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
            as: 'orderSaleDocumentList',
          },
        });
      }

      if (dto.screenType.findIndex((it) => it == 102) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { customerId: '$_customerId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$customerId'] } } },

                {
                  $lookup: {
                    from: ModelNames.CUSTOMERS,
                    let: { customerUserId: '$_customerId' },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ['$_id', '$$customerUserId'] },
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
                          as: 'dlobalGalleryDetails',
                        },
                      },
                      {
                        $unwind: {
                          path: '$dlobalGalleryDetails',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                    ],
                    as: 'userDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
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



    



      var result = await this.orderSaleModel
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

        var resultTotalCount = await this.orderSaleModel
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
}
