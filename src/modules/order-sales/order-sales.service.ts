import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { OrderSalesDocuments } from 'src/tableModels/order_sales_documents.model';
import {
  EditOrderSaleGeneralRemarkDto,
  OrderSaleHistoryListDto,
  OrderSaleListDto,
  OrderSaleReportListDto,
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

@Injectable()
export class OrderSalesService {
  constructor(
    @InjectModel(ModelNames.ROOT_CAUSES)
    private readonly rootCauseModel: Model<RootCause>,
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
      var orderSaleId = new mongoose.Types.ObjectId();

      var arrayGlobalGalleries = [];
      var arrayGlobalGalleriesDocuments = [];

      console.log('____ order sale doc ' + file.hasOwnProperty('documents'));

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
        { _tableName: ModelNames.ORDER_SALES_MAIN },
        {
          $inc: {
            _count: 1,
          },
        },
        { new: true, session: transactionSession },
      );
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

      if (shopDetails.length == 0) {
        throw new HttpException(
          'Shop not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      let uidSalesOrder = resultCounterPurchase._count;

      const newsettingsModel = new this.orderSaleMainModel({
        _id: orderSaleId,
        _shopId: dto.shopId,
        _uid:
          shopDetails[0].orderHeadDetails.employeeDetails._prefix +
          uidSalesOrder,
        _referenceNumber: dto.referenceNumber,
        _dueDate: dto.dueDate,
        _workStatus: 0,
        _rootCauseId: null,
        _deliveryType: dto.deliveryType, 
        _isInvoiceGenerated: 0,
        _isProductGenerated: 0,
        _type: dto.type,
        
      _parentOrderId:null,
        _isReWork: 0,
        _rootCause: '',
        _orderHeadId: shopDetails[0]._orderHeadId,
        _description: dto.description,
        _generalRemark: (dto.generalRemark !=null)?dto.generalRemark:"",
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

      var arraySalesItems = [];
      dto.arrayItems.forEach((eachItem, index) => {
        arraySalesItems.push({
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
          _productId: null,
          _designId: null,
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
      });
      await this.orderSaleItemsModel.insertMany(arraySalesItems, {
        session: transactionSession,
      });
      const orderSaleHistoryModel = new this.orderSaleHistoriesModel({
        _orderSaleId: result1._id,
        _userId: null,
        _orderSaleItemId: null,
        _deliveryCounterId:null,
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
        _deliveryCounterId:null,
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
          _deliveryCounterId:null,
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
          _deliveryCounterId:null,
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

      if (dto.uids!=null &&   dto.uids.length > 0) {
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
      if (dto.referenceNumbers!=null &&   dto.referenceNumbers.length > 0) {
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
            _dueDate: { $lt: dto.dueEndDate, $gt: dto.dueStartDate },
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

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      console.log('arrayAggregation  ' + JSON.stringify(arrayAggregation));
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
                  new ModelWeightResponseFormat().orderSaleSetProcessTableResponseFormat(
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
          const isorderSaleshopOrderHead = dto.screenType.includes(120);
          if (isorderSaleshopOrderHead) {
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
              const isorderSaleshopOrderHeadGlobalgallery =
                dto.screenType.includes(121);
              if (isorderSaleshopOrderHeadGlobalgallery) {
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
            pipeline.push(
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
                      pipeline:
                        isorderSalesItemsinvItemsInvDetailsPipeline(),
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
      console.log('aggregate    ' + JSON.stringify(arrayAggregation));
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
      var resultDeliveryRejectRootCause=[];
      if (dto.screenType.includes(504)) {
        var pipeline = [];
        pipeline.push({
          $match: {
            _status: 1,_type:{$in:[4]}
          },
        });
        pipeline.push(
          new ModelWeightResponseFormat().rootcauseTableResponseFormat(
            5040,
            dto.responseFormat,
          ),
        );

        resultDeliveryRejectRootCause = await this.rootCauseModel.aggregate(pipeline);
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
          appUpdates: resultGeneralsAppUpdate,
          delRejectRootCause:resultDeliveryRejectRootCause,
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
            _dueDate: { $lt: dto.dueEndDate, $gt: dto.dueStartDate },
          },
        });
      }
      if (dto.createdDateStartDate != -1 && dto.createdDateEndDate != -1) {
        arrayAggregation.push({
          $match: {
            _createdAt: {
              $lt: dto.createdDateEndDate,
              $gt: dto.createdDateStartDate,
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
        dto.deliveryAssignedStartDate != -1 ||
        dto.deliveryAssignedStartDate != -1
      ) {
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
                      _status: 1,
                      $expr: { $eq: ['$_invoiceId', '$$invoiceIdForDelTemp'] },
                    },
                  });

                  if (dto.deliveryAssignedStartDate != -1) {
                    pipeline.push({
                      $match: {
                        _createdAt: { $gte: dto.deliveryAssignedStartDate },
                      },
                    });
                  }

                  if (dto.deliveryAssignedStartDate != -1) {
                    pipeline.push({
                      $match: {
                        _createdAt: { $gte: dto.deliveryAssignedStartDate },
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
                        $gt: dto.invoiceDateStartDate,
                        $lt: dto.invoiceDateEndDate,
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
        dto.orderSetProcessWorkerIds.length != 0 &&
        dto.orderSetProcessOrderStatus.length != 0
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

          pipeline.push({
            $match: {
              _userId: { $in: mongoWorkerIdsArray },

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
          arrayAggregation.push({ $sort: { _status: dto.sortOrder } });
          break;
        case 2:
          arrayAggregation.push({ $sort: { _dueDate: dto.sortOrder } });
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
                  new ModelWeightResponseFormat().orderSaleSetProcessTableResponseFormat(
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

          const isorderSaleshopOrderHead = dto.screenType.includes(120);
          if (isorderSaleshopOrderHead) {
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
              const isorderSaleshopOrderHeadGlobalgallery =
                dto.screenType.includes(121);
              if (isorderSaleshopOrderHeadGlobalgallery) {
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
            pipeline.push(
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
      arrayAggregation.push({
        $match: {
          _status: 1,
        },
      });

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
}
