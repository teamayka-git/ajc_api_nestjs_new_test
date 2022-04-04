import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
  OrderSalesWorkStatusChangeDto,
  SetProcessAssignedOrderSaleListDto,
} from './order_sales.dto';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { Counters } from 'src/tableModels/counters.model';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { StringUtils } from 'src/utils/string_utils';
import { Customers } from 'src/tableModels/customers.model';
import { User } from 'src/tableModels/user.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { Employee } from 'src/tableModels/employee.model';
import { Departments } from 'src/tableModels/departments.model';
import { ProcessMaster } from 'src/tableModels/processMaster.model';
import { GlobalConfig } from 'src/config/global_config';
import { OrderSaleSetProcesses } from 'src/tableModels/order_sale_set_processes.model';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';

@Injectable()
export class OrderSalesService {
  constructor(
    @InjectModel(ModelNames.ORDER_SALES)
    private readonly orderSaleModel: Model<OrderSales>,
    @InjectModel(ModelNames.ORDER_SALES_DOCUMENTS)
    private readonly orderSaleDocumentsModel: Model<OrderSalesDocuments>,
    @InjectModel(ModelNames.CUSTOMERS)
    private readonly customersModel: Model<Customers>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: Model<Counters>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: Model<GlobalGalleries>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: Model<OrderSaleHistories>,
    @InjectModel(ModelNames.EMPLOYEES)
    private readonly employeeModel: mongoose.Model<Employee>,
    @InjectModel(ModelNames.DEPARTMENT)
    private readonly departmentModel: mongoose.Model<Departments>,
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.PROCESS_MASTER)
    private readonly processMasterModel: mongoose.Model<ProcessMaster>,
    @InjectModel(ModelNames.ORDER_SALE_SET_PROCESSES)
    private readonly orderSaleSetProcessModel: mongoose.Model<OrderSaleSetProcesses>,
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
        //         UploadedFileDirectoryPath.GLOBAL_GALLERY_CUSTOMER +
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
            UploadedFileDirectoryPath.GLOBAL_GALLERY_CUSTOMER,
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

      var customerUserId = '';
      if (dto.customerId == '' || dto.customerId == 'nil') {
        customerUserId = _userId_;
      } else {
        customerUserId = dto.customerId;
      }
      var resultCustomerUser = await this.userModel.find({
        _id: customerUserId,
        _status: 1,
      });
      if (resultCustomerUser.length == 0) {
        throw new HttpException(
          'Customer user not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var customerDetails = await this.customersModel.find({
        _id: resultCustomerUser[0]._customerId,
        _status: 1,
      });
      if (customerDetails.length == 0) {
        throw new HttpException(
          'Customer not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const newsettingsModel = new this.orderSaleModel({
        _id: orderSaleId,
        _customerId: customerUserId,
        _subCategoryId: dto.subCategoryId,
        _quantity: dto.quantity,
        _size: dto.size,
        _uid: resultCounterPurchase._count,
        _weight: dto.weight,
        _stoneColour: dto.stoneColor,
        _dueDate: dto.dueDate,
        _salesPersonId: customerDetails[0]._orderHeadId,
        _workStatus: 0,
        _rootCauseId: null,
        _rootCause: '',
        _description: dto.description,
        _isRhodium: dto.isRhodium,
        _isMatFinish: dto.isMatFinish,
        _createdUserId: _userId_,
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
        //         UploadedFileDirectoryPath.GLOBAL_GALLERY_CUSTOMER +
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
            UploadedFileDirectoryPath.GLOBAL_GALLERY_CUSTOMER,
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
        _customerId:
          dto.customerId == '' || dto.customerId == 'nil'
            ? _userId_
            : dto.customerId,
        _subCategoryId: dto.subCategoryId,
        _quantity: dto.quantity,
        _size: dto.size,
        _weight: dto.weight,
        _stoneColour: dto.stoneColor,
        _dueDate: dto.dueDate,

        _isMatFinish: dto.isMatFinish,
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

  async change_work_status(
    dto: OrderSalesWorkStatusChangeDto,
    _userId_: string,
  ) {
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
            _rootCauseId:
              dto.rootCauseId == '' || dto.rootCauseId == 'nil'
                ? null
                : dto.rootCauseId,
            _workStatus: dto.workStatus,
            _rootCause: dto.rootCause,
          },
        },
        { new: true, session: transactionSession },
      );

