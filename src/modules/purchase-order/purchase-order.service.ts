import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { PurchaseBooking } from 'src/tableModels/purchase_booking.model';
import { PurchaseOrderItem } from 'src/tableModels/purchase_order_item.model';
import { PurchaseOrder } from 'src/tableModels/purchase_order.model';
import {
  PurchaseOrderCreateDto,
  PurchaseOrderListDto,
  PurchaseOrderPurchaseStatusChangeDto,
  PurchaseOrderStatusChangeDto,
} from './purchase_order.dto';
import { GlobalConfig } from 'src/config/global_config';
import { Counters } from 'src/tableModels/counters.model';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectModel(ModelNames.PURCHASE_BOOKINGS)
    private readonly purchaseBookingModel: mongoose.Model<PurchaseBooking>,
    @InjectModel(ModelNames.PURCHASE_ORDERS)
    private readonly purchaseOrderModel: mongoose.Model<PurchaseOrder>,
    @InjectModel(ModelNames.PURCHASE_ORDER_ITEMS)
    private readonly purchaseOrderItemModel: mongoose.Model<PurchaseOrderItem>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: PurchaseOrderCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToPurchaseBooking = [];
      var arrayToPurchaseBookingItem = [];
      var arrayBookingIds = [];

      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.PURCHASE_ORDERS },
        {
          $inc: {
            _count: dto.array.length,
          },
        },
        { new: true, session: transactionSession },
      );

      dto.array.map((mapItem, index) => {
        var purchaseOrderId = new mongoose.Types.ObjectId();
        arrayToPurchaseBooking.push({
          _id: purchaseOrderId,
          _uid: resultCounterPurchase._count - dto.array.length + (index + 1),
          _supplierUserId: mapItem.supplierUserId == '' ? null : mapItem.supplierUserId,
          _purchaseStatus: mapItem.purchaseStatus,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        mapItem.purchaseBookingIds.forEach((eachItemItem) => {
          if (mapItem.purchaseStatus == 1) {
            arrayBookingIds.push(eachItemItem);
          }
          arrayToPurchaseBookingItem.push({
            _purchaseOrderId: purchaseOrderId,
            _purchaseBookingId: eachItemItem == '' ? null : eachItemItem,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      });

      await this.purchaseOrderModel.insertMany(arrayToPurchaseBooking, {
        session: transactionSession,
      });
      await this.purchaseOrderItemModel.insertMany(arrayToPurchaseBookingItem, {
        session: transactionSession,
      });
      if (arrayBookingIds.length != 0) {
        await this.purchaseBookingModel.updateMany(
          //check and update if purchase status approved
          {
            _id: { $in: arrayBookingIds },
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
      }
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

  async status_change(dto: PurchaseOrderStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.purchaseOrderModel.updateMany(
        {
          _id: { $in: dto.purchaseOrderIds },
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
  async changePurchaseStatus(
    dto: PurchaseOrderPurchaseStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultPurchaseOrder = await this.purchaseOrderModel
        .find({
          _id: { $in: dto.purchaseOrderIds },
          _purchaseStatus: dto.purchaseFromStatus,
        })
        .select('_id');
      if (resultPurchaseOrder.length != dto.purchaseOrderIds.length) {
        throw new HttpException(
          'Data outdated, please refresh',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var result = await this.purchaseOrderModel.updateMany(
        {
          _id: { $in: dto.purchaseOrderIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _purchaseStatus: dto.purchaseStatus,
          },
        },
        { new: true, session: transactionSession },
      );

      if (dto.purchaseStatus == 0) {
        var purchaseBookingIds = [];
        var resultPurchaseOrderItems = await this.purchaseOrderItemModel
          .find({ _purchaseOrderId: { $in: dto.purchaseOrderIds }, _status: 1 })
          .select('_purchaseBookingId');
        resultPurchaseOrderItems.forEach((element) => {
          purchaseBookingIds.push(element._purchaseBookingId);
        });

        await this.purchaseBookingModel.updateMany(
          {
            _id: { $in: purchaseBookingIds },
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

  async list(dto: PurchaseOrderListDto) {
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
      if (dto.purchaseOrderIds.length > 0) {
        var newSettingsId = [];
        dto.purchaseOrderIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }
      if (dto.supplierUserIds.length > 0) {
        var newSettingsId = [];
        dto.supplierUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _supplierUserId: { $in: newSettingsId } },
        });
      }
      if (dto.uids.length > 0) {
        arrayAggregation.push({ $match: { _uid: { $in: dto.uids } } });
      }

      if (dto.purchaseStatus.length != 0) {
        arrayAggregation.push({
          $match: { _deliveryStatus: { $in: dto.purchaseStatus } },
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
            $sort: { _confirmationStatus: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 3:
          arrayAggregation.push({
            $sort: { _totalMetalWeight: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      arrayAggregation.push(
        new ModelWeightResponseFormat().purchaseOrderTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(100)) {
        const purchaseOrdeItemsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_purchaseOrderId', '$$purchaseOrderId'] },
              },
            },
            new ModelWeightResponseFormat().purchaseOrderItemsTableResponseFormat(
              1000,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(101)) {
            const purchaseOrdeItemsBookingPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$purchaseBookingId'] },
                  },
                },
                new ModelWeightResponseFormat().purchaseBookingTableResponseFormat(
                  1010,
                  dto.responseFormat,
                ),
              );

              return pipeline;
            };

            arrayAggregation.push(
              {
                $lookup: {
                  from: ModelNames.PURCHASE_BOOKINGS,
                  let: { purchaseBookingId: '$_purchaseBookingId' },
                  pipeline: purchaseOrdeItemsBookingPipeline(),
                  as: 'purchaseBookingItems',
                },
              },
              {
                $unwind: {
                  path: '$purchaseBookingItems',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }

          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.PURCHASE_ORDER_ITEMS,
            let: { purchaseOrderId: '$_id' },
            pipeline: purchaseOrdeItemsPipeline(),
            as: 'purchaseOrderItems',
          },
        });
      }

      var result = await this.purchaseBookingModel
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

        var resultTotalCount = await this.purchaseBookingModel
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
