import * as mongoose from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { OrderSaleChangeRequests } from 'src/tableModels/order_sale_change_requests.model';
import { Counters } from 'src/tableModels/counters.model';
import { GlobalConfig } from 'src/config/global_config';
import {
  OrderSaleChangeRequestCreateDto,
  OrderSaleChangeRequestListDto,
  OrderSaleChangeRequestStatusChangeDto,
} from './order_sale_change_request.dto';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { RootCausesModel } from 'src/tableModels/rootCause.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';

@Injectable()
export class OrderSaleChangeRequestService {
  constructor(
    @InjectModel(ModelNames.ORDER_SALE_CHANGE_REQUESTS)
    private readonly orderSaleChangeRequestModel: mongoose.Model<OrderSaleChangeRequests>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleMainModel: mongoose.Model<OrderSalesMain>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: mongoose.Model<OrderSaleHistories>,
    @InjectModel(ModelNames.ROOT_CAUSES)
    private readonly rootCauseModel: mongoose.Model<RootCausesModel>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: OrderSaleChangeRequestCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToPurchaseBooking = [];
      var arrayToPurchaseBookingItem = [];

      var resultCounterPurchaseBooking =
        await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.ORDER_SALE_CHANGE_REQUESTS },
          {
            $inc: {
              _count: dto.array.length,
            },
          },
          { new: true, session: transactionSession },
        );

      var orderSaleIdCancelRequest = [];
      var orderSaleIdAmndmentRequest = [];

      dto.array.map((mapItem, index) => {
        if (mapItem.type == 0) {
          //cancel
          orderSaleIdCancelRequest.push(mapItem.orderSaleId);
        } else if (mapItem.type == 1) {
          //amnnt

          orderSaleIdAmndmentRequest.push(mapItem.orderSaleId);
        }
        arrayToPurchaseBooking.push({
          _orderSaleId: mapItem.orderSaleId,
          _orderSaleItemId: mapItem.orderSaleItemId,
          _rootCause: mapItem.rootCauseId == '' ? null : mapItem.rootCauseId,
          _uid:
            resultCounterPurchaseBooking._count -
            dto.array.length +
            (index + 1),
          _description: mapItem.description,
          _type: mapItem.type,
          _proceedStatus: mapItem.proceedStatus,
          _workStatus: 0,
          _newImages:[],
          _deleteImages:mapItem.deleteImageGlobalGalleryIds,
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
      if (dto.orderSaleItemIds.length > 0) {
        var newSettingsId = [];
        dto.orderSaleItemIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _orderSaleItemId: { $in: newSettingsId } },
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
              _isPurchaseOrgerGenerated: dto.sortOrder,
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
