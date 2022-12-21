import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { OrderSalesDocuments } from 'src/tableModels/order_sales_documents.model';
import {
  EditOrderSaleGeneralRemarkDto,
  GetWorkCountDto,
  GlobalSearchDto,
  OrderSaleHistoryListDto,
  OrderSaleListDto,
  OrderSaleReportListDto,
  OrderSalesChangeDto,
  OrderSalesCreateDto,
  OrderSalesEditDto,
  OrderSalesGetOrderDetailsFromQrBarcodeDto,
  OrderSalesGetOrderIdFromQrBarcodeDto,
  OrderSalesHoldDto,
  OrderSalesReworkSetprocessDto,
  OrderSalesWorkStatusChangeDto,
  SetProcessAssignedOrderSaleListDto,
} from './order_sales.dto';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { Counters } from 'src/tableModels/counters.model';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { StringUtils } from 'src/utils/string_utils';
import { Shops } from 'src/tableModels/shops.model';
import { User } from 'src/tableModels/user.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { Employee } from 'src/tableModels/employee.model';
import { Departments } from 'src/tableModels/departments.model';
import { ProcessMaster } from 'src/tableModels/processMaster.model';
import { GlobalConfig } from 'src/config/global_config';
import { OrderSaleSetProcesses } from 'src/tableModels/order_sale_set_processes.model';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import { ModelWeight } from 'src/model_weight/model_weight';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { OrderSalesItems } from 'src/tableModels/order_sales_items.model';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { pipe } from 'rxjs';
import { SubCategories } from 'src/tableModels/sub_categories.model';
import { Generals } from 'src/tableModels/generals.model';
import { RootCause } from 'aws-sdk/clients/costexplorer';
import { InvoiceItems } from 'src/tableModels/invoice_items.model';
import { Products } from 'src/tableModels/products.model';
import { Invoices } from 'src/tableModels/invoices.model';
import { OrderSaleItemsDocuments } from 'src/tableModels/order_sale_items_documents.model';

@Injectable()
export class OrderSalesService {
  constructor(
    @InjectModel(ModelNames.ORDER_SALE_ITEM_DOCUMENTS)
    private readonly ordersaleItemDocumentsModel: Model<OrderSaleItemsDocuments>,
    @InjectModel(ModelNames.ROOT_CAUSES)
    private readonly rootCauseModel: Model<RootCause>,
    @InjectModel(ModelNames.INVOICES)
    private readonly invoiceModel: Model<Invoices>,
    @InjectModel(ModelNames.PRODUCTS)
    private readonly productModel: Model<Products>,
    @InjectModel(ModelNames.INVOICE_ITEMS)
    private readonly invoiceItemsModel: Model<InvoiceItems>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleMainModel: Model<OrderSalesMain>,
    @InjectModel(ModelNames.ORDER_SALES_ITEMS)
    private readonly orderSaleItemsModel: Model<OrderSalesItems>,
    @InjectModel(ModelNames.ORDER_SALES_DOCUMENTS)
    private readonly orderSaleDocumentsModel: Model<OrderSalesDocuments>,
    @InjectModel(ModelNames.SHOPS)
    private readonly shopsModel: Model<Shops>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: Model<Counters>,
    @InjectModel(ModelNames.SUB_CATEGORIES)
    private readonly subCategoryModel: Model<SubCategories>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: Model<GlobalGalleries>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: Model<OrderSaleHistories>,
    @InjectModel(ModelNames.GENERALS)
    private readonly generalsModel: Model<Generals>,
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
      console.log('oc dto  ' + JSON.stringify(dto));
      console.log('___d1');
      var orderSaleId = new mongoose.Types.ObjectId();

      var arrayGlobalGalleries = [];
      var arrayGlobalGalleriesDocuments = [];
      var arrayOrderSaleItemGlobalGallery = [];

      if (file.hasOwnProperty('documents')) {
        console.log('___d1.1');
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
            UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP,
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
        console.log('___d2');
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
        console.log('___d3');
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

      console.log('___d3.1');
      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.ORDER_SALES_MAIN },
        {
          $inc: {
            _count: 1,
          },
        },
        { new: true, session: transactionSession },
      );

