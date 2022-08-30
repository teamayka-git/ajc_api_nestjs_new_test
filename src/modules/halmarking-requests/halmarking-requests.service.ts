import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';
import { Counters } from 'src/tableModels/counters.model';
import { HalmarkingRequests } from 'src/tableModels/halmarking_requests.model';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { Products } from 'src/tableModels/products.model';
import {
  HalmarkCenterAssigntDto,
  HalmarkingRequestsCreateDto,
  HalmarkingRequestsEditDto,
  HalmarkingRequestsListDto,
  HalmarkingRequestsStatusChangeDto,
  HalmarkingRequestsUpdateEditDto,
} from './halmarking_requests.dto';

@Injectable()
export class HalmarkingRequestsService {
  constructor(
    @InjectModel(ModelNames.PRODUCTS)
    private readonly productModel: mongoose.Model<Products>,
    @InjectModel(ModelNames.HALMARKING_REQUESTS)
    private readonly halmarkRequestsModel: mongoose.Model<HalmarkingRequests>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleMainModel: mongoose.Model<OrderSalesMain>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: mongoose.Model<OrderSaleHistories>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: HalmarkingRequestsCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];

      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.HALMARKING_REQUESTS },
        {
          $inc: {
            _count: dto.array.length,
          },
        },
        { new: true, session: transactionSession },
      );

      dto.array.map((mapItem, index) => {
        arrayToStates.push({
          _uid: resultCounterPurchase._count - dto.array.length + (index + 1),
          _orderSaleItemId:
            mapItem.orderSaleItemId == '' || mapItem.orderSaleItemId == 'nil'
              ? null
              : mapItem.orderSaleItemId,
          _productId:
            mapItem.productId == '' || mapItem.productId == 'nil'
              ? null
              : mapItem.productId,
          _halmarkCenterId: mapItem.halmarkCenterId,
          _halmarkCenterUserId: null,
          _verifyUserId: null,
          _requestStatus: 0,
          _rootCauseId: null,
          _hmValue: '',
          _description: mapItem.description,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      var result1 = await this.halmarkRequestsModel.insertMany(arrayToStates, {
        session: transactionSession,
      });

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

  async edit(dto: HalmarkingRequestsEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.halmarkRequestsModel.findOneAndUpdate(
        {
          _id: dto.halmarkCenterId,
        },
        {
          $set: {
            _orderSaleItemId:
              dto.orderSaleItemId == '' || dto.orderSaleItemId == 'nil' ? null : dto.orderSaleItemId,
            _productId:
              dto.productId == '' || dto.productId == 'nil'
                ? null
                : dto.productId,
            _halmarkCenterId: dto.halmarkCenterId,
            _description: dto.description,
            _hmValue: dto.hmValue,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
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

  async status_change(
    dto: HalmarkingRequestsStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.halmarkRequestsModel.updateMany(
        {
          _id: { $in: dto.hmRequestIds },
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

  async list(dto: HalmarkingRequestsListDto) {
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
              { _description: new RegExp(dto.searchingText, 'i') },
              { _uid: new RegExp(`^${dto.searchingText}$`, 'i') },
              { _hmValue: new RegExp(`^${dto.searchingText}$`, 'i') },
            ],
          },
        });
      }
      if (dto.hmRequestIds.length > 0) {
        var newSettingsId = [];
        dto.hmRequestIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.orderIds.length > 0) {
        var newSettingsId = [];
        dto.orderIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _orderId: { $in: newSettingsId } } });
      }
      if (dto.productIds.length > 0) {
        var newSettingsId = [];
        dto.productIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _productId: { $in: newSettingsId } },
        });
      }
      if (dto.hmCenterIds.length > 0) {
        var newSettingsId = [];
        dto.hmCenterIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _halmarkCenterId: { $in: newSettingsId } },
        });
      }
      if (dto.hmCenterUserIds.length > 0) {
        var newSettingsId = [];
        dto.hmCenterUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _halmarkCenterUserId: { $in: newSettingsId } },
        });
      }
      if (dto.verifyUserIds.length > 0) {
        var newSettingsId = [];
        dto.verifyUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _verifyUserId: { $in: newSettingsId } },
        });
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
      if (dto.requestStatus.length > 0) {
        arrayAggregation.push({
          $match: { _requestStatus: { $in: dto.requestStatus } },
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
          arrayAggregation.push({ $sort: { _uid: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _requestStatus: dto.sortOrder } });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      if (dto.screenType.includes( 100) ) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderSaleItemId: '$_orderSaleItemId' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$orderSaleItemId'] } }},
            
            
              {
                $lookup: {
                  from: ModelNames.ORDER_SALES_MAIN,
                  let: { orderId: '$_orderSaleId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$orderId'] },
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
                        from: ModelNames.SUB_CATEGORIES,
                        let: { subCategoryId: '$_subCategoryId' },
                        pipeline: [
                          {
                            $match: {
                              $expr: { $eq: ['$_id', '$$subCategoryId'] },
                            },
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
                  as: 'orderDetails',
                },
              },
              {
                $unwind: {
                  path: '$orderDetails',
                  preserveNullAndEmptyArrays: true,
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
        );
      }

      if (dto.screenType.includes( 107)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.PRODUCTS,
              let: { productId: '$_productId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$productId'] } } },
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

      if (dto.screenType.includes(108)) {
        arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shopId'] } } }],
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
      if (dto.screenType.includes( 109)) {
        arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
          {
            $lookup: {
              from: ModelNames.CATEGORIES,
              let: { categoryId: '$_categoryId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$categoryId'] } } },
              ],
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
      if (dto.screenType.includes( 110) ) {
        arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
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
      if (dto.screenType.includes( 111)) {
        arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push({
          $lookup: {
            from: ModelNames.PRODUCT_STONE_LINKIGS,
            let: { productId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_productId', '$$productId'] },
                },
              },
              {
                $lookup: {
                  from: ModelNames.STONE,
                  let: { stoneId: '$_stoneId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$stoneId'] } } },

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
                  as: 'stoneDetails',
                },
              },
              {
                $unwind: {
                  path: '$stoneDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.COLOUR_MASTERS,
                  let: { colourId: '$_stoneColourId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$colourId'] } } },
                  ],
                  as: 'colourDetails',
                },
              },
              {
                $unwind: {
                  path: '$colourDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: 'stoneLinking',
          },
        });
      }
      if (dto.screenType.includes(111)) {
        arrayAggregation[arrayAggregation.length - 2].$lookup.pipeline.push(
          {
            $lookup: {
              from: ModelNames.GROUP_MASTERS,
              let: { groupId: '$_groupId' },
              pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$groupId'] } } }],
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
      

      if (dto.screenType.includes( 101)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.HALMARK_CENTERS,
              let: { halmarkCenterId: '$_halmarkCenterId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$halmarkCenterId'] } } },
              ],
              as: 'halmarkCenterDetails',
            },
          },
          {
            $unwind: {
              path: '$halmarkCenterDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes( 102)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { halmarkCenterUserId: '$_halmarkCenterUserId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$halmarkCenterUserId'] },
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
              as: 'halmarkCenterUserDetails',
            },
          },
          {
            $unwind: {
              path: '$halmarkCenterUserDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.includes( 103)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { verifyUserId: '$_verifyUserId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$verifyUserId'] },
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
              as: 'verifyUserDetails',
            },
          },
          {
            $unwind: {
              path: '$verifyUserDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.includes( 104) ) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
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
      if (dto.screenType.includes( 105)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { createdUserId: '$_createdUserId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$createdUserId'] },
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

      var result = await this.halmarkRequestsModel
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

        var resultTotalCount = await this.halmarkRequestsModel
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

  async updateRequest(dto: HalmarkingRequestsUpdateEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.halmarkRequestsModel.findOneAndUpdate(
        {
          _id: dto.hmRequestId,
        },
        {
          $set: {
            _halmarkCenterUserId:
              dto.hmCenterUserId == '' || dto.hmCenterUserId == 'nil'
                ? null
                : dto.hmCenterUserId,
            _requestStatus: dto.requestStatus,
            _verifyUserId:
              dto.verifyUserId == '' || dto.verifyUserId == 'nil'
                ? null
                : dto.verifyUserId,
            _rootCauseId:
              dto.rootCauseId == '' || dto.rootCauseId == 'nil'
                ? null
                : dto.rootCauseId,
            _description: dto.description,
            _hmValue: dto.hmValue,

            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );

      if (dto.requestStatus == 4 && dto.orderId != '' && dto.orderId != 'nil') {
        await this.orderSaleMainModel.findOneAndUpdate(
          { _id: dto.orderId },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _workStatus: 33,
            },
          },
          { new: true, session: transactionSession },
        );
      }
      if (
        dto.requestStatus == 4 &&
        dto.productId != '' &&
        dto.productId != 'nil'
      ) {
        await this.productModel.findOneAndUpdate(
          { _id: dto.productId },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _huId: dto.hmValue, 
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
  async assignHalmarkCenter(dto: HalmarkCenterAssigntDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.halmarkRequestsModel.updateMany(
        {
          _id: dto.hmRequestIds,
        },
        {
          $set: {
            _halmarkCenterId: dto.hmCenterId,
            _requestStatus: 0,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
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
}
