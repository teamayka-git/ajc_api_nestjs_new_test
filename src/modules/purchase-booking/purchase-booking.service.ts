import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { PurchaseBooking } from 'src/tableModels/purchase_booking.model';
import {
  PurchaseBookingCreateDto,
  PurchaseBookingListDto,
  PurchaseBookingStatusChangeDto,
} from './purchase_booking.dto';
import { GlobalConfig } from 'src/config/global_config';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { Counters } from 'src/tableModels/counters.model';

@Injectable()
export class PurchaseBookingService {
  constructor(
    @InjectModel(ModelNames.PURCHASE_BOOKINGS)
    private readonly purchaseBookingModel: mongoose.Model<PurchaseBooking>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: PurchaseBookingCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToPurchaseBooking = [];
      var arrayToPurchaseBookingItem = [];

      var resultCounterPurchaseBooking =
        await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.PURCHASE_BOOKINGS },
          {
            $inc: {
              _count: dto.array.length,
            },
          },
          { new: true, session: transactionSession },
        );

      dto.array.map((mapItem, index) => {
        var bookingId = new mongoose.Types.ObjectId();
        arrayToPurchaseBooking.push({
          _id: bookingId,
          _invoiceId: mapItem.invoiceId == '' ? null : mapItem.invoiceId,
          _bookingWeight: mapItem.bookingWeight,
          _bookingRate: mapItem.bookingRate,
          _bookingAmount: mapItem.bookingAmount,
          _groupId: mapItem.groupId == '' ? null : mapItem.groupId,
          _uid:
            resultCounterPurchaseBooking._count -
            dto.array.length +
            (index + 1),
          _supplierUserId:
            mapItem.supplierUserId == '' ? null : mapItem.supplierUserId,
          _shopId: mapItem.shopId == '' ? null : mapItem.shopId,
          _bookingThrough: mapItem.bookingThrough,
          _isPurchaseOrgerGenerated: mapItem.isPurchaseGenerated,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      await this.purchaseBookingModel.insertMany(arrayToPurchaseBooking, {
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

  async status_change(dto: PurchaseBookingStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.purchaseBookingModel.updateMany(
        {
          _id: { $in: dto.purchaseBookingIds },
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

  async list(dto: PurchaseBookingListDto) {
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
      if (dto.purchaseBookingIds.length > 0) {
        var newSettingsId = [];
        dto.purchaseBookingIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.invoiceIds.length > 0) {
        var newSettingsId = [];
        dto.invoiceIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _invoiceId: { $in: newSettingsId } },
        });
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
      if (dto.shopIds.length > 0) {
        var newSettingsId = [];
        dto.shopIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _shopId: { $in: newSettingsId } } });
      }
      if (dto.uids.length > 0) {
        arrayAggregation.push({ $match: { _uid: { $in: dto.uids } } });
      }

      if (dto.bookingWeightStart != -1 || dto.bookingWeightEnd != -1) {
        if (dto.bookingWeightStart != -1) {
          arrayAggregation.push({
            $match: { _bookingWeight: { $gte: dto.bookingWeightStart } },
          });
        }
        if (dto.bookingWeightEnd != -1) {
          arrayAggregation.push({
            $match: { _bookingWeight: { $lte: dto.bookingWeightEnd } },
          });
        }
      }

      if (dto.bookingRateStart != -1 || dto.bookingRateEnd != -1) {
        if (dto.bookingRateStart != -1) {
          arrayAggregation.push({
            $match: { _bookingRate: { $gte: dto.bookingRateStart } },
          });
        }
        if (dto.bookingRateEnd != -1) {
          arrayAggregation.push({
            $match: { _bookingRate: { $lte: dto.bookingRateEnd } },
          });
        }
      }
      if (dto.bookingAmountStart != -1 || dto.bookingAmountEnd != -1) {
        if (dto.bookingAmountStart != -1) {
          arrayAggregation.push({
            $match: { _bookingAmount: { $gte: dto.bookingAmountStart } },
          });
        }
        if (dto.bookingAmountEnd != -1) {
          arrayAggregation.push({
            $match: { _bookingAmount: { $lte: dto.bookingAmountEnd } },
          });
        }
      }
      if (dto.bookingThrough.length != 0) {
        arrayAggregation.push({
          $match: { _bookingThrough: { $in: dto.bookingThrough } },
        });
      }
      if (dto.isPurchaseOrgerGenerated.length != 0) {
        arrayAggregation.push({
          $match: {
            _isPurchaseOrgerGenerated: { $in: dto.isPurchaseOrgerGenerated },
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
        new ModelWeightResponseFormat().purchaseBookingTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(100)) {
        const purchaseBookingItemsGroupPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: { $expr: { $eq: ['$_id', '$$groupId'] } },
            },
            new ModelWeightResponseFormat().groupMasterTableResponseFormat(
              1000,
              dto.responseFormat,
            ),
          );
          if (dto.screenType.includes(101)) {
            const purchaseBookingItemsGroupCategoryPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_groupId', '$$groupId'] },
                  },
                },
                new ModelWeightResponseFormat().categoryTableResponseFormat(
                  1010,
                  dto.responseFormat,
                ),
              );
              if (dto.screenType.includes(102)) {
                const purchaseBookingItemsGroupCategorySubCategoryPipeline =
                  () => {
                    const pipeline = [];
                    pipeline.push(
                      {
                        $match: {
                          _status: 1,
                          $expr: { $eq: ['$_categoryId', '$$categoryId'] },
                        },
                      },
                      new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                        1020,
                        dto.responseFormat,
                      ),
                    );

                    return pipeline;
                  };
                pipeline.push(
                  {
                    $lookup: {
                      from: ModelNames.SUB_CATEGORIES,
                      let: { categoryId: '$_id' },
                      pipeline:
                        purchaseBookingItemsGroupCategorySubCategoryPipeline(),
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
                  from: ModelNames.CATEGORIES,
                  let: { groupId: '$_id' },
                  pipeline: purchaseBookingItemsGroupCategoryPipeline(),
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

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GROUP_MASTERS,
              let: { groupId: '$_groupId' },
              pipeline: purchaseBookingItemsGroupPipeline(),
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

      if (dto.screenType.includes(103)) {
        arrayAggregation.push(
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
                new ModelWeightResponseFormat().invoiceTableResponseFormat(
                  1030,
                  dto.responseFormat,
                ),
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
        );
      }

      if (dto.screenType.includes(104)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_supplierUserId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$userId'] },
                  },
                },
                new ModelWeightResponseFormat().userTableResponseFormat(
                  1040,
                  dto.responseFormat,
                ),
              ],
              as: 'supplierUserDetails',
            },
          },
          {
            $unwind: {
              path: '$supplierUserDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.includes(105)) {
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
                  1050,
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