      console.log('___d3.2');
      var shopDetails = await this.shopsModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(dto.shopId),
            _status: 1,
          },
        },

        {
          $lookup: {
            from: ModelNames.USER,
            let: { ohId: '$_orderHeadId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$ohId'] },
                },
              },
              { $project: new ModelWeight().userTableLight() },

              {
                $lookup: {
                  from: ModelNames.EMPLOYEES,
                  let: { userId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        _status: 1,
                        $expr: { $eq: ['$_userId', '$$userId'] },
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
      ]);
      console.log('___d4');
      if (shopDetails.length == 0) {
        throw new HttpException(
          'Shop not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (shopDetails[0]._isFreezed == 1) {
        throw new HttpException(
          'Shop freezed, contact AJC',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      //check and give oh
      var resultGeneralOhAutoAssign = await this.generalsModel.find({
        _code: 1024,
      });
      if (resultGeneralOhAutoAssign.length == 0) {
        throw new HttpException(
          'oh autoassign generals not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      var orderHeadId = null;
      var ohPrefix = '';

      var resultCheckOh = await this.userModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(_userId_),
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
        {
          $lookup: {
            from: ModelNames.EMPLOYEES,
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_userId', '$$userId'] },
                },
              },
              {
                $project: {
                  _id: 1,
                  _prefix: 1,
                  _departmentId: 1,
                },
              },
              {
                $lookup: {
                  from: ModelNames.DEPARTMENT,
                  let: { departmentId: '$_departmentId' },
                  pipeline: [
                    {
                      $match: {
                        _code: 1000,
                        $expr: { $eq: ['$_id', '$$departmentId'] },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                      },
                    },
                  ],
                  as: 'orderHeadDepartmentDetails',
                },
              },
              {
                $unwind: { path: '$orderHeadDepartmentDetails' },
              },
            ],
            as: 'employeeDetails',
          },
        },
        {
          $unwind: { path: '$employeeDetails' },
        },
      ]);
      console.log('___a  ' + JSON.stringify(resultCheckOh));
      if (resultCheckOh.length != 0) {
        orderHeadId = _userId_;
        ohPrefix = resultCheckOh[0].employeeDetails._prefix;
      } else {
        if (resultGeneralOhAutoAssign[0]._number == 0) {
          orderHeadId = shopDetails[0]._orderHeadId;
          ohPrefix = shopDetails[0].orderHeadDetails.employeeDetails._prefix;
        } else {
          var resultOh = await this.departmentModel
            .aggregate([
              { $match: { _code: 1000 } },
              {
                $project: {
                  _id: 1,
                },
              },
              {
                $lookup: {
                  from: ModelNames.EMPLOYEES,
                  let: { departmentId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_departmentId', '$$departmentId'] },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        _prefix: 1,
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
                          {
                            $project: {
                              _id: 1,
                            },
                          },
                          {
                            $lookup: {
                              from: ModelNames.USER_ATTENDANCES,
                              let: { userId: '$_id' },
                              pipeline: [
                                {
                                  $match: {
                                    _stopTime: 0,
                                    _status: 1,
                                    $expr: { $eq: ['$_userId', '$$userId'] },
                                  },
                                },
                                { $project: { _id: 1 } },
                              ],
                              as: 'userAttendance',
                            },
                          },
                          {
                            $match: { userAttendance: { $ne: [] } },
                          },
                          {
                            $lookup: {
                              from: ModelNames.ORDER_SALES_MAIN,
                              let: { userId: '$_id' },
                              pipeline: [
                                {
                                  $match: {
                                    $expr: {
                                      $eq: ['$_orderHeadId', '$$userId'],
                                    },
                                    _isProductGenerated: 0,
                                    _workStatus: { $nin: [2, 27] },
                                  },
                                },
                                { $project: { _id: 1 } },
                              ],
                              as: 'orderCount',
                            },
                          },

                          {
                            $project: {
                              orderCount: { $size: '$orderCount' },
                            },
                          },
                        ],
                        as: 'userDetails',
                      },
                    },
                    {
                      $unwind: {
                        path: '$userDetails',
                      },
                    },
                    {
                      $project: {
                        userId: '$userDetails._id',
                        _prefix: 1,
                        currentOrderCount: '$userDetails.orderCount',
                      },
                    },
                    {
                      $sort: {
                        currentOrderCount: 1,
                      },
                    },
                  ],
                  as: 'employees',
                },
              },
            ])
            .session(transactionSession);
          console.log('resultOh   ' + JSON.stringify(resultOh));
          if (resultOh.length == 0 || resultOh[0].employees == 0) {
            orderHeadId = shopDetails[0]._orderHeadId;
            ohPrefix = shopDetails[0].orderHeadDetails.employeeDetails._prefix;
          } else {
            orderHeadId = resultOh[0].employees[0].userId;
            ohPrefix = resultOh[0].employees[0]._prefix;
          }
        }
      }
      //shopDetails[0].orderHeadDetails.employeeDetails._prefix
      let uidSalesOrder = ohPrefix + resultCounterPurchase._count;

      const newsettingsModel = new this.orderSaleMainModel({
        _id: orderSaleId,
        _shopId: dto.shopId,
        _uid: uidSalesOrder,
        _referenceNumber: dto.referenceNumber,
        _dueDate: dto.dueDate,
        _workStatus: 0,
        _rootCauseId: null,
        _deliveryType: dto.deliveryType,
        _isInvoiceGenerated: 0,
        _isProductGenerated: 0,
        _type: dto.type,

        _isHold: 0,
        _holdDescription: '',
        _holdRootCause: null,
        _parentOrderId: null,
        _isReWork: 0,
        _rootCause: '',
        _orderHeadId: orderHeadId,
        _description: dto.description,
        _generalRemark: dto.generalRemark != null ? dto.generalRemark : '',
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });
      // const newsettingsModel = new this.orderSaleModel({
      //   _id: orderSaleId,
      //   _shopId: dto.shopId,
      // _subCategoryId: dto.subCategoryId,
      //   _quantity: dto.quantity,
      //   _size: dto.size,
      //   _type: dto.type,
      //   _uid: resultCounterPurchase._count,
      //   _weight: dto.weight,
      //   _stoneColour: dto.stoneColor,
      //   _dueDate: dto.dueDate,
      //   _productData: { _idDone: 0 },
      //   _orderHeadId: shopDetails[0]._orderHeadId,
      //   _workStatus: 0,
      //   _isReWork:0,
      //   _rootCauseId: null,
      //   _rootCause: '',
      //   _generalRemark: '',
      //   _description: dto.description,
      //   _isInvoiceGenerated: 0,
      //   _isProductGenerated: 0,
      //   _isRhodium: dto.isRhodium,
      //   _isMatFinish: dto.isMatFinish,
      //   _createdUserId: _userId_,
      //   _createdAt: dateTime,
      //   _updatedUserId: null,
      //   _updatedAt: -1,
      //   _status: 1,
      // });
      var result1 = await newsettingsModel.save({
        session: transactionSession,
      });
      console.log('___d5');
      var arraySalesItems = [];
      dto.arrayItems.forEach((eachItem, index) => {
        var orderSaleItemId = new mongoose.Types.ObjectId();
        arraySalesItems.push({
          _id: orderSaleItemId,
          _orderSaleId: orderSaleId,
          _subCategoryId: eachItem.subCategoryId,
          _quantity: eachItem.quantity,
          _size: eachItem.size,
          _weight: eachItem.weight,
          _isDeliveryRejected: 0,
          _uid:
            uidSalesOrder + new StringUtils().numberToEncodedLetter(index + 1),
          _stoneColour: eachItem.stoneColor,
          _productData: { _idDone: 0 },
          _productId:
            eachItem.productId != null && eachItem.productId != ''
              ? eachItem.productId
              : null,
          _designId:
            eachItem.designId != null && eachItem.designId != ''
              ? eachItem.designId
              : null,
          _stockStatus: eachItem.stockStatus,
          _isRhodium: eachItem.isRhodium,
          _isMatFinish: eachItem.isMatFinish,
          _isEnamel: eachItem.isEnamel,
          _isDullFinish: eachItem.isDullFinish,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        if (
          eachItem.globalGalleryIds != null &&
          eachItem.globalGalleryIds.length != 0
        ) {
          eachItem.globalGalleryIds.forEach((elementEachChild) => {
            arrayOrderSaleItemGlobalGallery.push({
              _orderSaleItemId: orderSaleItemId,
              _globalGalleryId: elementEachChild,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
            });
          });
        }
      });

      await this.orderSaleItemsModel.insertMany(arraySalesItems, {
        session: transactionSession,
      });

      await this.ordersaleItemDocumentsModel.insertMany(
        arrayOrderSaleItemGlobalGallery,
        {
          session: transactionSession,
        },
      );
      const orderSaleHistoryModel = new this.orderSaleHistoriesModel({
        _orderSaleId: result1._id,
        _userId: null,
        _orderSaleItemId: null,
        _deliveryCounterId: null,
        _shopId: dto.shopId,
        _type: 0,
        _deliveryProviderId: null,
        _description: '',
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _status: 1,
      });
      await orderSaleHistoryModel.save({
        session: transactionSession,
      });
      console.log('___d6');
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
            UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP,
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
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
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
        _shopId:
          dto.shopId == '' || dto.shopId == 'nil' ? _userId_ : dto.shopId,
        _type: dto.type,
        _dueDate: dto.dueDate,
        _generalRemark: dto.generalRemark != null ? dto.generalRemark : '',

        _referenceNumber: dto.referenceNumber,
        _description: dto.description,
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
      };
      var result = await this.orderSaleMainModel.findOneAndUpdate(
        {
          _id: dto.orderSaleId,
        },
        {
          $set: updateObject,
        },
        { new: true, session: transactionSession },
      );

      for (var i = 0; i < dto.arrayItems.length; i++) {
        await this.orderSaleItemsModel.findOneAndUpdate(
          {
            _id: dto.arrayItems[i].orderSaleItemId,
          },
          {
            $set: {
              _subCategoryId: dto.arrayItems[i].subCategoryId,
              _quantity: dto.arrayItems[i].quantity,
              _size: dto.arrayItems[i].size,
              _weight: dto.arrayItems[i].weight,
              _stoneColour: dto.arrayItems[i].stoneColor,
              _isMatFinish: dto.arrayItems[i].isMatFinish,
              _isRhodium: dto.arrayItems[i].isRhodium,
              _isEnamel: dto.arrayItems[i].isEnamel,
              _isDullFinish: dto.arrayItems[i].isDullFinish,
            },
          },
          { new: true, session: transactionSession },
        );
      }

      const orderSaleHistoryModel = new this.orderSaleHistoriesModel({
        _orderSaleId: dto.orderSaleId,
        _userId: null,
        _type: 100,
        _deliveryCounterId: null,
        _deliveryProviderId: null,
        _shopId: null,
        _orderSaleItemId: null,
        _description: dto.ordderSaleHistoryDescription,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _status: 1,
      });
      await orderSaleHistoryModel.save({
        session: transactionSession,
      });

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
      var result = await this.orderSaleMainModel.updateMany(
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

      var arraySalesOrderHistories = [];
      dto.orderSaleIds.map((mapItem) => {
        var type = -1;
        if (dto.status == 1) {
          type = 101;
        } else if (dto.status == 0) {
          type = 102;
        } else if (dto.status == 2) {
          type = 103;
        }

        arraySalesOrderHistories.push({
          _orderSaleId: mapItem,
          _userId: null,
          _type: type,
          _deliveryProviderId: null,
          _deliveryCounterId: null,
          _shopId: null,
          _orderSaleItemId: null,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      });
      await this.orderSaleHistoriesModel.insertMany(arraySalesOrderHistories, {
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

  async change_work_status(
    dto: OrderSalesWorkStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.orderSaleMainModel.updateMany(
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

      var arraySalesOrderHistories = [];
      dto.orderSaleIds.map((mapItem) => {
        var objOrderHistory = {
          _orderSaleId: mapItem,
          _userId: null,
          _type: dto.workStatus,
          _deliveryProviderId: null,
          _deliveryCounterId: null,
          _orderSaleItemId: null,
          _shopId: null,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        };
        switch (dto.workStatus) {
          case 2:
            objOrderHistory._description = dto.rootCause;
            break;
        }

        arraySalesOrderHistories.push(objOrderHistory);
      });
      await this.orderSaleHistoriesModel.insertMany(arraySalesOrderHistories, {
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

  async orderHold(dto: OrderSalesHoldDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {


      var result = await this.orderSaleMainModel.updateMany(
        {
          _id: { $in: dto.orderSaleIds },
        },
        {
          $set: {
            _holdRootCause:
              dto.rootCauseId == '' || dto.rootCauseId == 'nil'
                ? null
                : dto.rootCauseId,
            _isHold: dto.isHold,
            _holdDescription: dto.holdDescription,
          },
        },
        { new: true, session: transactionSession },
      );

      var arraySalesOrderHistories = [];
      dto.orderSaleIds.map((mapItem) => {
        arraySalesOrderHistories.push({
          _orderSaleId: mapItem,
          _userId: null,
          _type:(dto.isHold==1)?111:112,
          _deliveryProviderId: null,
          _deliveryCounterId: null,
          _orderSaleItemId: null,
          _shopId: null,
          _description: `${dto.rootCauseName} - ${dto.holdDescription}`,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      });
      await this.orderSaleHistoriesModel.insertMany(arraySalesOrderHistories, {
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
              { _uid: new RegExp(`^${dto.searchingText}$`, 'i') },
              { _referenceNumber: new RegExp(`^${dto.searchingText}$`, 'i') },
            ],
          },
        });
      }

      if (dto.uids != null && dto.uids.length > 0) {
        var arrayTemp = [];
        dto.uids.forEach((eachElement) => {
          arrayTemp.push(new RegExp(`^${eachElement}$`, 'i'));
        });

        arrayAggregation.push({
          $match: {
            _uid: { $in: arrayTemp },
          },
        });
      }
      if (dto.referenceNumbers != null && dto.referenceNumbers.length > 0) {
        var arrayTemp = [];
        dto.referenceNumbers.forEach((eachElement) => {
          arrayTemp.push(new RegExp(`^${eachElement}$`, 'i'));
        });

        arrayAggregation.push({
          $match: {
            _referenceNumber: { $in: arrayTemp },
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
      if (dto.dueStartDate != -1 && dto.dueEndDate != -1) {
        arrayAggregation.push({
          $match: {
            _dueDate: { $lte: dto.dueEndDate, $gte: dto.dueStartDate },
          },
        });
      }
      if (dto.shopIds.length > 0) {
        var newSettingsId = [];
        dto.shopIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _shopId: { $in: newSettingsId } },
        });
      }
      if (dto.orderHeadIds.length > 0) {
        var newSettingsId = [];
        dto.orderHeadIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _orderHeadId: { $in: newSettingsId } },
        });
      }

      if (dto.workStatus.length > 0) {
        arrayAggregation.push({
          $match: { _workStatus: { $in: dto.workStatus } },
        });
      }
      if (dto.isProductGenerated.length > 0) {
        arrayAggregation.push({
          $match: { _isProductGenerated: { $in: dto.isProductGenerated } },
        });
      }
      if (dto.isInvoiceGenerated.length > 0) {
        arrayAggregation.push({
          $match: { _isInvoiceGenerated: { $in: dto.isInvoiceGenerated } },
        });
      }

      if (dto.subCategoryIds.length > 0) {
        var newSettingsId = [];
        dto.subCategoryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderId: '$_id' },
              pipeline: [
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_orderSaleId', '$$orderId'] },
                  },
                },
                {
                  $match: {
                    _subCategoryId: { $in: newSettingsId },
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
              as: 'mongoCheckSubItems',
            },
          },
          {
            $match: { mongoCheckSubItems: { $ne: [] } },
          },
        );
      }
      if (
        (dto.cityIds != null && dto.cityIds.length > 0) ||
        (dto.branchIds != null && dto.branchIds.length > 0)
      ) {
        var branchIds = [];
        var cityIds = [];

        if (dto.cityIds != null && dto.cityIds.length > 0) {
          dto.cityIds.map((mapItem) => {
            cityIds.push(new mongoose.Types.ObjectId(mapItem));
          });
        }
        if (dto.branchIds != null && dto.branchIds.length > 0) {
          dto.branchIds.map((mapItem) => {
            branchIds.push(new mongoose.Types.ObjectId(mapItem));
          });
        }

        var shopPipeline = [];
        shopPipeline.push({
          $match: {
            _status: 1,
            $expr: { $eq: ['$_id', '$$shopId'] },
          },
        });
        if (branchIds.length != 0) {
          shopPipeline.push({
            $match: {
              _branchId: { $in: branchIds },
            },
          });
        }
        if (cityIds.length != 0) {
          shopPipeline.push({
            $match: {
              _cityId: { $in: cityIds },
            },
          });
        }
        shopPipeline.push({
          $project: {
            _id: 1,
          },
        });

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: shopPipeline,
              as: 'mongoCheckShop',
            },
          },
          {
            $match: { mongoCheckShop: { $ne: [] } },
          },
        );
      }
      if (dto.relationshipManagerIds.length > 0) {
        const shopMongoCheckPipeline = () => {
          const pipeline = [];
          pipeline.push({
            $match: {
              $expr: { $eq: ['$_id', '$$shopId'] },
            },
          });

          if (dto.relationshipManagerIds.length > 0) {
            var newSettingsId = [];
            dto.relationshipManagerIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            pipeline.push({
              $match: { _relationshipManagerId: { $in: newSettingsId } },
            });
          }

          pipeline.push({ $project: { _id: 1 } });

          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: shopMongoCheckPipeline(),
              as: 'mongoCheckShopList',
            },
          },
          {
            $match: { mongoCheckShopList: { $ne: [] } },
          },
        );
      }

      if (dto.setProcessOrderStatus.length != 0) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALE_SET_PROCESSES,
              let: { orderId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_orderSaleId', '$$orderId'] },
                  },
                },
                {
                  $match: {
                    _orderStatus: { $in: dto.setProcessOrderStatus },
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
              as: 'mongoCheckSetProcessList',
            },
          },
          {
            $match: { mongoCheckSetProcessList: { $ne: [] } },
          },
        );
      }
      if (
        dto.productCreatedStartDate != null &&
        dto.productCreatedEndDate != null &&
        dto.productCreatedEndDate != -1 &&
        dto.productCreatedStartDate != -1
      ) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderId: '$_id' },
              pipeline: [
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_orderSaleId', '$$orderId'] },
                  },
                },
                {
                  $project: {
                    _orderSaleId: 1,
                  },
                },

                {
                  $lookup: {
                    from: ModelNames.PRODUCTS,
                    let: { productId: '$_productId' },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ['$_id', '$$productId'] },

                          _createdAt: {
                            $lte: dto.productCreatedEndDate,
                            $gte: dto.productCreatedStartDate,
                          },
                        },
                      },
                      {
                        $project: {
                          _createdAt: 1,
                        },
                      },
                    ],
                    as: 'mongoCheckSubItemsProduct',
                  },
                },
                {
                  $match: { mongoCheckSubItemsProduct: { $ne: [] } },
                },
              ],
              as: 'mongoCheckSubItemsProductCheck',
            },
          },
          {
            $match: { mongoCheckSubItemsProductCheck: { $ne: [] } },
          },
        );
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
            $sort: { _dueDate: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      arrayAggregation.push(
        new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      const isorderSaleSetProcess = dto.screenType.includes(105);
      const isorderSaleSetProcessPipeline = () => {
        const orderSaleSetProcessUserPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1090,
              dto.responseFormat,
            ),
          );

          const isorderSaleSetProcessUserGlobalGallery =
            dto.screenType.includes(110);
          if (isorderSaleSetProcessUserGlobalGallery) {
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
                      1100,
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

        const pipeline = [];
        pipeline.push({
          $match: {
            _status: 1,
            $expr: { $eq: ['$_orderSaleId', '$$orderSaleSetProcess'] },
          },
        });

        pipeline.push(
          new ModelWeightResponseFormat().orderSaleSetProcessTableResponseFormat(
            1050,
            dto.responseFormat,
          ),
        );
        const isorderSaleSetProcessProcessMaster = dto.screenType.includes(108);
        if (isorderSaleSetProcessProcessMaster) {
          pipeline.push(
            {
              $lookup: {
                from: ModelNames.PROCESS_MASTER,
                let: { processId: '$_processId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$processId'] } } },
                  new ModelWeightResponseFormat().processMasterTableResponseFormat(
                    1080,
                    dto.responseFormat,
                  ),
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
          );

          const isorderSaleSetProcessUser = dto.screenType.includes(109);
          if (isorderSaleSetProcessUser) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { userId: '$_userId' },
                  pipeline: orderSaleSetProcessUserPipeline(),
                  as: 'userDetails',
                },
              },
              {
                $unwind: {
                  path: '$userDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }
        }

        const isorderSaleSetSubProcess = dto.screenType.includes(110);
        if (isorderSaleSetSubProcess) {
          const isorderSaleSetProcessPipeline = () => {
            const pipeline = [];
            pipeline.push(
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $eq: ['$_orderSaleSetProcessId', '$$setProcess'],
                  },
                },
              },
              new ModelWeightResponseFormat().orderSaleSetSubProcessTableResponseFormat(
                1100,
                dto.responseFormat,
              ),
            );
            const isorderSaleSetSubProcessMaster = dto.screenType.includes(111);
            if (isorderSaleSetSubProcessMaster) {
              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.SUB_PROCESS_MASTER,
                    let: { processId: '$_subProcessId' },
                    pipeline: [
                      {
                        $match: { $expr: { $eq: ['$_id', '$$processId'] } },
                      },
                      new ModelWeightResponseFormat().subProcessMasterTableResponseFormat(
                        1110,
                        dto.responseFormat,
                      ),
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
              );
            }
            const isorderSaleSetSubProcessUserPopulate =
              dto.screenType.includes(112);
            if (isorderSaleSetSubProcessUserPopulate) {
              const orderSaleSetSubProcessUserPipeline = () => {
                const pipeline = [];
                pipeline.push(
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$userId'] },
                    },
                  },
                  new ModelWeightResponseFormat().userTableResponseFormat(
                    1120,
                    dto.responseFormat,
                  ),
                );

                const isorderSaleSetSubProcessUserGlobalGalleryPopulate =
                  dto.screenType.includes(113);
                if (isorderSaleSetSubProcessUserGlobalGalleryPopulate) {
                  pipeline.push(
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

                          new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                            1130,
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

              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.USER,
                    let: { userId: '$_userId' },
                    pipeline: orderSaleSetSubProcessUserPipeline(),
                    as: 'userDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              );
            }

            return pipeline;
          };

          pipeline.push({
            $lookup: {
              from: ModelNames.ORDER_SALE_SET_SUB_PROCESSES,
              let: { setProcess: '$_id' },
              pipeline: isorderSaleSetProcessPipeline(),
              as: 'orderSaleSetSubProcessList',
            },
          });
        }

        if (dto.screenType.includes(140)) {
          const orderSaleSetProcessDocumentsPipeline = () => {
            const pipeline = [];
            pipeline.push(
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $eq: ['$_setProcessId', '$$setProcessId'],
                  },
                },
              },

              new ModelWeightResponseFormat().orderSaleSetprocessDocumentsTableResponseFormat(
                1400,
                dto.responseFormat,
              ),
            );

            if (dto.screenType.includes(141)) {
              pipeline.push(
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

                      new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                        1410,
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
              from: ModelNames.ORDER_SALE_SET_PROCESSES_DOCUMENTS,
              let: { setProcessId: '$_id' },
              pipeline: orderSaleSetProcessDocumentsPipeline(),
              as: 'orderSaleSetProcessDocuments',
            },
          });
        }

        return pipeline;
      };

      if (isorderSaleSetProcess) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_SET_PROCESSES,
            let: { orderSaleSetProcess: '$_id' },
            pipeline: isorderSaleSetProcessPipeline(),
            as: 'setProcessList',
          },
        });
      }
      if (dto.screenType.includes(142)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
              let: { rootCauseId: '$_holdRootCause' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$rootCauseId'] },
                  },
                },
                new ModelWeightResponseFormat().rootcauseTableResponseFormat(
                  1420,
                  dto.responseFormat,
                ),
              ],
              as: 'holdRootCauseDetails',
            },
          },
          {
            $unwind: {
              path: '$holdRootCauseDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.includes(120)) {
        const orderSaleShopOrderHeadPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1200,
              dto.responseFormat,
            ),
          );
          if (dto.screenType.includes(121)) {
            pipeline.push(
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
                    new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                      1210,
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
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_orderHeadId' },
              pipeline: orderSaleShopOrderHeadPipeline(),
              as: 'orderHeadDetails',
            },
          },
          {
            $unwind: {
              path: '$orderHeadDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(103)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
              let: { rootCauseId: '$_rootCauseId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$rootCauseId'] } } },
                new ModelWeightResponseFormat().rootcauseTableResponseFormat(
                  1030,
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
      const isorderSaleHistories = dto.screenType.includes(104);

      if (isorderSaleHistories) {
        const orderSaleHistoriesPipeline = () => {
          const pipeline = [];

          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: {
                  $eq: ['$_orderSaleId', '$$orderSaleId'],
                },
              },
            },
            new ModelWeightResponseFormat().orderSaleHistoryTableResponseFormat(
              1040,
              dto.responseFormat,
            ),
          );

          const isorderSaleHistoriesDeliveryProvider =
            dto.screenType.includes(133);
          if (isorderSaleHistoriesDeliveryProvider) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.DELIVERY_PROVIDER,
                  let: { deliveryProviderId: '$_deliveryProviderId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$deliveryProviderId'] },
                      },
                    },
                    new ModelWeightResponseFormat().deliveryProviderTableResponseFormat(
                      1330,
                      dto.responseFormat,
                    ),
                  ],
                  as: 'deliveryProviderDetails',
                },
              },
              {
                $unwind: {
                  path: '$deliveryProviderDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          const isorderSaleHistoriesUser = dto.screenType.includes(114);

          if (isorderSaleHistoriesUser) {
            const orderSaleHistoriesUserPipeline = () => {
              const pipeline = [];
              pipeline.push(
                { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
                new ModelWeightResponseFormat().userTableResponseFormat(
                  1140,
                  dto.responseFormat,
                ),
              );

              const isorderSaleHistoriesUserGlobalGallery =
                dto.screenType.includes(115);
              if (isorderSaleHistoriesUserGlobalGallery) {
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
                          1150,
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

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { userId: '$_userId' },
                  pipeline: orderSaleHistoriesUserPipeline(),
                  as: 'userDetails',
                },
              },
              {
                $unwind: {
                  path: '$userDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );

            const isorderSaleHistoriescreatedUser =
              dto.screenType.includes(116);
            if (isorderSaleHistoriescreatedUser) {
              const orderSaleHistoriesCreatedUserUserPipeline = () => {
                const pipeline = [];
                pipeline.push(
                  { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },

                  new ModelWeightResponseFormat().userTableResponseFormat(
                    1160,
                    dto.responseFormat,
                  ),
                );
                const isorderSaleHistoriescreatedUserGlobalGallery =
                  dto.screenType.includes(117);
                if (isorderSaleHistoriescreatedUserGlobalGallery) {
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
                            1170,
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

              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.USER,
                    let: { userId: '$_createdUserId' },
                    pipeline: orderSaleHistoriesCreatedUserUserPipeline(),
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
          }
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_HISTORIES,
            let: { orderSaleId: '$_id' },
            pipeline: orderSaleHistoriesPipeline(),
            as: 'orderSaleHistories',
          },
        });
      }

      const isorderSaledocuments = dto.screenType.includes(101);

      if (isorderSaledocuments) {
        const orderSaleDocumentsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_orderSaleId', '$$orderSaleIdId'] },
              },
            },
            new ModelWeightResponseFormat().orderSaleDocumentsTableResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );

          const isorderSaledocumentsGlobalGallery =
            dto.screenType.includes(118);

          if (isorderSaledocumentsGlobalGallery) {
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
                      1180,
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
            from: ModelNames.ORDER_SALES_DOCUMENTS,
            let: { orderSaleIdId: '$_id' },
            pipeline: orderSaleDocumentsPipeline(),
            as: 'orderSaleDocumentList',
          },
        });
      }

      const isorderSaleshop = dto.screenType.includes(102);

      if (isorderSaleshop) {
        const orderSaleShopPipeline = () => {
          const pipeline = [];
          pipeline.push(
            { $match: { $expr: { $eq: ['$_id', '$$shopId'] } } },
            new ModelWeightResponseFormat().shopTableResponseFormat(
              1020,
              dto.responseFormat,
            ),
          );
          const isorderSaleshopGlobalGallery = dto.screenType.includes(119);
          if (isorderSaleshopGlobalGallery) {
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
                      1190,
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

          const isorderSaleshopRelationshipManager =
            dto.screenType.includes(122);
          if (isorderSaleshopRelationshipManager) {
            const orderSaleShopOrderHeadPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$userId'] },
                  },
                },
                new ModelWeightResponseFormat().userTableResponseFormat(
                  1220,
                  dto.responseFormat,
                ),
              );

              const isorderSaleshopRelationshipManagerGlobalGallery =
                dto.screenType.includes(123);
              if (isorderSaleshopRelationshipManagerGlobalGallery) {
                pipeline.push(
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
                        new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                          1230,
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
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { userId: '$_relationshipManagerId' },
                  pipeline: orderSaleShopOrderHeadPipeline(),
                  as: 'relationshipManagerDetails',
                },
              },
              {
                $unwind: {
                  path: '$relationshipManagerDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: orderSaleShopPipeline(),
              as: 'shopDetails',
            },
          },
          {
            $unwind: {
              path: '$shopDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      const isorderSaleItems = dto.screenType.includes(124);
      if (isorderSaleItems) {
        const orderSaleItemsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_orderSaleId', '$$mainId'] },
              },
            },

            new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
              1240,
              dto.responseFormat,
            ),
          );

          const isorderSaleItemdocuments = dto.screenType.includes(138);

          if (isorderSaleItemdocuments) {
            const orderSaleItemDocumentsPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_orderSaleItemId', '$$orderSaleItemId'] },
                  },
                },
                new ModelWeightResponseFormat().orderSaleItemDocumentsTableResponseFormat(
                  1380,
                  dto.responseFormat,
                ),
              );

              const isorderSaledocumentsGlobalGallery =
                dto.screenType.includes(139);

              if (isorderSaledocumentsGlobalGallery) {
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
                          1390,
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
                from: ModelNames.ORDER_SALE_ITEM_DOCUMENTS,
                let: { orderSaleItemId: '$_id' },
                pipeline: orderSaleItemDocumentsPipeline(),
                as: 'orderSaleItemDocumentList',
              },
            });
          }

          const isorderSalesItemsProduct = dto.screenType.includes(125);
          if (isorderSalesItemsProduct) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.PRODUCTS,
                  let: { productId: '$_productId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$productId'],
                        },
                      },
                    },
                    new ModelWeightResponseFormat().productTableResponseFormat(
                      1250,
                      dto.responseFormat,
                    ),
                  ],
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

          const isorderSalesItemsDesign = dto.screenType.includes(126);
          if (isorderSalesItemsDesign) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.PRODUCTS,
                  let: { designId: '$_designId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$designId'],
                        },
                      },
                    },
                    new ModelWeightResponseFormat().productTableResponseFormat(
                      1260,
                      dto.responseFormat,
                    ),
                  ],
                  as: 'designDetails',
                },
              },
              {
                $unwind: {
                  path: '$designDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          const isorderSalesItemsSubCategory = dto.screenType.includes(127);
          if (isorderSalesItemsSubCategory) {
            const orderSaleSubCategoryPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$subCategoryId'],
                    },
                  },
                },
                new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                  1270,
                  dto.responseFormat,
                ),
              );

              const isorderSalesItemsSubCategoryCategory =
                dto.screenType.includes(128);
              if (isorderSalesItemsSubCategoryCategory) {
                const orderSaleSubCategoryPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$categoryId'],
                        },
                      },
                    },
                    new ModelWeightResponseFormat().categoryTableResponseFormat(
                      1280,
                      dto.responseFormat,
                    ),
                  );

                  const isorderSalesItemsSubCategoryCategoryGroup =
                    dto.screenType.includes(129);
                  if (isorderSalesItemsSubCategoryCategoryGroup) {
                    pipeline.push(
                      {
                        $lookup: {
                          from: ModelNames.GROUP_MASTERS,
                          let: { groupId: '$_groupId' },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $eq: ['$_id', '$$groupId'],
                                },
                              },
                            },
                            new ModelWeightResponseFormat().groupMasterTableResponseFormat(
                              1290,
                              dto.responseFormat,
                            ),
                          ],
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

                  return pipeline;
                };

                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.CATEGORIES,
                      let: { categoryId: '$_categoryId' },
                      pipeline: orderSaleSubCategoryPipeline(),
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

              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.SUB_CATEGORIES,
                  let: { subCategoryId: '$_subCategoryId' },
                  pipeline: orderSaleSubCategoryPipeline(),
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
          const isorderSalesItemsinvItems = dto.screenType.includes(134);
          if (isorderSalesItemsinvItems) {
            const isorderSalesItemsinvItemsPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    _status: 1,
                    $expr: {
                      $eq: ['$_orderSaleItemId', '$$osItemId'],
                    },
                  },
                },
                new ModelWeightResponseFormat().invoiceItemsTableResponseFormat(
                  1340,
                  dto.responseFormat,
                ),
              );

              const isorderSalesItemsinvItemsInvDetails =
                dto.screenType.includes(135);
              if (isorderSalesItemsinvItemsInvDetails) {
                const isorderSalesItemsinvItemsInvDetailsPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$invItemId'],
                        },
                      },
                    },
                    new ModelWeightResponseFormat().invoiceTableResponseFormat(
                      1350,
                      dto.responseFormat,
                    ),
                  );

                  const isorderSalesItemsinvItemsInvDelItemDetails =
                    dto.screenType.includes(136);
                  if (isorderSalesItemsinvItemsInvDelItemDetails) {
                    const isorderSalesItemsinvItemsInvDelItemDetailsPipeline =
                      () => {
                        const pipeline = [];
                        pipeline.push(
                          {
                            $match: {
                              _status: 1,
                              $expr: {
                                $eq: ['$_invoiceId', '$$invItemId'],
                              },
                            },
                          },
                          new ModelWeightResponseFormat().deliveryItemsTableResponseFormat(
                            1360,
                            dto.responseFormat,
                          ),
                        );

                        const isorderSalesItemsinvItemsInvDelItemDeliveryDetails =
                          dto.screenType.includes(137);
                        if (
                          isorderSalesItemsinvItemsInvDelItemDeliveryDetails
                        ) {
                          const isorderSalesItemsinvItemsInvDelItemDeliveryDetailsPipeline =
                            () => {
                              const pipeline = [];
                              pipeline.push(
                                {
                                  $match: {
                                    $expr: {
                                      $eq: ['$_id', '$$deliveryId'],
                                    },
                                  },
                                },
                                new ModelWeightResponseFormat().deliveryTableResponseFormat(
                                  1370,
                                  dto.responseFormat,
                                ),
                              );

                              return pipeline;
                            };

                          pipeline.push(
                            {
                              $lookup: {
                                from: ModelNames.DELIVERY,
                                let: { deliveryId: '$_deliveryId' },
                                pipeline:
                                  isorderSalesItemsinvItemsInvDelItemDeliveryDetailsPipeline(),
                                as: 'deliveryDetails',
                              },
                            },
                            {
                              $unwind: {
                                path: '$deliveryDetails',
                                preserveNullAndEmptyArrays: true,
                              },
                            },
                          );
                        }

                        return pipeline;
                      };

                    pipeline.push(
                      {
                        $lookup: {
                          from: ModelNames.DELIVERY_ITEMS,
                          let: { invItemId: '$_id' },
                          pipeline:
                            isorderSalesItemsinvItemsInvDelItemDetailsPipeline(),
                          as: 'deliveryItemDetails',
                        },
                      },
                      {
                        $unwind: {
                          path: '$deliveryItemDetails',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                    );
                  }

                  return pipeline;
                };

                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.INVOICES,
                      let: { invItemId: '$_invoiceId' },
                      pipeline: isorderSalesItemsinvItemsInvDetailsPipeline(),
                      as: 'invoiceDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$invoiceDetails',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                );
              }

              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.INVOICE_ITEMS,
                  let: { osItemId: '$_id' },
                  pipeline: isorderSalesItemsinvItemsPipeline(),
                  as: 'invoiceItemDetails',
                },
              },
              {
                $unwind: {
                  path: '$invoiceItemDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALES_ITEMS,
            let: { mainId: '$_id' },
            pipeline: orderSaleItemsPipeline(),
            as: 'orderItemsList',
          },
        });
      }
      var resultWorkets = [];
      var resultProcessMasters = [];
      var resultSubCategory = [];
      var resultShop = [];

      if (dto.screenType.includes(107)) {
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
      }
      if (dto.screenType.includes(100)) {
        resultProcessMasters = await this.processMasterModel.find({
          _status: 1,
        });
      }

      var result = await this.orderSaleMainModel
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

        var resultTotalCount = await this.orderSaleMainModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
        if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
        }
      }

      if (dto.screenType.includes(500)) {
        var pipeline = [];
        pipeline.push({
          $match: {
            _status: 1,
          },
        });
        pipeline.push(
          new ModelWeightResponseFormat().subCategoryTableResponseFormat(
            5000,
            dto.responseFormat,
          ),
        );

        resultSubCategory = await this.subCategoryModel.aggregate(pipeline);
      }

      if (dto.screenType.includes(505)) {
        var pipeline = [];
        pipeline.push({
          $match: {
            _status: 1,
          },
        });

        var newSettingsIdShop = [];
        dto.shopIds.map((mapItem) => {
          newSettingsIdShop.push(new mongoose.Types.ObjectId(mapItem));
        });
        pipeline.push({
          $match: {
            _id: { $in: newSettingsIdShop },
          },
        });

        pipeline.push(
          new ModelWeightResponseFormat().shopTableResponseFormat(
            5050,
            dto.responseFormat,
          ),
        );

        resultShop = await this.shopsModel.aggregate(pipeline);
      }
      var generalSetting = [];
      if (dto.screenType.includes(501)) {
        generalSetting = await this.generalsModel.aggregate([
          {
            $match: {
              _code: 1022,
            },
          },
        ]);
      }

      var resultGeneralsAppUpdate = [];
      var codeGeneralsAppUpdate = [];

      if (dto.screenType.includes(502)) {
        //employee
        codeGeneralsAppUpdate.push(100);
        codeGeneralsAppUpdate.push(102);
      }
      if (dto.screenType.includes(503)) {
        //customer
        codeGeneralsAppUpdate.push(101);
        codeGeneralsAppUpdate.push(103);
      }
      if (codeGeneralsAppUpdate.length != 0) {
        resultGeneralsAppUpdate = await this.generalsModel.aggregate([
          {
            $match: {
              _code: { $in: codeGeneralsAppUpdate },
            },
          },
          {
            $project: {
              _code: 1,
              _string: 1,
              _number: 1,
            },
          },
        ]);
      }
      var resultDeliveryRejectRootCause = [];
      if (dto.screenType.includes(504)) {
        var pipeline = [];
        pipeline.push({
          $match: {
            _status: 1,
            _type: { $in: [4] },
          },
        });
        pipeline.push(
          new ModelWeightResponseFormat().rootcauseTableResponseFormat(
            5040,
            dto.responseFormat,
          ),
        );

        resultDeliveryRejectRootCause = await this.rootCauseModel.aggregate(
          pipeline,
        );
      }

      const responseJSON = {
        message: 'success',
        data: {
          list: result,
          totalCount: totalCount,
          workers: resultWorkets,
          processMasters: resultProcessMasters,
          subCategory: resultSubCategory,
          shopDetails: resultShop,
          generalSetting: generalSetting,
          appUpdates: resultGeneralsAppUpdate,
          delRejectRootCause: resultDeliveryRejectRootCause,
          currentTime: dateTime,
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

  async reportList(dto: OrderSaleReportListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      // if (dto.searchingText != '') {
      //   //todo
      //   arrayAggregation.push({
      //     $match: {
      //       $or: [
      //         { _name: new RegExp(dto.searchingText, 'i') },
      //         { _uid: dto.searchingText },
      //         { _referenceNumber: dto.searchingText },
      //       ],
      //     },
      //   });
      // }
      if (dto.orderSaleUids.length > 0) {
        var arrayTemp = [];
        dto.orderSaleUids.forEach((eachElement) => {
          arrayTemp.push(new RegExp(`^${eachElement}$`, 'i'));
        });

        arrayAggregation.push({
          $match: {
            _uid: { $in: arrayTemp },
          },
        });
      }

      if (dto.dueStartDate != -1 && dto.dueEndDate != -1) {
        arrayAggregation.push({
          $match: {
            _dueDate: { $lte: dto.dueEndDate, $gte: dto.dueStartDate },
          },
        });
      }
      if (dto.createdDateStartDate != -1 && dto.createdDateEndDate != -1) {
        arrayAggregation.push({
          $match: {
            _createdAt: {
              $lte: dto.createdDateEndDate,
              $gte: dto.createdDateStartDate,
            },
          },
        });
      }

      if (dto.referenceIds.length > 0) {
        var arrayTemp = [];
        dto.referenceIds.forEach((eachElement) => {
          arrayTemp.push(new RegExp(`^${eachElement}$`, 'i'));
        });

        arrayAggregation.push({
          $match: {
            _referenceNumber: { $in: arrayTemp },
          },
        });
      }
      if (dto.types.length > 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.types } },
        });
      }

      if (dto.orderSaleIds.length > 0) {
        var newSettingsId = [];
        dto.orderSaleIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.shopIds.length > 0) {
        var newSettingsId = [];
        dto.shopIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _shopId: { $in: newSettingsId } },
        });
      }
      if (dto.orderHeadIds.length > 0) {
        var newSettingsId = [];
        dto.orderHeadIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _orderHeadId: { $in: newSettingsId } },
        });
      }

      if (dto.workStatus.length > 0) {
        arrayAggregation.push({
          $match: { _workStatus: { $in: dto.workStatus } },
        });
      }
      if (dto.isProductGenerated.length > 0) {
        arrayAggregation.push({
          $match: { _isProductGenerated: { $in: dto.isProductGenerated } },
        });
      }
      if (dto.isInvoiceGenerated.length > 0) {
        arrayAggregation.push({
          $match: { _isInvoiceGenerated: { $in: dto.isInvoiceGenerated } },
        });
      }

      if (
        dto.cityIds.length > 0 ||
        dto.branchIds.length > 0 ||
        dto.relationshipManagerIds.length > 0
      ) {
        const shopMongoCheckPipeline = () => {
          const pipeline = [];
          pipeline.push({
            $match: {
              $expr: { $eq: ['$_id', '$$shopId'] },
            },
          });
          if (dto.cityIds.length > 0) {
            var newSettingsId = [];
            dto.cityIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            pipeline.push({ $match: { _cityId: { $in: newSettingsId } } });
          }

          if (dto.branchIds.length > 0) {
            var newSettingsId = [];
            dto.branchIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            pipeline.push({ $match: { _branchId: { $in: newSettingsId } } });
          }
          if (dto.relationshipManagerIds.length > 0) {
            var newSettingsId = [];
            dto.relationshipManagerIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            pipeline.push({
              $match: { _relationshipManagerId: { $in: newSettingsId } },
            });
          }

          pipeline.push({ $project: { _id: 1 } });

          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: shopMongoCheckPipeline(),
              as: 'mongoCheckShopList',
            },
          },
          {
            $match: { mongoCheckShopList: { $ne: [] } },
          },
        );
      }

      //delivery

      if (
        (dto.deliveryCompleteEndDate != -1 &&
          dto.deliveryCompleteStartDate != -1) ||
        dto.deliveryExecutiveIds.length != 0 ||
        dto.deliveryStatus.length != 0
      ) {
        var listMatchDeliveryTable = [];
        listMatchDeliveryTable.push({
          $match: {
            $expr: {
              $eq: ['$_id', '$$deliveryId'],
            },
          },
        });

        if (
          dto.deliveryCompleteEndDate != -1 &&
          dto.deliveryCompleteStartDate != -1
        ) {
          listMatchDeliveryTable.push({
            $match: {
              _deliveryAcceptedAt: {
                $lte: dto.deliveryCompleteEndDate,
                $gte: dto.deliveryCompleteStartDate,
              },
            },
          });
        }

        if (dto.deliveryStatus.length != 0) {
          listMatchDeliveryTable.push({
            $match: { _workStatus: { $in: dto.deliveryStatus } },
          });
        }

        if (dto.deliveryExecutiveIds.length != 0) {
          var newSettingsId = [];
          dto.deliveryExecutiveIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          listMatchDeliveryTable.push({
            $match: { _employeeId: { $in: newSettingsId } },
          });
        }

        listMatchDeliveryTable.push({
          $project: {
            _id: 1,
          },
        });

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderSaleId: '$_id' },
              pipeline: [
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_orderSaleId', '$$orderSaleId'] },
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },

                {
                  $lookup: {
                    from: ModelNames.INVOICE_ITEMS,
                    let: { orderSaleItemId: '$_id' },
                    pipeline: [
                      {
                        $match: {
                          _status: 1,
                          $expr: {
                            $eq: ['$_orderSaleItemId', '$$orderSaleItemId'],
                          },
                        },
                      },
                      {
                        $project: {
                          _invoiceId: 1,
                        },
                      },

                      {
                        $lookup: {
                          from: ModelNames.INVOICES,
                          let: { invoiceId: '$_invoiceId' },
                          pipeline: [
                            {
                              $match: {
                                _status: 1,
                                $expr: { $eq: ['$_id', '$$invoiceId'] },
                              },
                            },
                            {
                              $project: {
                                _id: 1,
                              },
                            },

                            {
                              $lookup: {
                                from: ModelNames.DELIVERY_ITEMS,
                                let: { invoiceId: '$_id' },
                                pipeline: [
                                  {
                                    $match: {
                                      _status: 1,
                                      $expr: {
                                        $eq: ['$_invoiceId', '$$invoiceId'],
                                      },
                                    },
                                  },
                                  {
                                    $project: {
                                      _deliveryId: 1,
                                    },
                                  },

                                  {
                                    $lookup: {
                                      from: ModelNames.DELIVERY,
                                      let: { deliveryId: '$_deliveryId' },
                                      pipeline: listMatchDeliveryTable,
                                      as: 'mongoCheckDelivery',
                                    },
                                  },
                                  {
                                    $match: { mongoCheckDelivery: { $ne: [] } },
                                  },
                                ],
                                as: 'mongoCheckDeliveryItems',
                              },
                            },
                            {
                              $match: { mongoCheckDeliveryItems: { $ne: [] } },
                            },
                          ],
                          as: 'mongoCheckInvoice',
                        },
                      },
                      {
                        $match: { mongoCheckInvoice: { $ne: [] } },
                      },
                    ],
                    as: 'mongoCheckInvoiceItems',
                  },
                },
                {
                  $match: { mongoCheckInvoiceItems: { $ne: [] } },
                },
              ],
              as: 'mongoCheckOrdersaleItems',
            },
          },
          {
            $match: { mongoCheckOrdersaleItems: { $ne: [] } },
          },
        );
      }

      if (
        dto.deliveryAssignedStartDate != -1 ||
        dto.deliveryAssignedEndDate != -1 ||
        dto.logisticsPartnerIds.length != 0
      ) {
        var logisticsPartnerIdsMongo = [];

        if (dto.logisticsPartnerIds.length > 0) {
          dto.logisticsPartnerIds.map((mapItem) => {
            logisticsPartnerIdsMongo.push(new mongoose.Types.ObjectId(mapItem));
          });
        }

        const orderSaleItemsMongoCheckPipeline = () => {
          const pipeline = [];
          pipeline.push({
            $match: {
              _status: 1,
              $expr: { $eq: ['$_orderSaleId', '$$orderSaleId'] },
            },
          });

          const invoiceItemsMongoCheckPipeline = () => {
            const pipeline = [];
            pipeline.push({
              $match: {
                $expr: { $eq: ['$_orderSaleItemId', '$$orderSaleItemId'] },
              },
            });

            const invoiceItemsInvoiceDetailsMongoCheckPipeline = () => {
              const pipeline = [];
              pipeline.push({
                $match: {
                  $expr: { $eq: ['$_id', '$$invoiceId'] },
                },
              });

              const invoiceItemsInvoiceDetailsDeliveryTempMongoCheckPipeline =
                () => {
                  const pipeline = [];
                  pipeline.push({
                    $match: {
                      // _status: 1,
                      $expr: { $eq: ['$_invoiceId', '$$invoiceIdForDelTemp'] },
                    },
                  });

                  if (dto.deliveryAssignedStartDate != -1) {
                    pipeline.push({
                      $match: {
                        _assignedAt: { $gte: dto.deliveryAssignedStartDate },
                      },
                    });
                  }

                  if (dto.deliveryAssignedEndDate != -1) {
                    pipeline.push({
                      $match: {
                        _assignedAt: { $lte: dto.deliveryAssignedEndDate },
                      },
                    });
                  }
                  if (logisticsPartnerIdsMongo.length != 0) {
                    pipeline.push({
                      $match: {
                        _deliveryProviderId: { $in: logisticsPartnerIdsMongo },
                      },
                    });
                  }
                  pipeline.push({ $project: { _id: 1 } });
                  return pipeline;
                };

              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.DELIVERY_TEMP,
                    let: { invoiceIdForDelTemp: '$_id' },
                    pipeline:
                      invoiceItemsInvoiceDetailsDeliveryTempMongoCheckPipeline(),
                    as: 'deliveryTempList',
                  },
                },
                {
                  $match: { deliveryTempList: { $ne: [] } },
                },
              );

              pipeline.push({ $project: { _id: 1 } });
              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.INVOICES,
                  let: { invoiceId: '$_invoiceId' },
                  pipeline: invoiceItemsInvoiceDetailsMongoCheckPipeline(),
                  as: 'invoiceDetails',
                },
              },
              {
                $unwind: {
                  path: '$invoiceDetails',
                },
              },
            );

            pipeline.push({ $project: { _id: 1 } });
            return pipeline;
          };

          pipeline.push(
            {
              $lookup: {
                from: ModelNames.INVOICE_ITEMS,
                let: { orderSaleItemId: '$_id' },
                pipeline: invoiceItemsMongoCheckPipeline(),
                as: 'mongoCheckInvoiceList',
              },
            },
            {
              $match: { mongoCheckInvoiceList: { $ne: [] } },
            },
          );

          pipeline.push({ $project: { _id: 1 } });
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderSaleId: '$_id' },
              pipeline: orderSaleItemsMongoCheckPipeline(),
              as: 'mongoCheckOrderItemsDeliveryAssignList',
            },
          },
          {
            $match: { mongoCheckOrderItemsDeliveryAssignList: { $ne: [] } },
          },
        );
      }

      //product

      if (
        dto.netWeightStart != -1 ||
        dto.netWeightEnd != -1 ||
        dto.huids.length != 0 ||
        dto.productCreatedStartDate != -1 ||
        dto.productCreatedEndDate != -1 ||
        (dto.invoiceDateStartDate != -1 && dto.invoiceDateEndDate != -1) ||
        dto.invoiceUids.length != 0
      ) {
        const orderSaleItemsMongoCheckPipeline = () => {
          const pipeline = [];
          pipeline.push({
            $match: {
              _status: 1,
              $expr: { $eq: ['$_orderSaleId', '$$orderSaleId'] },
            },
          });
          if (
            dto.netWeightStart != -1 ||
            dto.netWeightEnd != -1 ||
            dto.productCreatedStartDate != -1 ||
            dto.productCreatedEndDate != -1 ||
            dto.huids.length != 0
          ) {
            const orderSaleItemsProductMongoCheckPipeline = () => {
              const pipeline = [];
              pipeline.push({
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_orderItemId', '$$orderSaleItemId'] },
                },
              });

              if (dto.netWeightStart != -1) {
                pipeline.push({
                  $match: {
                    _netWeight: { $gte: dto.netWeightStart },
                  },
                });
              }

              if (dto.productCreatedStartDate != -1) {
                pipeline.push({
                  $match: {
                    _createdAt: { $gte: dto.productCreatedStartDate },
                  },
                });
              }

              if (dto.productCreatedEndDate != -1) {
                pipeline.push({
                  $match: {
                    _createdAt: { $lte: dto.productCreatedEndDate },
                  },
                });
              }

              if (dto.netWeightEnd != -1) {
                pipeline.push({
                  $match: {
                    _netWeight: { $lte: dto.netWeightEnd },
                  },
                });
              }

              if (dto.huids.length != 0) {
                var arrayTemp = [];
                dto.huids.forEach((eachElement) => {
                  arrayTemp.push(new RegExp(`^${eachElement}$`, 'i'));
                });

                pipeline.push({
                  $match: {
                    _huId: { $in: arrayTemp },
                  },
                });
              }

              pipeline.push({ $project: { _id: 1 } });
              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.PRODUCTS,
                  let: { orderSaleItemId: '$_id' },
                  pipeline: orderSaleItemsProductMongoCheckPipeline(),
                  as: 'mongoCheckProductlist',
                },
              },
              {
                $match: { mongoCheckProductlist: { $ne: [] } },
              },
            );
          }

          if (
            (dto.invoiceDateStartDate != -1 && dto.invoiceDateEndDate != -1) ||
            dto.invoiceUids.length != 0
          ) {
            const invoiceItemsMongoCheckPipeline = () => {
              const pipeline = [];
              pipeline.push({
                $match: {
                  $expr: { $eq: ['$_orderSaleItemId', '$$orderSaleItemId'] },
                },
              });

              const invoiceItemsInvoiceDetailsMongoCheckPipeline = () => {
                const pipeline = [];
                pipeline.push({
                  $match: {
                    $expr: { $eq: ['$_id', '$$invoiceId'] },
                  },
                });

                if (
                  dto.invoiceDateStartDate != -1 &&
                  dto.invoiceDateEndDate != -1
                ) {
                  pipeline.push({
                    $match: {
                      _createdAt: {
                        $gte: dto.invoiceDateStartDate,
                        $lte: dto.invoiceDateEndDate,
                      },
                    },
                  });
                }
                if (dto.invoiceUids.length != 0) {
                  var arrayTemp = [];
                  dto.invoiceUids.forEach((eachElement) => {
                    arrayTemp.push(new RegExp(`^${eachElement}$`, 'i'));
                  });

                  pipeline.push({
                    $match: {
                      _uid: { $in: arrayTemp },
                    },
                  });
                }

                pipeline.push({ $project: { _id: 1 } });
                return pipeline;
              };

              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.INVOICES,
                    let: { invoiceId: '$_invoiceId' },
                    pipeline: invoiceItemsInvoiceDetailsMongoCheckPipeline(),
                    as: 'invoiceDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$invoiceDetails',
                  },
                },
              );

              pipeline.push({ $project: { _id: 1 } });
              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.INVOICE_ITEMS,
                  let: { orderSaleItemId: '$_id' },
                  pipeline: invoiceItemsMongoCheckPipeline(),
                  as: 'mongoCheckInvoiceList',
                },
              },
              {
                $match: { mongoCheckInvoiceList: { $ne: [] } },
              },
            );
          }

          pipeline.push({ $project: { _id: 1 } });
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderSaleId: '$_id' },
              pipeline: orderSaleItemsMongoCheckPipeline(),
              as: 'mongoCheckOrderItemsList',
            },
          },
          {
            $match: { mongoCheckOrderItemsList: { $ne: [] } },
          },
        );
      }

      if (
        dto.orderProcessMasterIds.length != 0 &&
        dto.orderSetProcessOrderStatus.length != 0
      ) {
        var mongoProcessMasterIdsArray = [];
        dto.orderProcessMasterIds.forEach((eachItem) => {
          mongoProcessMasterIdsArray.push(
            new mongoose.Types.ObjectId(eachItem),
          );
        });

        const orderSaleSetProcessPipeline = () => {
          const pipeline = [];
          pipeline.push({
            $match: {
              _status: 1,
              $expr: { $eq: ['$_orderSaleId', '$$orderSaleId'] },
            },
          });

          pipeline.push({
            $match: {
              _processId: { $in: mongoProcessMasterIdsArray },
              _orderStatus: { $in: dto.orderSetProcessOrderStatus },
            },
          });

          pipeline.push({ $project: { _id: 1 } });
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALE_SET_PROCESSES,
              let: { orderSaleId: '$_id' },
              pipeline: orderSaleSetProcessPipeline(),
              as: 'mongoCheckProcessMasterWithWorkStatus',
            },
          },
          {
            $match: { mongoCheckProcessMasterWithWorkStatus: { $ne: [] } },
          },
        );
      }

      if (
        dto.orderSetProcessWorkerIds.length != 0 ||
        dto.orderSetProcessOrderStatus.length != 0 ||
        (dto.processAssignStartDate != -1 && dto.processAssignEndDate != -1) ||
        (dto.processWorkCompletedStartDate != -1 &&
          dto.processWorkCompletedEndDate != -1) ||
        (dto.processWorkStartDate != -1 && dto.processWorkEndDate != -1)
      ) {
        var mongoWorkerIdsArray = [];
        dto.orderSetProcessWorkerIds.forEach((eachItem) => {
          mongoWorkerIdsArray.push(new mongoose.Types.ObjectId(eachItem));
        });
        const orderSaleSetProcessPipeline = () => {
          const pipeline = [];
          pipeline.push({
            $match: {
              _status: 1,
              $expr: { $eq: ['$_orderSaleId', '$$orderSaleId'] },
            },
          });
          if (dto.orderSetProcessWorkerIds.length != 0) {
            pipeline.push({
              $match: {
                _userId: { $in: mongoWorkerIdsArray },
              },
            });
          }
          if (dto.orderSetProcessOrderStatus.length != 0) {
            pipeline.push({
              $match: {
                _orderStatus: { $in: dto.orderSetProcessOrderStatus },
              },
            });
          }

          if (
            dto.processAssignStartDate != -1 &&
            dto.processAssignEndDate != -1
          ) {
            pipeline.push({
              $match: {
                _workAssignedTime: {
                  $gte: dto.processAssignStartDate,
                  $lte: dto.processAssignEndDate,
                },
              },
            });
          }

          if (
            dto.processWorkCompletedStartDate != -1 &&
            dto.processWorkCompletedEndDate != -1
          ) {
            pipeline.push({
              $match: {
                _workCompletedTime: {
                  $gte: dto.processWorkCompletedStartDate,
                  $lte: dto.processWorkCompletedEndDate,
                },
              },
            });
          }

          if (dto.processWorkStartDate != -1 && dto.processWorkEndDate != -1) {
            pipeline.push({
              $match: {
                _workStartedTime: {
                  $gte: dto.processWorkStartDate,
                  $lte: dto.processWorkEndDate,
                },
              },
            });
          }

          pipeline.push({ $project: { _id: 1 } });
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALE_SET_PROCESSES,
              let: { orderSaleId: '$_id' },
              pipeline: orderSaleSetProcessPipeline(),
              as: 'mongoCheckWorkerWithWorkStatus',
            },
          },
          {
            $match: { mongoCheckWorkerWithWorkStatus: { $ne: [] } },
          },
        );
      }

      if (dto.subCategoryIds.length > 0) {
        var newSettingsId = [];
        dto.subCategoryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderId: '$_id' },
              pipeline: [
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_orderSaleId', '$$orderId'] },
                  },
                },
                {
                  $match: {
                    _subCategoryId: { $in: newSettingsId },
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
              as: 'mongoCheckSubItems',
            },
          },
          {
            $match: { mongoCheckSubItems: { $ne: [] } },
          },
        );
      }

      if (dto.setProcessOrderStatus.length != 0) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALE_SET_PROCESSES,
              let: { orderId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_orderSaleId', '$$orderId'] },
                  },
                },
                {
                  $match: {
                    _orderStatus: { $in: dto.setProcessOrderStatus },
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
              as: 'mongoCheckSetProcessList',
            },
          },
          {
            $match: { mongoCheckSetProcessList: { $ne: [] } },
          },
        );
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
            $sort: { _dueDate: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }

      arrayAggregation.push(
        new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      //imp
      if (dto.agingStartCount != -1 || dto.agingEndCount != -1) {
        arrayAggregation[arrayAggregation.length - 1].$project.aging = {
          $dateDiff: {
            startDate: { $toDate: '$_createdAt' },
            endDate: { $toDate: dateTime },
            unit: 'day',
          },
        };

        arrayAggregation.push({ $match: { _workStatus: { $ne: 35 } } });

        if (dto.agingStartCount != -1) {
          arrayAggregation.push({
            $match: {
              aging: { $gte: dto.agingStartCount },
            },
          });
        }
        if (dto.agingEndCount != -1) {
          arrayAggregation.push({
            $match: {
              aging: { $lte: dto.agingEndCount },
            },
          });
        }
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      const isorderSaleSetProcess = dto.screenType.includes(105);
      const isorderSaleSetProcessPipeline = () => {
        const orderSaleSetProcessUserPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1090,
              dto.responseFormat,
            ),
          );

          const isorderSaleSetProcessUserGlobalGallery =
            dto.screenType.includes(110);
          if (isorderSaleSetProcessUserGlobalGallery) {
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
                      1100,
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

        const pipeline = [];
        pipeline.push({
          $match: {
            _status: 1,
            $expr: { $eq: ['$_orderSaleId', '$$orderSaleSetProcess'] },
          },
        });

        pipeline.push(
          new ModelWeightResponseFormat().orderSaleSetProcessTableResponseFormat(
            1050,
            dto.responseFormat,
          ),
        );
        const isorderSaleSetProcessProcessMaster = dto.screenType.includes(108);
        if (isorderSaleSetProcessProcessMaster) {
          pipeline.push(
            {
              $lookup: {
                from: ModelNames.PROCESS_MASTER,
                let: { processId: '$_processId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$processId'] } } },
                  new ModelWeightResponseFormat().processMasterTableResponseFormat(
                    1080,
                    dto.responseFormat,
                  ),
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
          );

          const isorderSaleSetProcessUser = dto.screenType.includes(109);
          if (isorderSaleSetProcessUser) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { userId: '$_userId' },
                  pipeline: orderSaleSetProcessUserPipeline(),
                  as: 'userDetails',
                },
              },
              {
                $unwind: {
                  path: '$userDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }
        }

        const isorderSaleSetSubProcess = dto.screenType.includes(110);
        if (isorderSaleSetSubProcess) {
          const isorderSaleSetProcessPipeline = () => {
            const pipeline = [];
            pipeline.push(
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $eq: ['$_orderSaleSetProcessId', '$$setProcess'],
                  },
                },
              },
              new ModelWeightResponseFormat().orderSaleSetSubProcessTableResponseFormat(
                1100,
                dto.responseFormat,
              ),
            );
            const isorderSaleSetSubProcessMaster = dto.screenType.includes(111);
            if (isorderSaleSetSubProcessMaster) {
              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.SUB_PROCESS_MASTER,
                    let: { processId: '$_subProcessId' },
                    pipeline: [
                      {
                        $match: { $expr: { $eq: ['$_id', '$$processId'] } },
                      },
                      new ModelWeightResponseFormat().subProcessMasterTableResponseFormat(
                        1110,
                        dto.responseFormat,
                      ),
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
              );
            }
            const isorderSaleSetSubProcessUserPopulate =
              dto.screenType.includes(112);
            if (isorderSaleSetSubProcessUserPopulate) {
              const orderSaleSetSubProcessUserPipeline = () => {
                const pipeline = [];
                pipeline.push(
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$userId'] },
                    },
                  },
                  new ModelWeightResponseFormat().userTableResponseFormat(
                    1120,
                    dto.responseFormat,
                  ),
                );

                const isorderSaleSetSubProcessUserGlobalGalleryPopulate =
                  dto.screenType.includes(113);
                if (isorderSaleSetSubProcessUserGlobalGalleryPopulate) {
                  pipeline.push(
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

                          new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                            1130,
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

              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.USER,
                    let: { userId: '$_userId' },
                    pipeline: orderSaleSetSubProcessUserPipeline(),
                    as: 'userDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              );
            }

            return pipeline;
          };

          pipeline.push({
            $lookup: {
              from: ModelNames.ORDER_SALE_SET_SUB_PROCESSES,
              let: { setProcess: '$_id' },
              pipeline: isorderSaleSetProcessPipeline(),
              as: 'orderSaleSetSubProcessList',
            },
          });
        }

        return pipeline;
      };

      if (isorderSaleSetProcess) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_SET_PROCESSES,
            let: { orderSaleSetProcess: '$_id' },
            pipeline: isorderSaleSetProcessPipeline(),
            as: 'setProcessList',
          },
        });
      }
      if (dto.screenType.includes(120)) {
        const orderSaleShopOrderHeadPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1200,
              dto.responseFormat,
            ),
          );
          if (dto.screenType.includes(121)) {
            pipeline.push(
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
                    new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                      1210,
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
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_orderHeadId' },
              pipeline: orderSaleShopOrderHeadPipeline(),
              as: 'orderHeadDetails',
            },
          },
          {
            $unwind: {
              path: '$orderHeadDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.includes(103)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
              let: { rootCauseId: '$_rootCauseId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$rootCauseId'] } } },
                new ModelWeightResponseFormat().rootcauseTableResponseFormat(
                  1030,
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
      const isorderSaleHistories = dto.screenType.includes(104);

      if (isorderSaleHistories) {
        const orderSaleHistoriesPipeline = () => {
          const pipeline = [];

          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: {
                  $eq: ['$_orderSaleId', '$$orderSaleId'],
                },
              },
            },
            new ModelWeightResponseFormat().orderSaleHistoryTableResponseFormat(
              1040,
              dto.responseFormat,
            ),
          );

          const isorderSaleHistoriesDeliveryProvider =
            dto.screenType.includes(133);
          if (isorderSaleHistoriesDeliveryProvider) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.DELIVERY_PROVIDER,
                  let: { deliveryProviderId: '$_deliveryProviderId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$deliveryProviderId'] },
                      },
                    },
                    new ModelWeightResponseFormat().deliveryProviderTableResponseFormat(
                      1330,
                      dto.responseFormat,
                    ),
                  ],
                  as: 'deliveryProviderDetails',
                },
              },
              {
                $unwind: {
                  path: '$deliveryProviderDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          const isorderSaleHistoriesUser = dto.screenType.includes(114);

          if (isorderSaleHistoriesUser) {
            const orderSaleHistoriesUserPipeline = () => {
              const pipeline = [];
              pipeline.push(
                { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
                new ModelWeightResponseFormat().userTableResponseFormat(
                  1140,
                  dto.responseFormat,
                ),
              );

              const isorderSaleHistoriesUserGlobalGallery =
                dto.screenType.includes(115);
              if (isorderSaleHistoriesUserGlobalGallery) {
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
                          1150,
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

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { userId: '$_userId' },
                  pipeline: orderSaleHistoriesUserPipeline(),
                  as: 'userDetails',
                },
              },
              {
                $unwind: {
                  path: '$userDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );

            const isorderSaleHistoriescreatedUser =
              dto.screenType.includes(116);
            if (isorderSaleHistoriescreatedUser) {
              const orderSaleHistoriesCreatedUserUserPipeline = () => {
                const pipeline = [];
                pipeline.push(
                  { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },

                  new ModelWeightResponseFormat().userTableResponseFormat(
                    1160,
                    dto.responseFormat,
                  ),
                );
                const isorderSaleHistoriescreatedUserGlobalGallery =
                  dto.screenType.includes(117);
                if (isorderSaleHistoriescreatedUserGlobalGallery) {
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
                            1170,
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

              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.USER,
                    let: { userId: '$_createdUserId' },
                    pipeline: orderSaleHistoriesCreatedUserUserPipeline(),
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
          }
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_HISTORIES,
            let: { orderSaleId: '$_id' },
            pipeline: orderSaleHistoriesPipeline(),
            as: 'orderSaleHistories',
          },
        });
      }

      const isorderSaledocuments = dto.screenType.includes(101);

      if (isorderSaledocuments) {
        const orderSaleDocumentsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_orderSaleId', '$$orderSaleIdId'] },
              },
            },
            new ModelWeightResponseFormat().orderSaleDocumentsTableResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );

          const isorderSaledocumentsGlobalGallery =
            dto.screenType.includes(118);

          if (isorderSaledocumentsGlobalGallery) {
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
                      1180,
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
            from: ModelNames.ORDER_SALES_DOCUMENTS,
            let: { orderSaleIdId: '$_id' },
            pipeline: orderSaleDocumentsPipeline(),
            as: 'orderSaleDocumentList',
          },
        });
      }

      const isorderSaleshop = dto.screenType.includes(102);

      if (isorderSaleshop) {
        const orderSaleShopPipeline = () => {
          const pipeline = [];
          pipeline.push(
            { $match: { $expr: { $eq: ['$_id', '$$shopId'] } } },
            new ModelWeightResponseFormat().shopTableResponseFormat(
              1020,
              dto.responseFormat,
            ),
          );
          const isorderSaleshopGlobalGallery = dto.screenType.includes(119);
          if (isorderSaleshopGlobalGallery) {
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
                      1190,
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

          const isorderSaleshopCity = dto.screenType.includes(134);
          if (isorderSaleshopCity) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.CITIES,
                  let: { cityId: '$_cityId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$cityId'] },
                      },
                    },
                    new ModelWeightResponseFormat().cityTableResponseFormat(
                      1340,
                      dto.responseFormat,
                    ),
                  ],
                  as: 'cityDetails',
                },
              },
              {
                $unwind: {
                  path: '$cityDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          const isorderSaleshopBranch = dto.screenType.includes(130);
          if (isorderSaleshopBranch) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.BRANCHES,
                  let: { branchId: '$_branchId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$branchId'] },
                      },
                    },
                    new ModelWeightResponseFormat().branchTableResponseFormat(
                      1300,
                      dto.responseFormat,
                    ),
                  ],
                  as: 'branchDetails',
                },
              },
              {
                $unwind: {
                  path: '$branchDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          const isorderSaleshopRelationshipManager =
            dto.screenType.includes(122);
          if (isorderSaleshopRelationshipManager) {
            const orderSaleShopOrderHeadPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$userId'] },
                  },
                },
                new ModelWeightResponseFormat().userTableResponseFormat(
                  1220,
                  dto.responseFormat,
                ),
              );

              const isorderSaleshopRelationshipManagerGlobalGallery =
                dto.screenType.includes(123);
              if (isorderSaleshopRelationshipManagerGlobalGallery) {
                pipeline.push(
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
                        new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                          1230,
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
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { userId: '$_relationshipManagerId' },
                  pipeline: orderSaleShopOrderHeadPipeline(),
                  as: 'relationshipManagerDetails',
                },
              },
              {
                $unwind: {
                  path: '$relationshipManagerDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: orderSaleShopPipeline(),
              as: 'shopDetails',
            },
          },
          {
            $unwind: {
              path: '$shopDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      const isorderSaleItems = dto.screenType.includes(124);
      if (isorderSaleItems) {
        const orderSaleItemsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_orderSaleId', '$$mainId'] },
              },
            },

            new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
              1240,
              dto.responseFormat,
            ),
          );

          const isorderSalesItemsProduct = dto.screenType.includes(125);
          if (isorderSalesItemsProduct) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.PRODUCTS,
                  let: { productId: '$_productId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$productId'],
                        },
                      },
                    },
                    new ModelWeightResponseFormat().productTableResponseFormat(
                      1250,
                      dto.responseFormat,
                    ),
                  ],
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

          const isorderSalesItemsInVoiceItems = dto.screenType.includes(131);
          if (isorderSalesItemsInVoiceItems) {
            const invoiceItemsPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    _status: 1,
                    $expr: {
                      $eq: ['$_orderSaleItemId', '$$invoiceItemId'],
                    },
                  },
                },
                new ModelWeightResponseFormat().invoiceItemsTableResponseFormat(
                  1310,
                  dto.responseFormat,
                ),
              );

              const isorderSalesItemsInVoiceItemsInvoiceDetails =
                dto.screenType.includes(132);
              if (isorderSalesItemsInVoiceItemsInvoiceDetails) {
                const invoiceItemsDeliveryTempPipeline = () => {
                  const pipeline = [];

                  pipeline.push(
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$invoiceId'],
                        },
                      },
                    },
                    new ModelWeightResponseFormat().invoiceTableResponseFormat(
                      1320,
                      dto.responseFormat,
                    ),
                  );

                  const isorderSalesItemsInVoiceItemsInvoiceDeliveryTempDetails =
                    dto.screenType.includes(135);
                  if (isorderSalesItemsInVoiceItemsInvoiceDeliveryTempDetails) {
                    pipeline.push(
                      {
                        $lookup: {
                          from: ModelNames.DELIVERY_TEMP,
                          let: { invoiceDeliveryTempId: '$_id' },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $eq: [
                                    '$_invoiceId',
                                    '$$invoiceDeliveryTempId',
                                  ],
                                },
                              },
                            },
                            new ModelWeightResponseFormat().deliveryTempTableResponseFormat(
                              1350,
                              dto.responseFormat,
                            ),
                          ],
                          as: 'deliveryTempDetails',
                        },
                      },
                      {
                        $unwind: {
                          path: '$deliveryTempDetails',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                    );
                  }
                  return pipeline;
                };

                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.INVOICES,
                      let: { invoiceId: '$_invoiceId' },
                      pipeline: invoiceItemsDeliveryTempPipeline(),
                      as: 'invoiceDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$invoiceDetails',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                );
              }

              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.INVOICE_ITEMS,
                  let: { invoiceItemId: '$_id' },
                  pipeline: invoiceItemsPipeline(),
                  as: 'invoiceItemDetails',
                },
              },
              {
                $unwind: {
                  path: '$invoiceItemDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          const isorderSalesItemsDesign = dto.screenType.includes(126);
          if (isorderSalesItemsDesign) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.PRODUCTS,
                  let: { designId: '$_designId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$designId'],
                        },
                      },
                    },
                    new ModelWeightResponseFormat().productTableResponseFormat(
                      1260,
                      dto.responseFormat,
                    ),
                  ],
                  as: 'designDetails',
                },
              },
              {
                $unwind: {
                  path: '$designDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          const isorderSalesItemsSubCategory = dto.screenType.includes(127);
          if (isorderSalesItemsSubCategory) {
            const orderSaleSubCategoryPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$subCategoryId'],
                    },
                  },
                },
                new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                  1270,
                  dto.responseFormat,
                ),
              );

              const isorderSalesItemsSubCategoryCategory =
                dto.screenType.includes(128);
              if (isorderSalesItemsSubCategoryCategory) {
                const orderSaleSubCategoryPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$categoryId'],
                        },
                      },
                    },
                    new ModelWeightResponseFormat().categoryTableResponseFormat(
                      1280,
                      dto.responseFormat,
                    ),
                  );

                  const isorderSalesItemsSubCategoryCategoryGroup =
                    dto.screenType.includes(129);
                  if (isorderSalesItemsSubCategoryCategoryGroup) {
                    pipeline.push(
                      {
                        $lookup: {
                          from: ModelNames.GROUP_MASTERS,
                          let: { groupId: '$_groupId' },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $eq: ['$_id', '$$groupId'],
                                },
                              },
                            },
                            new ModelWeightResponseFormat().groupMasterTableResponseFormat(
                              1290,
                              dto.responseFormat,
                            ),
                          ],
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

                  return pipeline;
                };

                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.CATEGORIES,
                      let: { categoryId: '$_categoryId' },
                      pipeline: orderSaleSubCategoryPipeline(),
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

              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.SUB_CATEGORIES,
                  let: { subCategoryId: '$_subCategoryId' },
                  pipeline: orderSaleSubCategoryPipeline(),
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

          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALES_ITEMS,
            let: { mainId: '$_id' },
            pipeline: orderSaleItemsPipeline(),
            as: 'orderItemsList',
          },
        });
      }

      var resultWorkets = [];
      var resultProcessMasters = [];
      var resultSubCategory = [];

      if (dto.screenType.includes(107)) {
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
      }
      if (dto.screenType.includes(100)) {
        resultProcessMasters = await this.processMasterModel.find({
          _status: 1,
        });
      }

      var result = await this.orderSaleMainModel
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

        var resultTotalCount = await this.orderSaleMainModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
        if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
        }
      }

      if (dto.screenType.includes(500)) {
        var pipeline = [];
        pipeline.push({
          $match: {
            _status: 1,
          },
        });
        pipeline.push(
          new ModelWeightResponseFormat().subCategoryTableResponseFormat(
            5000,
            dto.responseFormat,
          ),
        );

        resultSubCategory = await this.subCategoryModel.aggregate(pipeline);
      }
      var generalSetting = [];
      if (dto.screenType.includes(501)) {
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
          workers: resultWorkets,
          processMasters: resultProcessMasters,
          subCategory: resultSubCategory,
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

      if (dto.screenType.includes(500)) {
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
      //check nested
      if (
        (dto.searchingText != null && dto.searchingText != '') ||
        (dto.shopIds != null && dto.shopIds.length != 0) ||
        (dto.subCategoryIds != null && dto.subCategoryIds.length != 0) ||
        (dto.dueStartDate != null &&
          dto.dueEndDate != null &&
          dto.dueStartDate != -1 &&
          dto.dueEndDate != -1)
      ) {
        // _orderSaleId

        const orderSaleMainFilterPipeline = () => {
          const pipeline = [];
          pipeline.push({
            $match: {
              $expr: { $eq: ['$_id', '$$orderId'] },
            },
          });

          if (dto.searchingText != null && dto.searchingText != '') {
            pipeline.push({
              $match: {
                $or: [
                  { _uid: new RegExp(`^${dto.searchingText}$`, 'i') },
                  {
                    _referenceNumber: new RegExp(`^${dto.searchingText}$`, 'i'),
                  },
                ],
              },
            });
          }
          if (dto.shopIds != null && dto.shopIds.length != 0) {
            var newSettingsId = [];
            dto.shopIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            pipeline.push({
              $match: { _shopId: { $in: newSettingsId } },
            });
          }
          if (dto.subCategoryIds != null && dto.subCategoryIds.length != 0) {
            var newSettingsId = [];
            dto.subCategoryIds.map((mapItem) => {
              newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
            });
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.ORDER_SALES_ITEMS,
                  let: { orderId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        _status: 1,
                        $expr: { $eq: ['$_orderSaleId', '$$orderId'] },
                      },
                    },
                    {
                      $match: {
                        _subCategoryId: { $in: newSettingsId },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                      },
                    },
                  ],
                  as: 'mongoCheckSubItems',
                },
              },
              {
                $match: { mongoCheckSubItems: { $ne: [] } },
              },
            );
          }
          if (
            dto.dueStartDate != null &&
            dto.dueEndDate != null &&
            dto.dueStartDate != -1 &&
            dto.dueEndDate != -1
          ) {
            pipeline.push({
              $match: {
                _dueDate: { $lte: dto.dueEndDate, $gte: dto.dueStartDate },
              },
            });
          }

          pipeline.push({
            $project: {
              _id: 1,
            },
          });

          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_MAIN,
              let: { orderId: '$_orderSaleId' },
              pipeline: orderSaleMainFilterPipeline(),
              as: 'mongoCheckOrderSale',
            },
          },
          {
            $match: { mongoCheckOrderSale: { $ne: [] } },
          },
        );
      }
      arrayAggregation.push({
        $match: {
          _status: 1,
        },
      });
      console.log('array dto   ' + JSON.stringify(dto));
      console.log('array aggregation   ' + JSON.stringify(arrayAggregation));
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
            $sort: { _dueDate: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      arrayAggregation.push(
        new ModelWeightResponseFormat().orderSaleSetProcessTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      const isorderSaleSetSubProcess = dto.screenType.includes(101);
      if (isorderSaleSetSubProcess) {
        const orderSaleSetSubProcessPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: {
                  $eq: ['$_orderSaleSetProcessId', '$$orderSaleSetProcessId'],
                },
              },
            },
            new ModelWeightResponseFormat().orderSaleSetSubProcessTableResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );

          const isorderSaleSetSubProcessSubprocessMaster =
            dto.screenType.includes(103);
          if (isorderSaleSetSubProcessSubprocessMaster) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.SUB_PROCESS_MASTER,
                  let: { subProcessId: '$_subProcessId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$subProcessId'] },
                      },
                    },

                    new ModelWeightResponseFormat().subProcessMasterTableResponseFormat(
                      1030,
                      dto.responseFormat,
                    ),
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
            );
          }
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_SET_SUB_PROCESSES,
            let: { orderSaleSetProcessId: '$_id' },
            pipeline: orderSaleSetSubProcessPipeline(),
            as: 'subProcessMasterLinkings',
          },
        });
      }

      const isorderSaleProcessMaster = dto.screenType.includes(102);
      if (isorderSaleProcessMaster) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.PROCESS_MASTER,
              let: { processId: '$_processId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$processId'],
                    },
                  },
                },

                new ModelWeightResponseFormat().processMasterTableResponseFormat(
                  1020,
                  dto.responseFormat,
                ),
              ],
              as: 'pocessMastedDetails',
            },
          },
          {
            $unwind: {
              path: '$pocessMastedDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      const isorderSaleMainPopulate = dto.screenType.includes(100);
      if (isorderSaleMainPopulate) {
        const orderSaleMainPipeline = () => {
          const pipeline = [];
          pipeline.push(
            { $match: { $expr: { $eq: ['$_id', '$$orderSaleId'] } } },
            new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
              1000,
              dto.responseFormat,
            ),
          );

          const isorderSaleMainShopPopulate = dto.screenType.includes(104);
          if (isorderSaleMainShopPopulate) {
            const orderSaleMainShopPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$shopId'] },
                  },
                },
                new ModelWeightResponseFormat().shopTableResponseFormat(
                  1040,
                  dto.responseFormat,
                ),
              );

              const isorderSaleMainShopDocumentsPopulate =
                dto.screenType.includes(109);
              if (isorderSaleMainShopDocumentsPopulate) {
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
                          1090,
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

              const isorderSaleMainShopOHPopulate =
                dto.screenType.includes(111);
              if (isorderSaleMainShopOHPopulate) {
                const isorderSaleMainShopOHPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$ohId'] },
                      },
                    },

                    new ModelWeightResponseFormat().userTableResponseFormat(
                      1110,
                      dto.responseFormat,
                    ),
                  );

                  const isorderSaleMainShopOHPopulate =
                    dto.screenType.includes(112);
                  if (isorderSaleMainShopOHPopulate) {
                    pipeline.push(
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

                            new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                              1120,
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

                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.USER,
                      let: { ohId: '$_orderHeadId' },
                      pipeline: isorderSaleMainShopOHPipeline(),
                      as: 'orderHeadDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$orderHeadDetails',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                );
              }

              const isorderSaleMainShopRMPopulate =
                dto.screenType.includes(113);
              if (isorderSaleMainShopRMPopulate) {
                const isorderSaleMainShopRMPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$rmId'] },
                      },
                    },

                    new ModelWeightResponseFormat().userTableResponseFormat(
                      1130,
                      dto.responseFormat,
                    ),
                  );

                  const isorderSaleMainShopRMPopulate =
                    dto.screenType.includes(114);
                  if (isorderSaleMainShopRMPopulate) {
                    pipeline.push(
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

                            new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                              1140,
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

                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.USER,
                      let: { rmId: '$_relationshipManagerId' },
                      pipeline: isorderSaleMainShopRMPipeline(),
                      as: 'relationshipManagerDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$relationshipManagerDetails',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                );
              }

              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.SHOPS,
                  let: { shopId: '$_shopId' },
                  pipeline: orderSaleMainShopPipeline(),
                  as: 'shopDetails',
                },
              },
              {
                $unwind: {
                  path: '$shopDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          const isorderSaleItems = dto.screenType.includes(107);
          if (isorderSaleItems) {
            const orderSaleItemsPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_orderSaleId', '$$orderSaleId'] },
                  },
                },
                new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
                  1070,
                  dto.responseFormat,
                ),
              );

              const isorderSaleItemsSubCategory = dto.screenType.includes(108);
              if (isorderSaleItemsSubCategory) {
                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.SUB_CATEGORIES,
                      let: { subCategoryId: '$_subCategoryId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: { $eq: ['$_id', '$$subCategoryId'] },
                          },
                        },
                        new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                          1080,
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
              const isorderSaleItemsDesign = dto.screenType.includes(121);
              if (isorderSaleItemsDesign) {
                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.PRODUCTS,
                      let: { designId: '$_designId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: { $eq: ['$_id', '$$designId'] },
                          },
                        },
                        new ModelWeightResponseFormat().productTableResponseFormat(
                          1210,
                          dto.responseFormat,
                        ),
                      ],
                      as: 'designDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$designDetails',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                );
              }

              const isorderSaleItemdocuments = dto.screenType.includes(119);

              if (isorderSaleItemdocuments) {
                const orderSaleItemDocumentsPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        _status: 1,
                        $expr: {
                          $eq: ['$_orderSaleItemId', '$$orderSaleItemId'],
                        },
                      },
                    },
                    new ModelWeightResponseFormat().orderSaleItemDocumentsTableResponseFormat(
                      1190,
                      dto.responseFormat,
                    ),
                  );

                  const isorderSaledocumentsGlobalGallery =
                    dto.screenType.includes(120);

                  if (isorderSaledocumentsGlobalGallery) {
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
                              1200,
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
                    from: ModelNames.ORDER_SALE_ITEM_DOCUMENTS,
                    let: { orderSaleItemId: '$_id' },
                    pipeline: orderSaleItemDocumentsPipeline(),
                    as: 'orderSaleItemDocumentList',
                  },
                });
              }

              return pipeline;
            };

            pipeline.push({
              $lookup: {
                from: ModelNames.ORDER_SALES_ITEMS,
                let: { orderSaleId: '$_id' },
                pipeline: orderSaleItemsPipeline(),
                as: 'orderSaleItemsList',
              },
            });
          }

          const isorderSaleDocuments = dto.screenType.includes(105);
          if (isorderSaleDocuments) {
            const orderSaleDocumentsPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_orderSaleId', '$$orderSaleMainId'] },
                  },
                },
                new ModelWeightResponseFormat().orderSaleDocumentsTableResponseFormat(
                  1050,
                  dto.responseFormat,
                ),
              );

              const isorderSaledocumentsGlobalGallery =
                dto.screenType.includes(106);
              if (isorderSaledocumentsGlobalGallery) {
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
                          1060,
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
                from: ModelNames.ORDER_SALES_DOCUMENTS,
                let: { orderSaleMainId: '$_id' },
                pipeline: orderSaleDocumentsPipeline(),
                as: 'orderSaleDocumentsList',
              },
            });
          }

          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_MAIN,
              let: { orderSaleId: '$_orderSaleId' },
              pipeline: orderSaleMainPipeline(),
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

      const orderSaleCompletedSetprocessList = dto.screenType.includes(115);
      if (orderSaleCompletedSetprocessList) {
        const orderSaleCompletedSetprocessPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_orderSaleId', '$$orderSaleMainId'] },
              },
            },

            new ModelWeightResponseFormat().orderSaleSetProcessTableResponseFormat(
              1150,
              dto.responseFormat,
            ),
          );
          if (dto.screenType.includes(116)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.PROCESS_MASTER,
                  let: { processId: '$_processId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$processId'] } },
                    },

                    new ModelWeightResponseFormat().processMasterTableResponseFormat(
                      1160,
                      dto.responseFormat,
                    ),
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
            );
          }

          const isorderSaleDocuments = dto.screenType.includes(117);
          if (isorderSaleDocuments) {
            const orderSaleDocumentsPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_setProcessId', '$$setProcessId'] },
                  },
                },
                new ModelWeightResponseFormat().orderSaleSetprocessDocumentsTableResponseFormat(
                  1170,
                  dto.responseFormat,
                ),
              );

              const isorderSaledocumentsGlobalGallery =
                dto.screenType.includes(118);
              if (isorderSaledocumentsGlobalGallery) {
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
                          1180,
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
                from: ModelNames.ORDER_SALE_SET_PROCESSES_DOCUMENTS,
                let: { setProcessId: '$_id' },
                pipeline: orderSaleDocumentsPipeline(),
                as: 'setProcessDocumentsList',
              },
            });
            pipeline.push({ $match: { setProcessDocumentsList: { $ne: [] } } });
          }

          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_SET_PROCESSES,
            let: { orderSaleMainId: '$_orderSaleId' },
            pipeline: orderSaleCompletedSetprocessPipeline(),
            as: 'completedSetprocessList',
          },
        });
      }

      var result = await this.orderSaleSetProcessModel
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

  async orderSaleHistories(dto: OrderSaleHistoryListDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.orderSaleIds.length > 0) {
        var newSettingsId = [];
        dto.orderSaleIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _orderSaleId: { $in: newSettingsId } },
        });
      }

      if (dto.userIds.length > 0) {
        var newSettingsId = [];
        dto.userIds.map((mapItem) => {
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
      if (dto.types.length > 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.types } },
        });
      }
      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      arrayAggregation.push(
        {
          $lookup: {
            from: ModelNames.USER,
            let: { userId: '$_userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              {
                $project: new ModelWeight().userTableLight(),
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
                    {
                      $project: new ModelWeight().globalGalleryTableLight(),
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
            from: ModelNames.USER,
            let: { userId: '$_createdUserId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              {
                $project: new ModelWeight().userTableLight(),
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

                    {
                      $project: new ModelWeight().globalGalleryTableLight(),
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
            as: 'createdUserDetails',
          },
        },
        {
          $unwind: {
            path: '$createdUserDetails',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: ModelNames.SHOPS,
            let: { shopId: '$_shopId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$shopId'] },
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
                    {
                      $project: {
                        _name: 1,
                        _docType: 1,
                        _type: 1,
                        _uid: 1,
                        _url: 1,
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
              {
                $project: {
                  _name: 1,
                  _uid: 1,
                  _globalGalleryId: 1,
                  globalGalleryDetails: {
                    _name: 1,
                    _docType: 1,
                    _type: 1,
                    _uid: 1,
                    _url: 1,
                  },
                },
              },
            ],
            as: 'shopDetails',
          },
        },
        {
          $unwind: {
            path: '$shopDetails',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: ModelNames.ORDER_SALES_ITEMS,
            let: { orderSaleItemId: '$_orderSaleItemId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$orderSaleItemId'] },
                },
              },
            ],
            as: 'orderSaleItemDetails',
          },
        },
        {
          $unwind: {
            path: '$orderSaleItemDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: ModelNames.DELIVERY_PROVIDER,
            let: { deliveryProviderId: '$_deliveryProviderId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$deliveryProviderId'] },
                },
              },
              {
                $project: new ModelWeight().deliveryProviderTableLight(),
              },
            ],
            as: 'deliveryProviderDetails',
          },
        },
        {
          $unwind: {
            path: '$deliveryProviderDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: ModelNames.DELIVERY_COUNTERS,
            let: { deliveryCounterId: '$_deliveryCounterId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$deliveryCounterId'] },
                },
              },
              {
                $project: new ModelWeight().deliveryCounterTableLight(),
              },
            ],
            as: 'deliveryCounterDetails',
          },
        },
        {
          $unwind: {
            path: '$deliveryCounterDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
      );
      var result = await this.orderSaleHistoriesModel
        .aggregate(arrayAggregation)
        .session(transactionSession);

      const responseJSON = {
        message: 'success',
        data: { list: result },
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

  async editOrderSaleGeneralRemarks(
    dto: EditOrderSaleGeneralRemarkDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.orderSaleMainModel.updateMany(
        {
          _id: { $in: dto.orderSaleIds },
        },
        {
          $set: {
            _generalRemark: dto.generalRemark,
          },
        },
        { new: true, session: transactionSession },
      );

      var arraySalesOrderHistories = [];
      dto.orderSaleIds.map((mapItem) => {
        var objOrderHistory = {
          _orderSaleId: mapItem,
          _userId: null,
          _orderSaleItemId: null,
          _type: 104,
          _shopId: null,
          _description: dto.generalRemark,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        };

        arraySalesOrderHistories.push(objOrderHistory);
      });
      await this.orderSaleHistoriesModel.insertMany(arraySalesOrderHistories, {
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

  async getOrderIdFromQrBarCode(
    dto: OrderSalesGetOrderIdFromQrBarcodeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultItems = [];

      var result = await this.orderSaleMainModel.aggregate([
        {
          $match: {
            $or: [
              { _uid: new RegExp(`^${dto.value}$`, 'i') },
              { _referenceNumber: new RegExp(`^${dto.value}$`, 'i') },
            ],
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]);
      if (result.length == 0) {
        result = await this.productModel.aggregate([
          {
            $match: {
              $or: [{ _barcode: new RegExp(`^${dto.value}$`, 'i') }],
            },
          },
          {
            $project: {
              _orderItemId: 1,
            },
          },
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderSaleItemsId: '$_orderItemId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$orderSaleItemsId'] },
                  },
                },
                {
                  $project: {
                    _orderSaleId: 1,
                  },
                },
              ],
              as: 'orderSaleItemsDetails',
            },
          },
          {
            $unwind: {
              path: '$orderSaleItemsDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);
        result.forEach((eachitem) => {
          resultItems.push(eachitem.orderSaleItemsDetails._orderSaleId);
        });
      } else {
        result.forEach((eachitem) => {
          resultItems.push(eachitem._id);
        });
      }

      const responseJSON = { message: 'success', data: { list: resultItems } };
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

  async getOrderDetailsFromQrBarCode(
    dto: OrderSalesGetOrderDetailsFromQrBarcodeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultItems = [];
      var orderSaleIds = [];
      var result = await this.orderSaleMainModel.aggregate([
        {
          $match: {
            $or: [
              { _uid: new RegExp(`^${dto.value}$`, 'i') },
              { _referenceNumber: new RegExp(`^${dto.value}$`, 'i') },
            ],
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]);
      if (result.length == 0) {
        result = await this.productModel.aggregate([
          {
            $match: {
              $or: [{ _barcode: new RegExp(`^${dto.value}$`, 'i') }],
            },
          },
          {
            $project: {
              _orderItemId: 1,
            },
          },
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderSaleItemsId: '$_orderItemId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$orderSaleItemsId'] },
                  },
                },
                {
                  $project: {
                    _orderSaleId: 1,
                  },
                },
              ],
              as: 'orderSaleItemsDetails',
            },
          },
          {
            $unwind: {
              path: '$orderSaleItemsDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);
        result.forEach((eachitem) => {
          orderSaleIds.push(
            new mongoose.Types.ObjectId(
              eachitem.orderSaleItemsDetails._orderSaleId,
            ),
          );
        });
      } else {
        result.forEach((eachitem) => {
          orderSaleIds.push(new mongoose.Types.ObjectId(eachitem._id));
        });
      }

      var arrayAggregation = [];
      arrayAggregation.push({
        $match: {
          _id: { $in: orderSaleIds },
        },
      });

      arrayAggregation.push(
        new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      const isorderSaledocuments = dto.screenType.includes(101);

      if (isorderSaledocuments) {
        const orderSaleDocumentsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_orderSaleId', '$$orderSaleIdId'] },
              },
            },
            new ModelWeightResponseFormat().orderSaleDocumentsTableResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );

          const isorderSaledocumentsGlobalGallery =
            dto.screenType.includes(102);

          if (isorderSaledocumentsGlobalGallery) {
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

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALES_DOCUMENTS,
            let: { orderSaleIdId: '$_id' },
            pipeline: orderSaleDocumentsPipeline(),
            as: 'orderSaleDocumentList',
          },
        });
      }

      const isorderSaleShopDetails = dto.screenType.includes(103);

      if (isorderSaleShopDetails) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$shopId'] } },
                },

                new ModelWeightResponseFormat().shopTableResponseFormat(
                  1030,
                  dto.responseFormat,
                ),
              ],
              as: 'shopDetails',
            },
          },
          {
            $unwind: {
              path: '$shopDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      const orderSaleSetProcess = dto.screenType.includes(105);

      if (orderSaleSetProcess) {
        const orderSaleOrderSetProcessPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_orderSaleId', '$$orderId'] },
              },
            },

            new ModelWeightResponseFormat().orderSaleSetProcessTableResponseFormat(
              1050,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(106)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.PROCESS_MASTER,
                  let: { processId: '$_processId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$processId'] } },
                    },

                    new ModelWeightResponseFormat().processMasterTableResponseFormat(
                      1060,
                      dto.responseFormat,
                    ),
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
            );
          }
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_SET_PROCESSES,
            let: { orderId: '$_id' },
            pipeline: orderSaleOrderSetProcessPipeline(),
            as: 'setProcessList',
          },
        });
      }

      const isorderSaleItems = dto.screenType.includes(100);

      if (isorderSaleItems) {
        const orderSaleOrdersaleItems = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: { $expr: { $eq: ['$_orderSaleId', '$$orderId'] } },
            },

            new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
              1000,
              dto.responseFormat,
            ),
          );
          if (dto.screenType.includes(104)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.PRODUCTS,
                  let: { orderItemId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        _status: 1,
                        $expr: { $eq: ['$_orderItemId', '$$orderItemId'] },
                      },
                    },

                    new ModelWeightResponseFormat().productTableResponseFormat(
                      1040,
                      dto.responseFormat,
                    ),
                  ],
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
          if (dto.screenType.includes(107)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.SUB_CATEGORIES,
                  let: { subCategoryId: '$_subCategoryId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$subCategoryId'] },
                      },
                    },

                    new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                      1070,
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

          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALES_ITEMS,
            let: { orderId: '$_id' },
            pipeline: orderSaleOrdersaleItems(),
            as: 'ordersaleItemsList',
          },
        });
      }

      var resultOrderSaleResponse = await this.orderSaleMainModel.aggregate(
        arrayAggregation,
      );

      const responseJSON = {
        message: 'success',
        data: { list: resultOrderSaleResponse },
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
  async globalSearch(dto: GlobalSearchDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var orderSaleIds = [];
      if (dto.type == 0) {
        var resultOrderSale = await this.orderSaleMainModel.aggregate([
          {
            $match: {
              $or: [
                { _uid: new RegExp(dto.mainValue, 'i') },
                { _referenceNumber: new RegExp(dto.mainValue, 'i') },
              ],
            },
          },
          { $project: { _id: 1 } },
        ]);

        resultOrderSale.forEach((element) => {
          orderSaleIds.push(new mongoose.Types.ObjectId(element._id));
        });
      } else if (dto.type == 1) {
        var shopIds = [];
        var resultShops = await this.shopsModel.aggregate([
          {
            $match: {
              $or: [
                { _uid: new RegExp(dto.mainValue, 'i') },
                { _name: new RegExp(dto.mainValue, 'i') },
                { _displayName: new RegExp(dto.mainValue, 'i') },
                { _address: new RegExp(dto.mainValue, 'i') },
                { _panCardNumber: new RegExp(dto.mainValue, 'i') },
                { _gstNumber: new RegExp(dto.mainValue, 'i') },
              ],
            },
          },
          { $project: { _id: 1 } },
        ]);

        resultShops.forEach((element) => {
          shopIds.push(new mongoose.Types.ObjectId(element._id));
        });

        var resultOrders = await this.orderSaleMainModel.aggregate([
          {
            $match: {
              _shopId: { $in: shopIds },
            },
          },
        ]);

        resultOrders.forEach((element) => {
          orderSaleIds.push(new mongoose.Types.ObjectId(element._id));
        });
      } else if (dto.type == 2) {
        //invoice
        var resultInvoice = await this.invoiceModel.aggregate([
          {
            $match: {
              $or: [
                { _uid: new RegExp(dto.mainValue, 'i') },
                { _description: new RegExp(dto.mainValue, 'i') },
              ],
            },
          },
          { $project: { _id: 1 } },
          {
            $lookup: {
              from: ModelNames.INVOICE_ITEMS,
              let: { invoiceId: '$_id' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_invoiceId', '$$invoiceId'] } },
                },

                { $project: { _orderSaleItemId: 1 } },
                {
                  $lookup: {
                    from: ModelNames.ORDER_SALES_ITEMS,
                    let: { ordersaleItemId: '$_orderSaleItemId' },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ['$_id', '$$ordersaleItemId'] },
                        },
                      },

                      { $project: { _orderSaleId: 1 } },
                    ],
                    as: 'orderItemsDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$orderItemsDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: 'invoiceItemsList',
            },
          },
        ]);

        resultInvoice.forEach((element) => {
          element.invoiceItemsList.forEach((elementChild) => {
            orderSaleIds.push(
              new mongoose.Types.ObjectId(
                elementChild.orderItemsDetails._orderSaleId,
              ),
            );
          });
        });
      } else if (dto.type == 3) {
        //oh

        var shopIds = [];
        var resultUser = await this.userModel.aggregate([
          {
            $match: {
              $or: [
                { _name: new RegExp(dto.mainValue, 'i') },
                { _email: new RegExp(dto.mainValue, 'i') },
                { _mobile: new RegExp(dto.mainValue, 'i') },
              ],
            },
          },
          { $project: { _id: 1, _shopId: 1 } },
        ]);

        resultUser.forEach((element) => {
          shopIds.push(new mongoose.Types.ObjectId(element._id));
        });

        var resultOrders = await this.orderSaleMainModel.aggregate([
          {
            $match: {
              _orderHeadId: { $in: shopIds },
            },
          },
        ]);

        resultOrders.forEach((element) => {
          orderSaleIds.push(new mongoose.Types.ObjectId(element._id));
        });
      } else if (dto.type == 4) {
        //shop phone

        var shopIds = [];
        var resultUser = await this.userModel.aggregate([
          {
            $match: {
              $or: [
                { _name: new RegExp(dto.mainValue, 'i') },
                { _email: new RegExp(dto.mainValue, 'i') },
                { _mobile: new RegExp(dto.mainValue, 'i') },
              ],
              _shopId: { $ne: null },
            },
          },
          { $project: { _id: 1, _shopId: 1 } },
        ]);

        resultUser.forEach((element) => {
          shopIds.push(new mongoose.Types.ObjectId(element._shopId));
        });

        var resultOrders = await this.orderSaleMainModel.aggregate([
          {
            $match: {
              _shopId: { $in: shopIds },
            },
          },
        ]);

        resultOrders.forEach((element) => {
          orderSaleIds.push(new mongoose.Types.ObjectId(element._id));
        });
      } else if (dto.type == 5) {
        //product phone

        var shopIds = [];
        var resultOrders = await this.productModel.aggregate([
          {
            $match: {
              _netWeight: { $lte: dto.endValue, $gte: dto.startValue },
            },
          },
          { $project: { _id: 1, _orderItemId: 1 } },

          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { ordersaleItemId: '$_orderItemId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$ordersaleItemId'] } },
                },

                { $project: { _orderSaleId: 1 } },
              ],
              as: 'orderItemsDetails',
            },
          },
          {
            $unwind: {
              path: '$orderItemsDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);

        resultOrders.forEach((element) => {
          orderSaleIds.push(
            new mongoose.Types.ObjectId(element.orderItemsDetails._orderSaleId),
          );
        });
      }

      var arrayAggregation = [];
      arrayAggregation.push({
        $match: {
          _id: { $in: orderSaleIds },
        },
      });

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
            $sort: { _dueDate: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      arrayAggregation.push(
        new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      const isorderSaledocuments = dto.screenType.includes(101);

      if (isorderSaledocuments) {
        const orderSaleDocumentsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_orderSaleId', '$$orderSaleIdId'] },
              },
            },
            new ModelWeightResponseFormat().orderSaleDocumentsTableResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );

          const isorderSaledocumentsGlobalGallery =
            dto.screenType.includes(102);

          if (isorderSaledocumentsGlobalGallery) {
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

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALES_DOCUMENTS,
            let: { orderSaleIdId: '$_id' },
            pipeline: orderSaleDocumentsPipeline(),
            as: 'orderSaleDocumentList',
          },
        });
      }

      const isorderSaleShopDetails = dto.screenType.includes(103);

      if (isorderSaleShopDetails) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$shopId'] } },
                },

                new ModelWeightResponseFormat().shopTableResponseFormat(
                  1030,
                  dto.responseFormat,
                ),
              ],
              as: 'shopDetails',
            },
          },
          {
            $unwind: {
              path: '$shopDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      const orderSaleSetProcess = dto.screenType.includes(105);

      if (orderSaleSetProcess) {
        const orderSaleOrderSetProcessPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_orderSaleId', '$$orderId'] },
              },
            },

            new ModelWeightResponseFormat().orderSaleSetProcessTableResponseFormat(
              1050,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(106)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.PROCESS_MASTER,
                  let: { processId: '$_processId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$processId'] } },
                    },

                    new ModelWeightResponseFormat().processMasterTableResponseFormat(
                      1060,
                      dto.responseFormat,
                    ),
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
            );
          }
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_SET_PROCESSES,
            let: { orderId: '$_id' },
            pipeline: orderSaleOrderSetProcessPipeline(),
            as: 'setProcessList',
          },
        });
      }

      const isorderSaleItems = dto.screenType.includes(100);

      if (isorderSaleItems) {
        const orderSaleOrdersaleItems = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: { $expr: { $eq: ['$_orderSaleId', '$$orderId'] } },
            },

            new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
              1000,
              dto.responseFormat,
            ),
          );
          if (dto.screenType.includes(104)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.PRODUCTS,
                  let: { orderItemId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_orderItemId', '$$orderItemId'] },
                      },
                    },

                    new ModelWeightResponseFormat().productTableResponseFormat(
                      1040,
                      dto.responseFormat,
                    ),
                  ],
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
          if (dto.screenType.includes(107)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.SUB_CATEGORIES,
                  let: { subCategoryId: '$_subCategoryId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$subCategoryId'] },
                      },
                    },

                    new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                      1070,
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

          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALES_ITEMS,
            let: { orderId: '$_id' },
            pipeline: orderSaleOrdersaleItems(),
            as: 'ordersaleItemsList',
          },
        });
      }

      var resultOrderSaleResponse = await this.orderSaleMainModel.aggregate(
        arrayAggregation,
      );

      const responseJSON = {
        message: 'success',
        data: { list: resultOrderSaleResponse },
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

  async getWorkCount(dto: GetWorkCountDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultOh = [];
      var resultWorker = [];

      if (dto.screenType.includes(100)) {
        //worker

        var aggregateArray = [];
        aggregateArray.push({ $match: { _code: 1003, _status: 1 } });

        const employeeMongoCheckPipeline = () => {
          const pipeline = [];
          pipeline.push({
            $match: {
              $expr: { $eq: ['$_departmentId', '$$departmentId'] },
            },
          });
          pipeline.push({
            $project: {
              _id: 1,
              _name: 1,
              _code: 1,
            },
          });
          const userMongoCheckPipeline = () => {
            const pipeline = [];
            pipeline.push({
              $match: {
                _status: 1,
                $expr: { $eq: ['$_employeeId', '$$employeeId'] },
              },
            });
            if (dto.workerIds.length > 0) {
              var newSettingsId = [];
              dto.workerIds.map((mapItem) => {
                newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
              });
              pipeline.push({ $match: { _id: { $in: newSettingsId } } });
            }

            const setProcessAssignedMongoCheckPipeline = () => {
              const pipeline = [];
              pipeline.push({
                $match: {
                  $expr: { $eq: ['$_userId', '$$userId'] },
                  _status: 1,
                },
              });
              pipeline.push({
                $match: {
                  _workCompletedTime: -1,
                  _orderStatus: { $nin: [5, 6] },
                },
              });
              if (
                dto.setProcessAssignedStartDate != -1 &&
                dto.setProcessAssignedEndDate != -1
              ) {
                pipeline.push({
                  $match: {
                    _workAssignedTime: {
                      $lte: dto.setProcessAssignedEndDate,
                      $gte: dto.setProcessAssignedStartDate,
                    },
                  },
                });
              }

              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.ORDER_SALES_MAIN,
                    let: { osId: '$_orderSaleId' },
                    pipeline: [
                      {
                        $match: {
                          _workStatus: { $nin: [2, 27] },
                          $expr: { $eq: ['$_id', '$$osId'] },
                        },
                      },

                      { $project: { _id: 1 } },
                    ],
                    as: 'orderDetails',
                  },
                },
                {
                  $unwind: { path: '$orderDetails' },
                },
              );

              return pipeline;
            };
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } },
                    },
                    {
                      $project: {
                        _url: 1,
                      },
                    },
                  ],
                  as: 'globalGallery',
                },
              },
              {
                $unwind: {
                  path: '$globalGallery',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.USER_ATTENDANCES,
                  let: { userId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        _status: 1,
                        $expr: { $eq: ['$_userId', '$$userId'] },
                      },
                    },
                    { $sort: { _id: -1 } },
                    { $limit: 1 },
                  ],
                  as: 'attendanceDetails',
                },
              },
              {
                $unwind: {
                  path: '$attendanceDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
            pipeline.push({
              $lookup: {
                from: ModelNames.ORDER_SALE_SET_PROCESSES,
                let: { userId: '$_id' },
                pipeline: setProcessAssignedMongoCheckPipeline(),
                as: 'setProcessAssignedList',
              },
            });

            const setProcessFinishedMongoCheckPipeline = () => {
              const pipeline = [];
              pipeline.push({
                $match: {
                  $expr: { $eq: ['$_userId', '$$userId'] },
                  _status: 1,
                },
              });
              if (
                dto.setProcessFinishEndDate != -1 &&
                dto.setProcessFinishStartDate != -1
              ) {
                pipeline.push({
                  $match: {
                    _workCompletedTime: {
                      $lte: dto.setProcessFinishEndDate,
                      $gte: dto.setProcessFinishStartDate,
                    },
                  },
                });
              }
              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.ORDER_SALES_MAIN,
                    let: { osId: '$_orderSaleId' },
                    pipeline: [
                      {
                        $match: {
                          _workStatus: { $nin: [2, 27] },
                          $expr: { $eq: ['$_id', '$$osId'] },
                        },
                      },

                      { $project: { _id: 1 } },
                    ],
                    as: 'orderDetails',
                  },
                },
                {
                  $unwind: { path: '$orderDetails' },
                },
              );
              return pipeline;
            };
            pipeline.push({
              $lookup: {
                from: ModelNames.ORDER_SALE_SET_PROCESSES,
                let: { userId: '$_id' },
                pipeline: setProcessFinishedMongoCheckPipeline(),
                as: 'setProcessFinishedList',
              },
            });

            pipeline.push({
              $project: {
                _id: 1,
                _name: 1,
                globalGallery: 1,
                attendanceDetails: 1,
                pending: { $size: '$setProcessAssignedList' },
                completed: { $size: '$setProcessFinishedList' },
              },
            });
            return pipeline;
          };

          pipeline.push(
            {
              $lookup: {
                from: ModelNames.USER,
                let: { employeeId: '$_id' },
                pipeline: userMongoCheckPipeline(),
                as: 'userDetails',
              },
            },
            {
              $unwind: {
                path: '$userDetails',
              },
            },
          );

          return pipeline;
        };

        aggregateArray.push({
          $lookup: {
            from: ModelNames.EMPLOYEES,
            let: { departmentId: '$_id' },
            pipeline: employeeMongoCheckPipeline(),
            as: 'employeeList',
          },
        });
        aggregateArray.push({
          $project: {
            _id: 1,
            _name: 1,
            _code: 1,
            employeeList: 1,
          },
        });
        resultWorker = await this.departmentModel.aggregate(aggregateArray);
      }

      if (dto.screenType.includes(101)) {
        //oh
        var aggregateArray = [];
        aggregateArray.push({ $match: { _code: 1000, _status: 1 } });

        const employeeMongoCheckPipeline = () => {
          const pipeline = [];
          pipeline.push({
            $match: {
              $expr: { $eq: ['$_departmentId', '$$departmentId'] },
            },
          });
          pipeline.push({
            $project: {
              _id: 1,
              _name: 1,
              _code: 1,
            },
          });
          const userMongoCheckPipeline = () => {
            const pipeline = [];
            pipeline.push({
              $match: {
                _status: 1,
                $expr: { $eq: ['$_employeeId', '$$employeeId'] },
              },
            });
            if (dto.ohIds.length > 0) {
              var newSettingsId = [];
              dto.ohIds.map((mapItem) => {
                newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
              });
              pipeline.push({ $match: { _id: { $in: newSettingsId } } });
            }

            const orderSaleProductNotGeneratedMongoCheckPipeline = () => {
              const pipeline = [];
              pipeline.push({
                $match: {
                  $expr: { $eq: ['$_orderHeadId', '$$userId'] },
                  _status: 1,
                  _isProductGenerated: 0,
                },
              });

              pipeline.push({
                $match: {
                  _workStatus: { $nin: [2, 27] },
                },
              });

              if (
                dto.pendingOrderCreatedEndDate != -1 &&
                dto.pendingOrderCreatedStartDate != -1
              ) {
                pipeline.push({
                  $match: {
                    _createdAt: {
                      $lte: dto.pendingOrderCreatedEndDate,
                      $gte: dto.pendingOrderCreatedStartDate,
                    },
                  },
                });
              }

              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } },
                    },
                    {
                      $project: {
                        _url: 1,
                      },
                    },
                  ],
                  as: 'globalGallery',
                },
              },
              {
                $unwind: {
                  path: '$globalGallery',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.USER_ATTENDANCES,
                  let: { userId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        _status: 1,
                        $expr: { $eq: ['$_userId', '$$userId'] },
                      },
                    },
                    { $sort: { _id: -1 } },
                    { $limit: 1 },
                  ],
                  as: 'attendanceDetails',
                },
              },
              {
                $unwind: {
                  path: '$attendanceDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );

            pipeline.push({
              $lookup: {
                from: ModelNames.ORDER_SALES_MAIN,
                let: { userId: '$_id' },
                pipeline: orderSaleProductNotGeneratedMongoCheckPipeline(),
                as: 'productNotGeneratedList',
              },
            });

            const orderSaleProductGeneratedMongoCheckPipeline = () => {
              const pipeline = [];
              pipeline.push({
                $match: {
                  $expr: { $eq: ['$_orderHeadId', '$$userId'] },
                  _status: 1,
                  _isProductGenerated: 1,
                },
              });
              pipeline.push({
                $match: {
                  _workStatus: { $nin: [2, 27] },
                },
              });
              if (
                dto.completedOrderCreatedEndDate != -1 &&
                dto.completedOrderCreatedStartDate != -1
              ) {
                pipeline.push({
                  $match: {
                    _createdAt: {
                      $lte: dto.completedOrderCreatedEndDate,
                      $gte: dto.completedOrderCreatedStartDate,
                    },
                  },
                });
              }
              if (
                dto.completedOrderProductCreatedEndDate != -1 &&
                dto.completedOrderProductCreatedStartDate != -1
              ) {
                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.ORDER_SALES_ITEMS,
                      let: { osId: '$_id' },
                      pipeline: [
                        {
                          $match: {
                            _status: 1,
                            $expr: { $eq: ['$_orderSaleId', '$$osId'] },
                          },
                        },
                        {
                          $project: {
                            _id: 1,
                          },
                        },
                        {
                          $lookup: {
                            from: ModelNames.PRODUCTS,
                            let: { osItemId: '$_id' },
                            pipeline: [
                              {
                                $match: {
                                  _status: 1,
                                  $expr: {
                                    $eq: ['$_orderItemId', '$$osItemId'],
                                  },

                                  _createdAt: {
                                    $lte: dto.completedOrderProductCreatedEndDate,
                                    $gte: dto.completedOrderProductCreatedStartDate,
                                  },
                                },
                              },

                              {
                                $project: {
                                  _id: 1,
                                },
                              },
                            ],
                            as: 'osItemProduct',
                          },
                        },

                        {
                          $match: { osItemProduct: { $ne: [] } },
                        },
                      ],
                      as: 'orderSaleItems',
                    },
                  },

                  {
                    $match: { orderSaleItems: { $ne: [] } },
                  },
                );
              }

              return pipeline;
            };
            pipeline.push({
              $lookup: {
                from: ModelNames.ORDER_SALES_MAIN,
                let: { userId: '$_id' },
                pipeline: orderSaleProductGeneratedMongoCheckPipeline(),
                as: 'productGeneratedList',
              },
            });

            pipeline.push({
              $project: {
                _id: 1,
                _name: 1,
                attendanceDetails: 1,
                globalGallery: 1,
                completed: { $size: '$productGeneratedList' },
                pending: { $size: '$productNotGeneratedList' },
              },
            });
            return pipeline;
          };

          pipeline.push(
            {
              $lookup: {
                from: ModelNames.USER,
                let: { employeeId: '$_id' },
                pipeline: userMongoCheckPipeline(),
                as: 'userDetails',
              },
            },
            {
              $unwind: {
                path: '$userDetails',
              },
            },
          );

          return pipeline;
        };

        aggregateArray.push(
          {
            $lookup: {
              from: ModelNames.EMPLOYEES,
              let: { departmentId: '$_id' },
              pipeline: employeeMongoCheckPipeline(),
              as: 'employeeList',
            },
          },
          // {
          //   $unwind: {
          //     path: '$employeeList',
          //   },
          // },
        );
        aggregateArray.push({
          $project: {
            _id: 1,
            _name: 1,
            _code: 1,
            employeeList: 1,
          },
        });
        resultOh = await this.departmentModel.aggregate(aggregateArray);
      }

      const responseJSON = {
        message: 'success',
        data: {
          list: [
            ...(resultOh.length != 0 ? [...resultOh] : []),
            ...(resultWorker.length != 0 ? [...resultWorker] : []),
          ],
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
  async reworkSetprocess(dto: OrderSalesReworkSetprocessDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      await this.orderSaleMainModel.findOneAndUpdate(
        {
          _id: dto.ordersaleId,
        },
        {
          $set: {
            _workStatus: 1,
          },
        },
        { new: true, session: transactionSession },
      );

      await this.orderSaleSetProcessModel.updateMany(
        {
          _orderSaleId: dto.ordersaleId,
        },
        {
          $set: { _status: 0 },
        },
        { new: true, session: transactionSession },
      );
      var arrayToOrderHistories = [];

      arrayToOrderHistories.push({
        _orderSaleId: dto.ordersaleId,
        _userId: null,
        _type: 110,
        _deliveryProviderId: null,
        _deliveryCounterId: null,
        _shopId: null,
        _orderSaleItemId: null,
        _description: '',
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _status: 1,
      });
      await this.orderSaleHistoriesModel.insertMany(arrayToOrderHistories, {
        session: transactionSession,
      });
      const responseJSON = {
        message: 'success',
        data: {},
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
