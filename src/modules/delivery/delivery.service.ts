import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Delivery } from 'src/tableModels/delivery.model';
import * as mongoose from 'mongoose';
import {
  DeliveryCreateDto,
  DeliveryEmployeeAssignDto,
  DeliveryListDto,
} from './delivery.dto';
import { GlobalConfig } from 'src/config/global_config';
import { DeliveryTempListDto } from '../delivery-temp/delivery_temp.dto';
import { DeliveryItems } from 'src/tableModels/delivery_items.model';
import { Counters } from 'src/tableModels/counters.model';
import { DeliveryTemp } from 'src/tableModels/delivery_temp.model';
import { ModelWeight } from 'src/model_weight/model_weight';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { RootCause } from 'aws-sdk/clients/costexplorer';
import { DeliveryRejectedPendings } from 'src/tableModels/delivery_rejected_pendings.model';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { Otp } from 'src/tableModels/otp.model';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
    @InjectModel(ModelNames.DELIVERY)
    private readonly deliveryModel: Model<Delivery>,
    @InjectModel(ModelNames.DELIVERY_TEMP)
    private readonly deliveryTempModel: Model<DeliveryTemp>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: Model<Counters>,
    @InjectModel(ModelNames.DELIVERY_ITEMS)
    private readonly deliveryItemsModel: Model<DeliveryItems>,
    @InjectModel(ModelNames.OTP)
    private readonly otpModel: mongoose.Model<Otp>,
    @InjectModel(ModelNames.DELIVERY_REJECTED_PENDINGS)
    private readonly deliveryRejectPendingModel: Model<DeliveryRejectedPendings>,
    @InjectModel(ModelNames.ROOT_CAUSES)
    private readonly rootCauseModel: Model<RootCause>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleMainModel: Model<OrderSalesMain>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleMainHistoriesModel: Model<OrderSaleHistories>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: DeliveryCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToDelivery = [];
      var arrayToDeliveryItems = [];

      var shopIds = [];
      var deliveryTempIds = [];
      var orderSaleIds = [];

      dto.array.map((mapItem) => {
        if (
          shopIds.findIndex(
            (shopFindIndex) => shopFindIndex == mapItem.shopId,
          ) == -1
        ) {
          shopIds.push(mapItem.shopId);
        }

        deliveryTempIds.push(mapItem.deliveryTempId);
        orderSaleIds.push(...mapItem.orderIds);
      });

      var resultOldDelivery = await this.deliveryModel.find({
        _employeeId:
          dto.employeeId == '' || dto.employeeId == 'nil'
            ? null
            : dto.employeeId,
        _shopId: { $in: shopIds },
        _hubId: dto.hubId == '' || dto.hubId == 'nil' ? null : dto.hubId,
        _type: dto.type,
        _workStatus: 0,
        _status: 1,
      });

      //for generating uid
      var countUid = 0;
      shopIds.map((mapItem) => {
        if (resultOldDelivery.findIndex((it) => it._shopId == mapItem) == -1) {
          ++countUid;
        }
      });

      var resultCounterDelivery = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.DELIVERY },
        {
          $inc: {
            _count: countUid,
          },
        },
        { new: true, session: transactionSession },
      );
      countUid = 0;

      shopIds.map((mapItem) => {
        if (resultOldDelivery.findIndex((it) => it._shopId == mapItem) == -1) {
          arrayToDelivery.push({
            _id: new mongoose.Types.ObjectId(),
            _employeeId: dto.employeeId,
            _uid: resultCounterDelivery._count - countUid,
            _shopId: mapItem,
            _hubId: dto.hubId == '' || dto.hubId == 'nil' ? null : dto.hubId,
            _type: dto.type,
            _workStatus: 0,
            _deliveryAcceptedAt: 0,
            _isBypass: 0,
            _proofRootCause: '',
            _proofAcceptedUserId: null,
            _proofRootCauseId: null,
            _proofGlobalGalleryId: null,
            _shopReceivedUserId: null,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });

          ++countUid;
        }
      });

      resultOldDelivery.push(...arrayToDelivery);
      await this.deliveryModel.insertMany(arrayToDelivery, {
        session: transactionSession,
      });

      dto.array.map((mapItem) => {
        var indexChild = resultOldDelivery.findIndex(
          (it) => it._shopId == mapItem.shopId,
        );
        if (indexChild != -1) {
          arrayToDeliveryItems.push({
            _deliveryId: resultOldDelivery[indexChild]._id,
            _invoiceId:
              mapItem.invoiceId == '' || mapItem.invoiceId == 'nil'
                ? null
                : mapItem.invoiceId,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        }
      });

      var result1 = await this.deliveryItemsModel.insertMany(
        arrayToDeliveryItems,
        {
          session: transactionSession,
        },
      );

      await this.deliveryTempModel.updateMany(
        {
          _id: { $in: deliveryTempIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _status: 0,
          },
        },
        { new: true, session: transactionSession },
      );

      await this.orderSaleMainModel.updateMany(
        {
          _id: { $in: orderSaleIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _workStatus: 21,
          },
        },
        { new: true, session: transactionSession },
      );

      var arraySalesOrderHistories = [];

      var orderHistoryDescription = '';
      if (
        dto.isOutOfDeliveryIntransitBypassEnabled != null &&
        dto.isOutOfDeliveryIntransitBypassEnabled == 1
      ) {
        orderHistoryDescription =
          'with Delivery boy intransit scan bypass done';
      }
      orderSaleIds.forEach((eachItem) => {
        arraySalesOrderHistories.push({
          _orderSaleId: eachItem,
          _userId: null,
          _type: 21,
          _shopId: null,
          _deliveryCounterId: null,
          _orderSaleItemId: null,
          _deliveryProviderId: null,
          _description: orderHistoryDescription,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      });

      await this.orderSaleMainHistoriesModel.insertMany(
        arraySalesOrderHistories,
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

  async deliveryWorkStatusUpdate(
    dto: DeliveryEmployeeAssignDto,
    _userId_: string,
    file: Object,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      if (dto.otpId != null && dto.otpId != '') {
        var resultOtp = await this.otpModel.findOneAndUpdate(
          {
            _id: dto.otpId,
            _otp: dto.otpValue,
          },
          {
            $set: {
              _status: 0,
            },
          },
          { new: true, session: transactionSession },
        );
        if (resultOtp == null) {
          throw new HttpException(
            'OTP mismatched',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      var deliveryIdsMongo = [];
      dto.deliveryIds.forEach((eachItem) => {
        deliveryIdsMongo.push(new mongoose.Types.ObjectId(eachItem));
      });

      //check qr code scanned at right status
      var getDeliveryItemsForCheck = await this.deliveryModel.aggregate([
        {
          $match: {
            _id: { $in: deliveryIdsMongo },
            _workStatus: dto.fromWorkStatus,
            _status: 1,
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
            let: { deliveryId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_deliveryId', '$$deliveryId'] },
                },
              },
              {
                $project: {
                  _id: 1,
                  _deliveryId: 1,
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
                        from: ModelNames.INVOICE_ITEMS,
                        let: { invoiceItemId: '$_id' },
                        pipeline: [
                          {
                            $match: {
                              _status: 1,
                              $expr: {
                                $eq: ['$_invoiceId', '$$invoiceItemId'],
                              },
                            },
                          },
                          {
                            $project: {
                              _id: 1,
                              _orderSaleItemId: 1,
                            },
                          },
                          {
                            $lookup: {
                              from: ModelNames.ORDER_SALES_ITEMS,
                              let: { orderSaleItemId: '$_orderSaleItemId' },
                              pipeline: [
                                {
                                  $match: {
                                    $expr: {
                                      $eq: ['$_id', '$$orderSaleItemId'],
                                    },
                                  },
                                },
                                {
                                  $project: {
                                    _id: 1,
                                    _orderSaleId: 1,
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
                        ],
                        as: 'invoiceItems',
                      },
                    },
                  ],
                  as: 'invoiceDetails',
                },
              },
              {
                $unwind: {
                  path: '$invoiceDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: 'deliveryItems',
          },
        },
      ]);
      if (getDeliveryItemsForCheck.length != dto.deliveryIds.length) {
        throw new HttpException(
          'Delivery wrong status',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var orderSaleIds = [];
      getDeliveryItemsForCheck.forEach((eachDelivery) => {
        eachDelivery.deliveryItems.forEach((eachDeliveryItems) => {
          eachDeliveryItems.invoiceDetails.invoiceItems.forEach(
            (eachInvoiceItems) => {
              orderSaleIds.push(
                eachInvoiceItems.orderSaleItemDetails._orderSaleId,
              );
            },
          );
        });
      });

      var updateObj = {
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
        _workStatus: dto.workStatus,
      };

      if (dto.workStatus == 1) {
        //delivery done, not uploaded proof

        updateObj['_shopReceivedUserId'] = dto.shopAcceptUserId;
        updateObj['_isBypass'] = dto.isBypass;

        var workStatusOrderAndTimeline = 36;
        if (dto.isBypass == 1) {
          workStatusOrderAndTimeline = 37;
        }

        await this.orderSaleMainModel.updateMany(
          {
            _id: { $in: orderSaleIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _workStatus: workStatusOrderAndTimeline,
            },
          },
          { new: true, session: transactionSession },
        );

        var arraySalesOrderHistories = [];

        orderSaleIds.forEach((eachItem) => {
          arraySalesOrderHistories.push({
            _orderSaleId: eachItem,
            _userId: dto.shopAcceptUserId,
            _type: workStatusOrderAndTimeline,
            _shopId: null,
            _deliveryCounterId: null,
            _orderSaleItemId: null,
            _deliveryProviderId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });

        await this.orderSaleMainHistoriesModel.insertMany(
          arraySalesOrderHistories,
          {
            session: transactionSession,
          },
        );
      } else if (dto.workStatus == 2) {
        //delivery proof verification pending
        var proofGlobalGalleryId = null;

        var resultUpload = {};
        if (file.hasOwnProperty('document')) {
          // var filePath =
          //   __dirname +
          //   `/../../../public${file['image'][0]['path'].split('public')[1]}`;
          //   new ThumbnailUtils().generateThumbnail(filePath,  UploadedFileDirectoryPath.GLOBAL_GALLERY_BRANCH +
          //     new StringUtils().makeThumbImageFileName(
          //       file['image'][0]['filename'],
          //     ));

          resultUpload = await new S3BucketUtils().uploadMyFile(
            file['document'][0],
            UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP_DELIVERY_PROOF,
          );

          if (resultUpload['status'] == 0) {
            throw new HttpException(
              'File upload error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }

        var globalGalleryId = null;
        var proofUrl = '';
        //globalGalleryAdd
        if (file.hasOwnProperty('document')) {
          var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
            { _tableName: ModelNames.GLOBAL_GALLERIES },
            {
              $inc: {
                _count: 1,
              },
            },
            { new: true, session: transactionSession },
          );

          const globalGallery = new this.globalGalleryModel({
            _name: file['document'][0]['originalname'],
            _globalGalleryCategoryId: null,
            _docType: 0,
            _type: 8,
            _uid: resultCounterPurchase._count,
            _url: resultUpload['url'],
            _createdUserId: null,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
          var resultGlobalGallery = await globalGallery.save({
            session: transactionSession,
          });
          proofGlobalGalleryId = resultGlobalGallery._id;
          proofUrl = resultUpload['url'];
        }

        updateObj['_proofGlobalGalleryId'] = proofGlobalGalleryId;

        await this.orderSaleMainModel.updateMany(
          {
            _id: { $in: orderSaleIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _workStatus: 38,
            },
          },
          { new: true, session: transactionSession },
        );

        var arraySalesOrderHistories = [];

        orderSaleIds.forEach((eachItem) => {
          arraySalesOrderHistories.push({
            _orderSaleId: eachItem,
            _userId: null,
            _type: 38,
            _deliveryCounterId: null,
            _shopId: null,
            _orderSaleItemId: null,
            _deliveryProviderId: null,
            _description: proofUrl,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });

        await this.orderSaleMainHistoriesModel.insertMany(
          arraySalesOrderHistories,
          {
            session: transactionSession,
          },
        );
      } else if (dto.workStatus == 3) {
        //delivery proof verification rejected

        updateObj['_proofRootCause'] = dto.proofRootCause;

        if (dto.proofRootCauseId == '' || dto.proofRootCauseId == 'nil') {
          updateObj['_proofRootCauseId'] = null;
        } else {
          updateObj['_proofRootCauseId'] = dto.proofRootCauseId;
        }

        await this.orderSaleMainModel.updateMany(
          {
            _id: { $in: orderSaleIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _workStatus: 39,
            },
          },
          { new: true, session: transactionSession },
        );

        var arraySalesOrderHistories = [];

        orderSaleIds.forEach((eachItem) => {
          arraySalesOrderHistories.push({
            _orderSaleId: eachItem,
            _userId: dto.proofAcceptUserId,
            _type: 39,
            _deliveryCounterId: null,
            _shopId: null,
            _orderSaleItemId: null,
            _deliveryProviderId: null,
            _description:
              'desc: ' + dto.proofRootCauseIdName + ' - ' + dto.proofRootCause,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });

        await this.orderSaleMainHistoriesModel.insertMany(
          arraySalesOrderHistories,
          {
            session: transactionSession,
          },
        );
      } else if (dto.workStatus == 4) {
        //delivery completed

        updateObj['_proofAcceptedUserId'] = dto.proofAcceptUserId;
        updateObj['_deliveryAcceptedAt'] = dateTime;

        await this.orderSaleMainModel.updateMany(
          {
            _id: { $in: orderSaleIds },
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _workStatus: 35,
            },
          },
          { new: true, session: transactionSession },
        );

        var arraySalesOrderHistories = [];

        orderSaleIds.forEach((eachItem) => {
          arraySalesOrderHistories.push({
            _orderSaleId: eachItem,
            _userId: dto.proofAcceptUserId,
            _type: 35,
            _shopId: null,
            _orderSaleItemId: null,
            _deliveryProviderId: null,
            _deliveryCounterId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });

        await this.orderSaleMainHistoriesModel.insertMany(
          arraySalesOrderHistories,
          {
            session: transactionSession,
          },
        );
      }

      var result = await this.deliveryModel.updateMany(
        {
          _id: { $in: dto.deliveryIds },
        },
        {
          $set: updateObj,
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

  async list(dto: DeliveryListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _uid: new RegExp(`^${dto.searchingText}$`, 'i') }],
          },
        });
      }

      if (dto.deliveryIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      var employeeIds = [];
      if (dto.employeeIds.length > 0) {
        dto.employeeIds.map((mapItem) => {
          employeeIds.push(new mongoose.Types.ObjectId(mapItem));
        });
        // arrayAggregation.push({
        //   $match: { _employeeId: { $in: newSettingsId } },
        // });
      }
      if (
        dto.deliveryExecutiveIds != null &&
        dto.deliveryExecutiveIds.length > 0
      ) {
        dto.deliveryExecutiveIds.map((mapItem) => {
          employeeIds.push(new mongoose.Types.ObjectId(mapItem));
        });
        // arrayAggregation.push({
        //   $match: { _employeeId: { $in: newSettingsId } },
        // });
      }
      if (employeeIds.length != 0) {
        arrayAggregation.push({
          $match: { _employeeId: { $in: employeeIds } },
        });
      }

      if (
        dto.deliveryAssignedStartDate != null &&
        dto.deliveryAssignedEndDate != null &&
        dto.deliveryAssignedStartDate != -1 &&
        dto.deliveryAssignedEndDate != -1
      ) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.DELIVERY_ITEMS,
              let: { deliveryId: '$_id' },
              pipeline: [
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_deliveryId', '$$deliveryId'] },
                  },
                },
                {
                  $project: {
                    _invoiceId: 1,
                  },
                },

                {
                  $lookup: {
                    from: ModelNames.DELIVERY_TEMP,
                    let: { invoiceId: '$_invoiceId' },
                    pipeline: [
                      {
                        $match: {
                          // _status: 1,
                          _assignedAt: {
                            $gte: dto.deliveryAssignedStartDate,
                            $lte: dto.deliveryAssignedEndDate,
                          },
                          $expr: { $eq: ['$_invoiceId', '$$invoiceId'] },
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                        },
                      },
                    ],
                    as: 'mongoCheckDeliveryTemp',
                  },
                },
                {
                  $match: { mongoCheckDeliveryTemp: { $ne: [] } },
                },
              ],
              as: 'mongoCheckDeliveryItems',
            },
          },
          {
            $match: { mongoCheckDeliveryItems: { $ne: [] } },
          },
        );
      }
      if (dto.ordersaleUids != null && dto.ordersaleUids.length != 0) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.DELIVERY_ITEMS,
              let: { deliveryId: '$_id' },
              pipeline: [
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_deliveryId', '$$deliveryId'] },
                  },
                },
                {
                  $project: {
                    _invoiceId: 1,
                  },
                },

                {
                  $lookup: {
                    from: ModelNames.INVOICE_ITEMS,
                    let: { invoiceId: '$_invoiceId' },
                    pipeline: [
                      {
                        $match: {
                          _status: 1,

                          $expr: { $eq: ['$_invoiceId', '$$invoiceId'] },
                        },
                      },
                      {
                        $project: {
                          _orderSaleItemId: 1,
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
                            {
                              $project: {
                                _orderSaleId: 1,
                              },
                            },

                            {
                              $lookup: {
                                from: ModelNames.ORDER_SALES_MAIN,
                                let: { orderSaleId: '$_orderSaleId' },
                                pipeline: [
                                  {
                                    $match: {
                                      _uid: { $in: dto.ordersaleUids },
                                      $expr: { $eq: ['$_id', '$$orderSaleId'] },
                                    },
                                  },
                                  {
                                    $project: {
                                      _id: 1,
                                    },
                                  },
                                ],
                                as: 'mongoCheckOrderSale',
                              },
                            },
                            {
                              $match: { mongoCheckOrderSale: { $ne: [] } },
                            },
                          ],
                          as: 'mongoCheckOrderSaleItem',
                        },
                      },
                      {
                        $match: { mongoCheckOrderSaleItem: { $ne: [] } },
                      },
                    ],
                    as: 'mongoCheckInvoiceItems',
                  },
                },
                {
                  $match: { mongoCheckInvoiceItems: { $ne: [] } },
                },
              ],
              as: 'mongoCheckUids',
            },
          },
          {
            $match: { mongoCheckUids: { $ne: [] } },
          },
        );
      }

      if (dto.branchIds != null && dto.branchIds.length > 0) {
        var newSettingsId = [];
        dto.branchIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: [
                {
                  $match: {
                    _branchId: { $in: newSettingsId },
                    $expr: { $eq: ['$_id', '$$shopId'] },
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
              as: 'mongoCheckBranch',
            },
          },
          {
            $match: { mongoCheckBranch: { $ne: [] } },
          },
        );
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
      if (dto.hubIds.length > 0) {
        var newSettingsId = [];
        dto.hubIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _hubId: { $in: newSettingsId } },
        });
      }

      if (dto.proofRootCauseId.length > 0) {
        var newSettingsId = [];
        dto.proofRootCauseId.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _proofRootCauseId: { $in: newSettingsId } },
        });
      }

      if (dto.shopReceivedUserId.length > 0) {
        var newSettingsId = [];
        dto.shopReceivedUserId.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _shopReceivedUserId: { $in: newSettingsId } },
        });
      }

      if (dto.proofAcceptedUserId.length > 0) {
        var newSettingsId = [];
        dto.proofAcceptedUserId.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _proofAcceptedUserId: { $in: newSettingsId } },
        });
      }

      if (dto.typeArray.length > 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.typeArray } },
        });
      }
      if (dto.isBypassed.length > 0) {
        arrayAggregation.push({
          $match: { _isBypass: { $in: dto.isBypassed } },
        });
      }
      if (dto.workStatus.length > 0) {
        arrayAggregation.push({
          $match: { _workStatus: { $in: dto.workStatus } },
        });
      }

      if (
        dto.deliveryCompleteStartDate != -1 &&
        dto.deliveryCompleteEndDate != -1
      ) {
        arrayAggregation.push({
          $match: {
            _deliveryAcceptedAt: {
              $lte: dto.deliveryCompleteEndDate,
              $gte: dto.deliveryCompleteStartDate,
            },
          },
        });
      }

      if (
        dto.cityIds.length != 0 ||
        dto.relationshipManagerIds.length != 0 ||
        dto.orderHeadIds.length != 0
      ) {
        var pipelineShop = [];
        pipelineShop.push(
          {
            $match: {
              $expr: { $eq: ['$_id', '$$shopId'] },
            },
          },
          {
            $project: {
              _id: 1,
              _cityId: 1,
              _orderHeadId: 1,
              _relationshipManagerId: 1,
            },
          },
        );

        if (dto.cityIds.length > 0) {
          var newSettingsId = [];
          dto.cityIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          pipelineShop.push({
            $match: { _cityId: { $in: newSettingsId } },
          });
        }

        if (dto.relationshipManagerIds.length > 0) {
          var newSettingsId = [];
          dto.relationshipManagerIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          pipelineShop.push({
            $match: { _relationshipManagerId: { $in: newSettingsId } },
          });
        }

        if (dto.orderHeadIds.length > 0) {
          var newSettingsId = [];
          dto.orderHeadIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          pipelineShop.push({
            $match: { _orderHeadId: { $in: newSettingsId } },
          });
        }

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: pipelineShop,
              as: 'mongoCheckShopList',
            },
          },
          {
            $match: { mongoCheckShopList: { $ne: [] } },
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
            $sort: { type: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 3:
          arrayAggregation.push({
            $sort: { _uid: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 4:
          arrayAggregation.push({
            $sort: { _workStatus: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      arrayAggregation.push(
        new ModelWeightResponseFormat().deliveryTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(101)) {
        const employeeDetailsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$userId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );

          const employeeDetailsGlobalGallery = dto.screenType.includes(106);
          if (employeeDetailsGlobalGallery) {
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

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_employeeId' },
              pipeline: employeeDetailsPipeline(),
              as: 'employeeDetails',
            },
          },
          {
            $unwind: {
              path: '$employeeDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(102)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.DELIVERY_HUBS,
              let: { hubId: '$_hubId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$hubId'] },
                  },
                },
              ],
              as: 'hubDetails',
            },
          },
          {
            $unwind: {
              path: '$hubDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
        if (dto.responseFormat.length != 0) {
          if (dto.responseFormat.includes(1020)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryHubTableLight() },
            );
          } else if (dto.responseFormat.includes(1021)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryHubTableMinimum() },
            );
          } else if (dto.responseFormat.includes(1022)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryHubTableMedium() },
            );
          } else if (dto.responseFormat.includes(1023)) {
            arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
              { $project: new ModelWeight().deliveryHubTableMaximum() },
            );
          }
        }
      }
      if (dto.screenType.includes(100)) {
        arrayAggregation.push(
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

                new ModelWeightResponseFormat().shopTableResponseFormat(
                  1000,
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

      if (dto.screenType.includes(103)) {
        const deliveryItemsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_deliveryId', '$$deliveryId'] },
              },
            },
            new ModelWeightResponseFormat().deliveryItemsTableResponseFormat(
              1030,
              dto.responseFormat,
            ),
          );

          const isorderSaleItemsInvoices = dto.screenType.includes(105);
          if (isorderSaleItemsInvoices) {
            const orderSaleItemsInvoiceListPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$invoiceId'] },
                  },
                },
                new ModelWeightResponseFormat().invoiceTableResponseFormat(
                  1050,
                  dto.responseFormat,
                ),
              );

              const isorderSaleItemsInvoicesDetailsInvoiceItems =
                dto.screenType.includes(108);
              if (isorderSaleItemsInvoicesDetailsInvoiceItems) {
                const isorderSaleItemsInvoicesDetailsInvoiceItemsPipeline =
                  () => {
                    const pipeline = [];
                    pipeline.push(
                      {
                        $match: {
                          _status: 1,
                          $expr: {
                            $eq: ['$_invoiceId', '$$invoiceId'],
                          },
                        },
                      },
                      new ModelWeightResponseFormat().invoiceItemsTableResponseFormat(
                        1080,
                        dto.responseFormat,
                      ),
                    );

                    const isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItedDetails =
                      dto.screenType.includes(109);
                    if (
                      isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItedDetails
                    ) {
                      const isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItemPipeline =
                        () => {
                          const pipeline = [];
                          pipeline.push(
                            {
                              $match: {
                                $expr: {
                                  $eq: ['$_id', '$$invoiceItemId'],
                                },
                              },
                            },
                            new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
                              1090,
                              dto.responseFormat,
                            ),
                          );

                          const isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItedSubCategoryDetails =
                            dto.screenType.includes(110);
                          if (
                            isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItedSubCategoryDetails
                          ) {
                            pipeline.push(
                              {
                                $lookup: {
                                  from: ModelNames.SUB_CATEGORIES,
                                  let: { subCategoryId: '$_subCategoryId' },
                                  pipeline: [
                                    {
                                      $match: {
                                        $expr: {
                                          $eq: ['$_id', '$$subCategoryId'],
                                        },
                                      },
                                    },

                                    new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                                      1100,
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
                      pipeline.push(
                        {
                          $lookup: {
                            from: ModelNames.ORDER_SALES_ITEMS,
                            let: { invoiceItemId: '$_orderSaleItemId' },
                            pipeline:
                              isorderSaleItemsInvoicesDetailsInvoiceItemsOrderSaleItemPipeline(),
                            as: 'orderSaleItemDetails',
                          },
                        },
                        {
                          $unwind: {
                            path: '$orderSaleItemDetails',
                            preserveNullAndEmptyArrays: true,
                          },
                        },
                      );
                    }

                    return pipeline;
                  };

                pipeline.push({
                  $lookup: {
                    from: ModelNames.INVOICE_ITEMS,
                    let: { invoiceId: '$_id' },
                    pipeline:
                      isorderSaleItemsInvoicesDetailsInvoiceItemsPipeline(),
                    as: 'invoiceItems',
                  },
                });
              }
              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.INVOICES,
                  let: { invoiceId: '$_invoiceId' },
                  pipeline: orderSaleItemsInvoiceListPipeline(),
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

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.DELIVERY_ITEMS,
            let: { deliveryId: '$_id' },
            pipeline: deliveryItemsPipeline(),
            as: 'deliveryItems',
          },
        });
      }

      const proofGlobalGalleryDetails = dto.screenType.includes(111);
      if (proofGlobalGalleryDetails) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GLOBAL_GALLERIES,
              let: { globalGalleryId: '$_proofGlobalGalleryId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$globalGalleryId'] },
                  },
                },

                new ModelWeightResponseFormat().globalGalleryTableResponseFormat(
                  1110,
                  dto.responseFormat,
                ),
              ],
              as: 'proofGlobalGalleryDetails',
            },
          },
          {
            $unwind: {
              path: '$proofGlobalGalleryDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      const proofRejectedRootCauseDetails = dto.screenType.includes(116);
      if (proofRejectedRootCauseDetails) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
              let: { rootCauseId: '$_proofRootCauseId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$rootCauseId'] },
                  },
                },

                new ModelWeightResponseFormat().rootcauseTableResponseFormat(
                  1160,
                  dto.responseFormat,
                ),
              ],
              as: 'proofRootCauseDetails',
            },
          },
          {
            $unwind: {
              path: '$proofRootCauseDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(112)) {
        const employeeDetailsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$shopReceivedUserId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1120,
              dto.responseFormat,
            ),
          );

          const employeeDetailsGlobalGallery = dto.screenType.includes(113);
          if (employeeDetailsGlobalGallery) {
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

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { shopReceivedUserId: '$_shopReceivedUserId' },
              pipeline: employeeDetailsPipeline(),
              as: 'shopReceivedUserDetails',
            },
          },
          {
            $unwind: {
              path: '$shopReceivedUserDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes(114)) {
        const employeeDetailsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$proofAcceptedUserId'] },
              },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1140,
              dto.responseFormat,
            ),
          );

          const employeeDetailsGlobalGallery = dto.screenType.includes(115);
          if (employeeDetailsGlobalGallery) {
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

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { proofAcceptedUserId: '$_proofAcceptedUserId' },
              pipeline: employeeDetailsPipeline(),
              as: 'proofAcceptedUserDetails',
            },
          },
          {
            $unwind: {
              path: '$proofAcceptedUserDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.deliveryModel
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

        var resultTotalCount = await this.deliveryModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
        if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
        }
      }

      var resultDeliveryRejectRootCause = [];
      if (dto.screenType.includes(500)) {
        var aggregateDeliveryReject = [];
        aggregateDeliveryReject.push(
          {
            $match: {
              _type: { $in: [4] },
              _status: 1,
            },
          },
          new ModelWeightResponseFormat().rootcauseTableResponseFormat(
            5000,
            dto.responseFormat,
          ),
        );

        resultDeliveryRejectRootCause = await this.rootCauseModel.aggregate(
          aggregateDeliveryReject,
        );
      }

      var resultProofRejectRootCause = [];
      if (dto.screenType.includes(501)) {
        var aggregateDeliveryReject = [];
        aggregateDeliveryReject.push(
          {
            $match: {
              _type: { $in: [5] },
              _status: 1,
            },
          },
          new ModelWeightResponseFormat().rootcauseTableResponseFormat(
            5010,
            dto.responseFormat,
          ),
        );

        resultProofRejectRootCause = await this.rootCauseModel.aggregate(
          aggregateDeliveryReject,
        );
      }

      const responseJSON = {
        message: 'success',
        data: {
          list: result,
          totalCount: totalCount,
          deliveryRejectRootCause: resultDeliveryRejectRootCause,
          proofRejectRootCause: resultProofRejectRootCause,
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