      var arrayToOrderSaleHistories = [];
      dto.orderSaleIds.map((mapItem) => {
        arrayToOrderSaleHistories.push({
          _orderSaleId: mapItem,
          _workStatus: dto.workStatus,
          _rootCauseId:
            dto.rootCauseId == '' || dto.rootCauseId == 'nil'
              ? null
              : dto.rootCauseId,
          _rootCause: dto.rootCause,
          _status: 1,
        });
      });

      await this.orderSaleHistoriesModel.insertMany(arrayToOrderSaleHistories, {
        session: transactionSession,
      });

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

  async list(dto: OrderSaleListDto) {
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
      if (dto.isMatFinish.length > 0) {
        arrayAggregation.push({
          $match: { _isMatFinish: { $in: dto.isMatFinish } },
        });
      }
      if (dto.isRhodium.length > 0) {
        arrayAggregation.push({
          $match: { _isRhodium: { $in: dto.isRhodium } },
        });
      }
      if (dto.workStatus.length > 0) {
        arrayAggregation.push({
          $match: { _workStatus: { $in: dto.workStatus } },
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

      if (dto.screenType.findIndex((it) => it == 105) != -1) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_SET_PROCESSES,
            let: { orderSaleSetProcess: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_orderSaleId', '$$orderSaleSetProcess'] },
                },
              },

              {
                $lookup: {
                  from: ModelNames.PROCESS_MASTER,
                  let: { processId: '$_processId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$processId'] } } },
                  ],
                  as: 'processDetails',
                },
              },
              {
                $unwind: {
                  path: '$processDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$userId'] },
                      },
                    },

                    {
                      $lookup: {
                        from: ModelNames.EMPLOYEES,
                        let: { employeeId: '$_employeeId' },
                        pipeline: [
                          {
                            $match: {
                              $expr: { $eq: ['$_id', '$$employeeId'] },
                            },
                          },
                          {
                            $project: {
                              _name: 1,
                              _email: 1,
                              _mobile: 1,
                              _uid: 1,
                              _globalGalleryId: 1,
                            },
                          },
                          {
                            $lookup: {
                              from: ModelNames.GLOBAL_GALLERIES,
                              let: { globalGalleryId: '$_globalGalleryId' },
                              pipeline: [
                                {
                                  $match: {
                                    $expr: {
                                      $eq: ['$_id', '$$globalGalleryId'],
                                    },
                                  },
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
                        as: 'employeeDetails',
                      },
                    },
                    {
                      $unwind: {
                        path: '$employeeDetails',
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
            as: 'setProcessList',
          },
        });
      }

      if (dto.screenType.findIndex((it) => it == 106) != -1) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_SET_PROCESSES,
            let: { orderSaleSetProcess: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_orderSaleId', '$$orderSaleSetProcess'] },
                },
              },

              {
                $lookup: {
                  from: ModelNames.PROCESS_MASTER,
                  let: { processId: '$_processId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$processId'] } } },
                  ],
                  as: 'processDetails',
                },
              },
              {
                $unwind: {
                  path: '$processDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$userId'] },
                      },
                    },

                    {
                      $lookup: {
                        from: ModelNames.EMPLOYEES,
                        let: { employeeId: '$_employeeId' },
                        pipeline: [
                          {
                            $match: {
                              $expr: { $eq: ['$_id', '$$employeeId'] },
                            },
                          },
                          {
                            $project: {
                              _name: 1,
                              _email: 1,
                              _mobile: 1,
                              _uid: 1,
                              _globalGalleryId: 1,
                            },
                          },
                          {
                            $lookup: {
                              from: ModelNames.GLOBAL_GALLERIES,
                              let: { globalGalleryId: '$_globalGalleryId' },
                              pipeline: [
                                {
                                  $match: {
                                    $expr: {
                                      $eq: ['$_id', '$$globalGalleryId'],
                                    },
                                  },
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
                        as: 'employeeDetails',
                      },
                    },
                    {
                      $unwind: {
                        path: '$employeeDetails',
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

              {
                $lookup: {
                  from: ModelNames.ORDER_SALE_SET_SUB_PROCESSES,
                  let: { setProcess: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        _status: 1,
                        $expr: {
                          $eq: ['$_orderSaleSetProcessId', '$$setProcess'],
                        },
                      },
                    },

                    {
                      $lookup: {
                        from: ModelNames.SUB_PROCESS_MASTER,
                        let: { processId: '$_subProcessId' },
                        pipeline: [
                          {
                            $match: { $expr: { $eq: ['$_id', '$$processId'] } },
                          },
                        ],
                        as: 'processDetails',
                      },
                    },
                    {
                      $unwind: {
                        path: '$processDetails',
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                    {
                      $lookup: {
                        from: ModelNames.USER,
                        let: { userId: '$_userId' },
                        pipeline: [
                          {
                            $match: {
                              $expr: { $eq: ['$_id', '$$userId'] },
                            },
                          },

                          {
                            $lookup: {
                              from: ModelNames.EMPLOYEES,
                              let: { employeeId: '$_employeeId' },
                              pipeline: [
                                {
                                  $match: {
                                    $expr: { $eq: ['$_id', '$$employeeId'] },
                                  },
                                },
                                {
                                  $project: {
                                    _name: 1,
                                    _email: 1,
                                    _mobile: 1,
                                    _uid: 1,
                                    _globalGalleryId: 1,
                                  },
                                },
                                {
                                  $lookup: {
                                    from: ModelNames.GLOBAL_GALLERIES,
                                    let: {
                                      globalGalleryId: '$_globalGalleryId',
                                    },
                                    pipeline: [
                                      {
                                        $match: {
                                          $expr: {
                                            $eq: ['$_id', '$$globalGalleryId'],
                                          },
                                        },
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
                              as: 'employeeDetails',
                            },
                          },
                          {
                            $unwind: {
                              path: '$employeeDetails',
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
                  as: 'setSubProcessList',
                },
              },
            ],
            as: 'setProcessListAll',
          },
        });
      }

      if (dto.screenType.findIndex((it) => it == 103) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ROOT_CAUSES,
              let: { rootCauseId: '$_rootCauseId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$rootCauseId'] } } },
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

      if (dto.screenType.findIndex((it) => it == 104) != -1) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_HISTORIES,
            let: { orderSaleId: '$_id' },
            pipeline: [
              {
                $match: { $expr: { $eq: ['$_orderSaleId', '$$orderSaleId'] } },
              },

              {
                $lookup: {
                  from: ModelNames.ORDER_SALES_ROOT_CAUSES,
                  let: { rootCauseId: '$_rootCauseId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$rootCauseId'] } } },
                    {
                      $project: {
                        _name: 1,
                      },
                    },
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
            ],
            as: 'orderSaleHistories',
          },
        });
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

                      {
                        $lookup: {
                          from: ModelNames.USER,
                          let: { userId: '$_orderHeadId' },
                          pipeline: [
                            {
                              $match: {
                                $expr: { $eq: ['$_id', '$$userId'] },
                              },
                            },

                            {
                              $lookup: {
                                from: ModelNames.EMPLOYEES,
                                let: { employeeId: '$_employeeId' },
                                pipeline: [
                                  {
                                    $match: {
                                      $expr: { $eq: ['$_id', '$$employeeId'] },
                                    },
                                  },
                                  {
                                    $lookup: {
                                      from: ModelNames.GLOBAL_GALLERIES,
                                      let: {
                                        globalGalleryId: '$_globalGalleryId',
                                      },
                                      pipeline: [
                                        {
                                          $match: {
                                            $expr: {
                                              $eq: [
                                                '$_id',
                                                '$$globalGalleryId',
                                              ],
                                            },
                                          },
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
                                as: 'employeeDetails',
                              },
                            },
                            {
                              $unwind: {
                                path: '$employeeDetails',
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                          ],
                          as: 'orderHeadDetails',
                        },
                      },
                      {
                        $unwind: {
                          path: '$orderHeadDetails',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: ModelNames.USER,
                          let: { userId: '$_relationshipManagerId' },
                          pipeline: [
                            {
                              $match: {
                                $expr: { $eq: ['$_id', '$$userId'] },
                              },
                            },

                            {
                              $lookup: {
                                from: ModelNames.EMPLOYEES,
                                let: { employeeId: '$_employeeId' },
                                pipeline: [
                                  {
                                    $match: {
                                      $expr: { $eq: ['$_id', '$$employeeId'] },
                                    },
                                  },
                                  {
                                    $lookup: {
                                      from: ModelNames.GLOBAL_GALLERIES,
                                      let: {
                                        globalGalleryId: '$_globalGalleryId',
                                      },
                                      pipeline: [
                                        {
                                          $match: {
                                            $expr: {
                                              $eq: [
                                                '$_id',
                                                '$$globalGalleryId',
                                              ],
                                            },
                                          },
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
                                as: 'employeeDetails',
                              },
                            },
                            {
                              $unwind: {
                                path: '$employeeDetails',
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                          ],
                          as: 'relationshipManagerDetails',
                        },
                      },
                      {
                        $unwind: {
                          path: '$relationshipManagerDetails',
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

      var resultWorkets = [];
      var resultProcessMasters = [];

      if (dto.screenType.findIndex((it) => it == 105) != -1) {
        var resultDepartment = await this.departmentModel.find({
          _code: 1003,
          _status: 1,
        });
        if (resultDepartment.length == 0) {
          throw new HttpException(
            'Department not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        resultWorkets = await this.employeeModel.aggregate([
          {
            $match: {
              _departmentId: new mongoose.Types.ObjectId(
                resultDepartment[0]._id,
              ),
              _status: 1,
            },
          },

          {
            $project: {
              _id: 1,
              _name: 1,
              _email: 1,
              _mobile: 1,
              _uid: 1,
              _globalGalleryId: 1,
              _processMasterId: 1,
            },
          },
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

          {
            $lookup: {
              from: ModelNames.USER,
              let: { employeeId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_employeeId', '$$employeeId'] },
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
        ]);

        resultProcessMasters = await this.processMasterModel.find({
          _status: 1,
        });
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

      const responseJSON = {
        message: 'success',
        data: {
          list: result,
          totalCount: totalCount,
          workers: resultWorkets,
          processMasters: resultProcessMasters,
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

  async set_proccess_assigned_order_sale_list(
    dto: SetProcessAssignedOrderSaleListDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];
      var arrayUserIds = [];

      if (dto.idsArray.length > 0) {
        var newSettingsId = [];
        dto.idsArray.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.employeesArray.length > 0) {
        dto.employeesArray.map((mapItem) => {
          arrayUserIds.push(new mongoose.Types.ObjectId(mapItem));
        });
      }

      if (dto.screenType.findIndex((it) => it == 500) != -1) {
        arrayUserIds.push(new mongoose.Types.ObjectId(_userId_));
      }
      if (arrayUserIds.length > 0) {
        arrayAggregation.push({ $match: { _userId: { $in: arrayUserIds } } });
      }
      if (dto.workStatusArray.length > 0) {
        arrayAggregation.push({
          $match: { _orderStatus: { $in: dto.workStatusArray } },
        });
      }
      arrayAggregation.push({
        $match: {
          _status: 1,
        },
      });

      if (dto.screenType.findIndex((it) => it == 101) != -1) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_SET_SUB_PROCESSES,
            let: { orderSaleSetProcessId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $eq: ['$_orderSaleSetProcessId', '$$orderSaleSetProcessId'],
                  },
                },
              },
              {
                $lookup: {
                  from: ModelNames.SUB_PROCESS_MASTER,
                  let: { subProcessId: '$_subProcessId' },
                  pipeline: [
                    {
                      $match: {
                        _status: 1,
                        $expr: { $eq: ['$_id', '$$subProcessId'] },
                      },
                    },
                  ],
                  as: 'subProcessDetails',
                },
              },
              {
                $unwind: {
                  path: '$subProcessDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: 'subProcessMasterLinkings',
          },
        });
      }

      if (dto.screenType.findIndex((it) => it == 100) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES,
              let: { orderSaleId: '$_orderSaleId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$orderSaleId'] } } },
                {
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
                              $match: {
                                $expr: { $eq: ['$_id', '$$globalGalleryId'] },
                              },
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
                },
                {
                  $lookup: {
                    from: ModelNames.SUB_CATEGORIES,
                    let: { subCategoryId: '$_subCategoryId' },
                    pipeline: [
                      {
                        $match: { $expr: { $eq: ['$_id', '$$subCategoryId'] } },
                      },
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
              ],
              as: 'orderSaleDetails',
            },
          },
          {
            $unwind: {
              path: '$orderSaleDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.orderSaleSetProcessModel
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

        var resultTotalCount = await this.orderSaleSetProcessModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
        if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
        }
      }

      const responseJSON = {
        message: 'success',
        data: {
          list: result,
          totalCount: totalCount,
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
}
