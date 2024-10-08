import * as mongoose from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { OrderSaleChangeRequests } from 'src/tableModels/order_sale_change_requests.model';
import { Counters } from 'src/tableModels/counters.model';
import { GlobalConfig } from 'src/config/global_config';
import {
  AmendmentRequestRejectDto,
  CancelRequestAcceptDto,
  OrderSaleChangeRequestCreateDto,
  OrderSaleChangeRequestListDto,
  OrderSaleChangeRequestStatusChangeDto,
} from './order_sale_change_request.dto';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { RootCausesModel } from 'src/tableModels/rootCause.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { OrderSaleChangeRequestDocuments } from 'src/tableModels/order_sale_change_request_documents.model';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { Generals } from 'src/tableModels/generals.model';
import { OrderSaleSetProcesses } from 'src/tableModels/order_sale_set_processes.model';
import { OrderCancelRejectReports } from 'src/tableModels/order_cancel_reject_reports.model';
import { FcmUtils } from 'src/utils/FcmUtils';
import { UserNotifications } from 'src/tableModels/user_notifications.model';
import { User } from 'src/tableModels/user.model';

@Injectable()
export class OrderSaleChangeRequestService {
  constructor(
    @InjectModel(ModelNames.ORDER_SALE_CHANGE_REQUEST_DOCUMENTS)
    private readonly orderSaleChangeRequestDocumentsModel: mongoose.Model<OrderSaleChangeRequestDocuments>,
    @InjectModel(ModelNames.ORDER_SALE_CHANGE_REQUESTS)
    private readonly orderSaleChangeRequestModel: mongoose.Model<OrderSaleChangeRequests>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleMainModel: mongoose.Model<OrderSalesMain>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,

    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.USER_NOTIFICATIONS)
    private readonly userNotificationModel: mongoose.Model<UserNotifications>,
    @InjectModel(ModelNames.ORDER_REJECTED_CANCEL_REPORTS)
    private readonly orderRejectedCancelReportModel: mongoose.Model<OrderCancelRejectReports>,
    @InjectModel(ModelNames.ORDER_SALE_SET_PROCESSES)
    private readonly orderSaleSetProcessModel: mongoose.Model<OrderSaleSetProcesses>,
    @InjectModel(ModelNames.GENERALS)
    private readonly generalsModel: mongoose.Model<Generals>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: mongoose.Model<OrderSaleHistories>,
    @InjectModel(ModelNames.ROOT_CAUSES)
    private readonly rootCauseModel: mongoose.Model<RootCausesModel>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(
    dto: OrderSaleChangeRequestCreateDto,
    _userId_: string,
    file: Object,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var orderSaleIdChangeRequestDocumentsTable = [];
      var arrayGlobalGalleries = [];
      var changeRequestId = new mongoose.Types.ObjectId();

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
            orderSaleIdChangeRequestDocumentsTable.push({
              _orderSaleChangeRequestId: changeRequestId,
              _type: 1,
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
      }
      if (dto.type == 1) {
        var resultGenerals = await this.generalsModel.find({
          _code: 1028,
          _status: 1,
        });
        if (resultGenerals.length == 0) {
          throw new HttpException(
            'Max amendment count in general not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        var resultOrderAmendmentCount =
          await this.orderSaleChangeRequestModel.count({
            _orderSaleId: dto.orderSaleId,
            _workStatus: { $in: [0, 1] },
            _type: 1,
            _status: 1,
          });

        if (resultOrderAmendmentCount == resultGenerals[0]._number) {
          throw new HttpException(
            'Order amendment count exceeded',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      var arrayToPurchaseBooking = [];
      var arrayToPurchaseBookingItem = [];

      var resultCounterPurchaseBooking =
        await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.ORDER_SALE_CHANGE_REQUESTS },
          {
            $inc: {
              _count: 1,
            },
          },
          { new: true, session: transactionSession },
        );

      var orderSaleIdCancelRequest = [];
      var orderSaleIdAmndmentRequest = [];

      if (dto.type == 0) {
        //cancel
        orderSaleIdCancelRequest.push(dto.orderSaleId);
      } else if (dto.type == 1) {
        //amnnt

        orderSaleIdAmndmentRequest.push(dto.orderSaleId);
      }
      arrayToPurchaseBooking.push({
        _id: changeRequestId,
        _orderSaleId: dto.orderSaleId,
        _rootCause: dto.rootCauseId == '' ? null : dto.rootCauseId,
        _uid: resultCounterPurchaseBooking._count,
        _description: dto.description,
        _isMistakeWithManufactor: dto.isMistakeWithManufactor,
        _type: dto.type,
        _amendmentJson: {},
        _proceedStatus: dto.proceedStatus,
        _workStatus: 0,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });

      dto.deleteImageGlobalGalleryIds.forEach((elementChangeRequest) => {
        orderSaleIdChangeRequestDocumentsTable.push({
          _orderSaleChangeRequestId: changeRequestId,
          _globalGalleryId: elementChangeRequest,
          _type: 0,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });
      await this.orderSaleChangeRequestModel.insertMany(
        arrayToPurchaseBooking,
        {
          session: transactionSession,
        },
      );

      var arrayToOrderHistories = [];

      if (orderSaleIdCancelRequest.length != 0) {
        var cancelRootCause = await this.rootCauseModel.find({ _uid: 3 });
        if (cancelRootCause.length == 0) {
          throw new HttpException(
            'Cancel rootcause not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        await this.orderSaleMainModel.updateMany(
          {
            _id: { $in: orderSaleIdCancelRequest },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _isHold: 1,
              _holdRootCause: cancelRootCause[0]._id,
            },
          },
          { new: true, session: transactionSession },
        );
        orderSaleIdCancelRequest.forEach((element) => {
          arrayToOrderHistories.push({
            _orderSaleId: element,
            _userId: null,
            _type: 111,
            _deliveryProviderId: null,
            _deliveryCounterId: null,
            _shopId: null,
            _orderSaleItemId: null,
            _description: 'Cancel order request initiated ',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });
      }

      if (orderSaleIdAmndmentRequest.length != 0) {
        var cancelRootCause = await this.rootCauseModel.find({ _uid: 4 });
        if (cancelRootCause.length == 0) {
          throw new HttpException(
            'Amendment rootcause not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        await this.orderSaleMainModel.updateMany(
          {
            _id: { $in: orderSaleIdAmndmentRequest },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _isHold: 1,
              _holdRootCause: cancelRootCause[0]._id,
            },
          },
          { new: true, session: transactionSession },
        );
        orderSaleIdCancelRequest.forEach((element) => {
          arrayToOrderHistories.push({
            _orderSaleId: element,
            _userId: null,
            _type: 111,
            _deliveryProviderId: null,
            _deliveryCounterId: null,
            _shopId: null,
            _orderSaleItemId: null,
            _description: 'Amendment order request initiated',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });
      }

      await this.orderSaleHistoriesModel.insertMany(arrayToOrderHistories, {
        session: transactionSession,
      });
      if (orderSaleIdChangeRequestDocumentsTable.length != 0) {
        await this.orderSaleChangeRequestDocumentsModel.insertMany(
          orderSaleIdChangeRequestDocumentsTable,
          {
            session: transactionSession,
          },
        );
      }

      //doing notification
      var userFcmCheck = await this.orderSaleMainModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(dto.orderSaleId),
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
              {
                $project: {
                  _isNotificationEnable: 1,
                  _fcmId: 1,
                },
              },
            ],
            as: 'ohDetails',
          },
        },
        {
          $unwind: {
            path: '$ohDetails',
          },
        },
      ]);
      if (userFcmCheck.length == 0) {
        throw new HttpException(
          'Order not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      var userFcmIds = [];
      var userNotificationTable = [];
      var notificationTitle =
        dto.type == 0 ? 'Cancel request' : 'Amendment request';
      var notificationBody = `Order UID: ${userFcmCheck[0]._uid}`;
      var notificationOrderSale = dto.orderSaleId.toString();
      userFcmCheck.forEach((elementUserNotification) => {
        if (
          elementUserNotification.ohDetails._isNotificationEnable == 1 &&
          elementUserNotification.ohDetails._fcmId != ''
        ) {
          userFcmIds.push(elementUserNotification.ohDetails._fcmId);
        }
        userNotificationTable.push({
          _viewStatus: 0,
          _title: notificationTitle,
          _body: notificationBody,
          _orderSaleId:
            notificationOrderSale == '' ? null : notificationOrderSale,
          _userId: elementUserNotification.ohDetails._id,
          _createdAt: dateTime,
          _viewAt: 0,
          _status: 1,
        });
      });
      if (userNotificationTable.length != 0) {
        await this.userNotificationModel.insertMany(userNotificationTable, {
          session: transactionSession,
        });
      }
      if (userFcmIds.length != 0) {
        new FcmUtils().sendFcm(
          notificationTitle,
          notificationBody,
          userFcmIds,
          {
            ajc: 'AJC_NOTIFICATION',
          },
        );
      }
      //done notification

      const responseJSON = { message: 'success', data: {} };
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

  async status_change(
    dto: OrderSaleChangeRequestStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.orderSaleChangeRequestModel.updateMany(
        {
          _id: { $in: dto.OrderSaleChangeRequestIds },
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
  async cancelRequestAccept(dto: CancelRequestAcceptDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {

   

      await this.orderSaleChangeRequestModel.findOneAndUpdate(
        {
          _id: dto.cancelRequestId,
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _workStatus: 1,
          },
        },
        { new: true, session: transactionSession },
      );

      await this.orderSaleMainModel.findOneAndUpdate(
        {
          _id: dto.orderSaleId,
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _workStatus: 27,
            _isHold: 0,
          },
        },
        { new: true, session: transactionSession },
      );


      await this.orderSaleSetProcessModel.updateMany(
        {
          _orderSaleId: dto.orderSaleId,_status:1
        },
        {
          $set: {
            _status: 2,
          },
        },
        { new: true, session: transactionSession },
      );









      var arrayToOrderHistories = [];

      arrayToOrderHistories.push({
        _orderSaleId: dto.orderSaleId,
        _userId: null,
        _type: 27,
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

      var resultOrderStatusCheck = await this.orderSaleMainModel.find({
        _id: dto.orderSaleId,
      });

      if (resultOrderStatusCheck.length == 0) {
        throw new HttpException(
          'Orer not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var resultCancelRequest = await this.orderSaleChangeRequestModel.find({
        _id: dto.cancelRequestId,
      });

      if (resultCancelRequest.length == 0) {
        throw new HttpException(
          'order cancel request not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var arrayToRejectedCancelReport = [];
    
      arrayToRejectedCancelReport.push({
        _orderId: dto.orderSaleId,
        _shop: resultOrderStatusCheck[0]._shopId,
        _oh: resultOrderStatusCheck[0]._orderHeadId,
        _rootcause: resultCancelRequest[0]._rootCause,
        _type: 1,
        _description: resultCancelRequest[0]._description,
        _orderCreatedDate: resultOrderStatusCheck[0]._createdAt,
        _orderDueDate: resultOrderStatusCheck[0]._dueDate,
        _orderUid: resultOrderStatusCheck[0]._uid,

        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });

      await this.orderRejectedCancelReportModel.insertMany(
        arrayToRejectedCancelReport,
        {
          session: transactionSession,
        },
      );

      //doing notification
      var resultOrderStatusCheck = await this.orderSaleMainModel.find({
        _id: dto.orderSaleId,
      });

      if (resultOrderStatusCheck.length == 0) {
        throw new HttpException(
          'Order not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      //doing notification
      var userFcmCheck = await this.userModel.find(
        { _shopId: resultOrderStatusCheck[0]._shopId, _status: 1 },
        { _isNotificationEnable: 1, _fcmId: 1 },
      );
      var userFcmIds = [];
      var userNotificationTable = [];
      var notificationTitle = 'Cancel request accept';
      var notificationBody = 'Order UID: ' +  resultOrderStatusCheck[0]._uid;
      var notificationOrderSale = dto.orderSaleId.toString();
      userFcmCheck.forEach((elementUserNotification) => {
        if (
          elementUserNotification._isNotificationEnable == 1 &&
          elementUserNotification._fcmId != ''
        ) {
          userFcmIds.push(elementUserNotification._fcmId);
        }
        userNotificationTable.push({
          _viewStatus: 0,
          _title: notificationTitle,
          _body: notificationBody,
          _orderSaleId:
            notificationOrderSale == '' ? null : notificationOrderSale,
          _userId: elementUserNotification._id,
          _createdAt: dateTime,
          _viewAt: 0,
          _status: 1,
        });
      });
      if (userNotificationTable.length != 0) {
        await this.userNotificationModel.insertMany(userNotificationTable, {
          session: transactionSession,
        });
      }
      if (userFcmIds.length != 0) {
        new FcmUtils().sendFcm(
          notificationTitle,
          notificationBody,
          userFcmIds,
          {
            ajc: 'AJC_NOTIFICATION',
          },
        );
      }
      //done notification

      const responseJSON = { message: 'success', data: {} };
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
  async amendmentReject(dto: AmendmentRequestRejectDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {

      console.log("___d1");
     

      await this.orderSaleChangeRequestModel.findOneAndUpdate(
        {
          _id: dto.cancelRequestId,
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _workStatus: 2,
          },
        },
        { new: true, session: transactionSession },
      );
      console.log("___d2");
      if (dto.proceedOrder == 0) {
        var arrayToRejectedCancelReport = [];
        var resultOrderStatusCheck = await this.orderSaleMainModel.find({
          _id: dto.orderSaleId,
        });

        if (resultOrderStatusCheck.length == 0) {
          throw new HttpException(
            'Order not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      
        arrayToRejectedCancelReport.push({
          _orderId: resultOrderStatusCheck[0]._id,
          _shop: resultOrderStatusCheck[0]._shopId,
          _oh: resultOrderStatusCheck[0]._orderHeadId,
          _rootcause: null,
          _type: 2,
          _description: 'Admin rejected amendment',
          _orderCreatedDate: resultOrderStatusCheck[0]._createdAt,
          _orderDueDate: resultOrderStatusCheck[0]._dueDate,
          _orderUid: resultOrderStatusCheck[0]._uid,

          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        await this.orderRejectedCancelReportModel.insertMany(
          arrayToRejectedCancelReport,
          {
            session: transactionSession,
          },
        );

        await this.orderSaleMainModel.findOneAndUpdate(
          {
            _id: dto.orderSaleId,
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _workStatus: 27,
              _isHold: 0,
            },
          },
          { new: true, session: transactionSession },
        );

        var arrayToOrderHistories = [];

        arrayToOrderHistories.push({
          _orderSaleId: dto.orderSaleId,
          _userId: null,
          _type: 27,
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
      } else {
        await this.orderSaleMainModel.findOneAndUpdate(
          {
            _id: dto.orderSaleId,
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _isHold: 0,
            },
          },
          { new: true, session: transactionSession },
        );

        var arrayToOrderHistories = [];

        arrayToOrderHistories.push({
          _orderSaleId: dto.orderSaleId,
          _userId: null,
          _type: 112,
          _deliveryProviderId: null,
          _deliveryCounterId: null,
          _shopId: null,
          _orderSaleItemId: null,
          _description: 'deny amendment',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });

        await this.orderSaleHistoriesModel.insertMany(arrayToOrderHistories, {
          session: transactionSession,
        });
      }
      console.log("___d3");


      var resultOrderStatusCheck = await this.orderSaleMainModel.find({
        _id: dto.orderSaleId,
      });

      if (resultOrderStatusCheck.length == 0) {
        throw new HttpException(
          'Order not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      //doing notification
      var userFcmCheck = await this.userModel.find(
        { _shopId: resultOrderStatusCheck[0]._shopId, _status: 1 },
        { _isNotificationEnable: 1, _fcmId: 1 },
      );
      console.log("___d4");
      var userFcmIds = [];
      var userNotificationTable = [];
      var notificationTitle = 'Cancel request accept';
      var notificationBody = 'Order UID: ' + resultOrderStatusCheck[0]._uid;
      var notificationOrderSale = dto.orderSaleId.toString();
      console.log("___d5");
      userFcmCheck.forEach((elementUserNotification) => {
        if (
          elementUserNotification._isNotificationEnable == 1 &&
          elementUserNotification._fcmId != ''
        ) {
          userFcmIds.push(elementUserNotification._fcmId);
        }
        userNotificationTable.push({
          _viewStatus: 0,
          _title: notificationTitle,
          _body: notificationBody,
          _orderSaleId:
            notificationOrderSale == '' ? null : notificationOrderSale,
          _userId: elementUserNotification._id,
          _createdAt: dateTime,
          _viewAt: 0,
          _status: 1,
        });
      });
      console.log("___d6");
      if (userNotificationTable.length != 0) {
        await this.userNotificationModel.insertMany(userNotificationTable, {
          session: transactionSession,
        });
      }
      if (userFcmIds.length != 0) {
        new FcmUtils().sendFcm(
          notificationTitle,
          notificationBody,
          userFcmIds,
          {
            ajc: 'AJC_NOTIFICATION',
          },
        );
      }
      //done notification
      console.log("___d7");
      const responseJSON = { message: 'success', data: {} };
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

  async list(dto: OrderSaleChangeRequestListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _uid: new RegExp(dto.searchingText, 'i') }],
          },
        });
      }
      if (dto.orderSaleChangeRequestIds.length > 0) {
        var newSettingsId = [];
        dto.orderSaleChangeRequestIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.orderSaleIds.length > 0) {
        var newSettingsId = [];
        dto.orderSaleIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _orderSaleId: { $in: newSettingsId } },
        });
      }

      if (dto.uids.length > 0) {
        arrayAggregation.push({ $match: { _uid: { $in: dto.uids } } });
      }

      if (dto.types.length != 0) {
        arrayAggregation.push({
          $match: {
            _type: { $in: dto.types },
          },
        });
      }

      if (dto.workStatus.length != 0) {
        arrayAggregation.push({
          $match: {
            _workStatus: { $in: dto.workStatus },
          },
        });
      }

      if (dto.proceedStatus.length != 0) {
        arrayAggregation.push({
          $match: {
            _proceedStatus: { $in: dto.proceedStatus },
          },
        });
      }

      if (dto.isMistakeWithManufactor.length != 0) {
        arrayAggregation.push({
          $match: {
            _isMistakeWithManufactor: { $in: dto.isMistakeWithManufactor },
          },
        });
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
            $sort: {
              _isPurchaseOrderGenerated: dto.sortOrder,
              _id: dto.sortOrder,
            },
          });

          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      arrayAggregation.push(
        new ModelWeightResponseFormat().orderSaleChangeRequestTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      // and do images 2 array
      //order hold

      if (dto.screenType.includes(100)) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_CHANGE_REQUEST_DOCUMENTS,
            let: { changeRequestId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  _type: 1,
                  $expr: {
                    $eq: ['$_orderSaleChangeRequestId', '$$changeRequestId'],
                  },
                },
              },

              new ModelWeightResponseFormat().orderSaleChangeRequestDocumentsTableResponseFormat(
                1000,
                dto.responseFormat,
              ),

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
            ],
            as: 'changeRequestNewDocuments',
          },
        });
      }
      if (dto.screenType.includes(102)) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.ORDER_SALE_CHANGE_REQUEST_DOCUMENTS,
            let: { changeRequestId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  _type: 0,
                  $expr: {
                    $eq: ['$_orderSaleChangeRequestId', '$$changeRequestId'],
                  },
                },
              },

              new ModelWeightResponseFormat().orderSaleChangeRequestDocumentsTableResponseFormat(
                1020,
                dto.responseFormat,
              ),

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
                      1030,
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
            ],
            as: 'changeRequestDeleteDocuments',
          },
        });
      }

      if (dto.screenType.includes(104)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_MAIN,
              let: { orderId: '$_orderSaleId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$orderId'],
                    },
                  },
                },

                new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
                  1040,
                  dto.responseFormat,
                ),
              ],
              as: 'ordersaleDetails',
            },
          },
          {
            $unwind: {
              path: '$ordersaleDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(105)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
              let: { rootcauseId: '$_rootCause' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$rootcauseId'],
                    },
                  },
                },

                new ModelWeightResponseFormat().rootcauseTableResponseFormat(
                  1050,
                  dto.responseFormat,
                ),
              ],
              as: 'rootcauseDetails',
            },
          },
          {
            $unwind: {
              path: '$rootcauseDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.orderSaleChangeRequestModel
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

        var resultTotalCount = await this.orderSaleChangeRequestModel
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
