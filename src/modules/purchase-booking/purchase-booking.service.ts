import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { PurchaseBooking } from 'src/tableModels/purchase_booking.model';
import { PurchaseBookingItem } from 'src/tableModels/purchase_booking_item.model';
import {
  PurchaseBookingCreateDto,
  PurchaseBookingListDto,
  PurchaseBookingStatusChangeDto,
} from './purchase_booking.dto';
import { GlobalConfig } from 'src/config/global_config';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';

@Injectable()
export class PurchaseBookingService {
  constructor(
    @InjectModel(ModelNames.PURCHASE_BOOKINGS)
    private readonly purchaseBookingModel: mongoose.Model<PurchaseBooking>,
    @InjectModel(ModelNames.PURCHASE_BOOKING_ITEMS)
    private readonly purchaseBookingItemModel: mongoose.Model<PurchaseBookingItem>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: PurchaseBookingCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToPurchaseBooking = [];
      var arrayToPurchaseBookingItem = [];

      dto.array.map((mapItem) => {
        var bookingId = new mongoose.Types.ObjectId();
        arrayToPurchaseBooking.push({
          _id: bookingId,
          _invoiceId: mapItem.invoiceId == '' ? null : mapItem.invoiceId,
          _totalMetalWeight: mapItem.totalMetalWeight,
          _confirmationStatus: mapItem.confirmationStatus,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        mapItem.items.forEach((eachItemItem) => {
          arrayToPurchaseBookingItem.push({
            _purchaseBookingId: bookingId,
            _metalWeight: eachItemItem.metalWeight,
            _groupId: eachItemItem.groupId,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      });

      await this.purchaseBookingModel.insertMany(arrayToPurchaseBooking, {
        session: transactionSession,
      });
      await this.purchaseBookingItemModel.insertMany(
        arrayToPurchaseBookingItem,
        {
          session: transactionSession,
        },
      );

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

      //   if (dto.searchingText != '') {
      //     //todo
      //     arrayAggregation.push({
      //       $match: {
      //         $or: [{ _name: new RegExp(dto.searchingText, 'i') }],
      //       },
      //     });
      //   }
      if (dto.purchaseBookingIds.length > 0) {
        var newSettingsId = [];
        dto.purchaseBookingIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.totalMetalWeightStart != -1 || dto.totalMetalWeightEnd != -1) {
        var totalWeihtMatchObject = {};
        if (dto.totalMetalWeightStart != -1) {
          totalWeihtMatchObject['$gte'] = dto.totalMetalWeightStart;
        }
        if (dto.totalMetalWeightEnd != -1) {
          totalWeihtMatchObject['$lte'] = dto.totalMetalWeightEnd;
        }

        arrayAggregation.push({
          $match: { _totalMetalWeight: totalWeihtMatchObject },
        });
      }
      if (dto.confirmationStatus.length != 0) {
        arrayAggregation.push({
          $match: { _confirmationStatus: { $in: dto.confirmationStatus } },
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
        new ModelWeightResponseFormat().purchaseBookingTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      const purchaseBookingItemsPopulate = dto.screenType.includes(100);
      if (purchaseBookingItemsPopulate) {
        const purchaseBookingItemsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: { $expr: { $eq: ['$_id', '$$purchaseBookingId'] } },
            },
            new ModelWeightResponseFormat().purchaseBookingItemsTableResponseFormat(
              1110,
              dto.responseFormat,
            ),
          );
          if (dto.screenType.includes(101)) {
            const purchaseBookingItemsGroupPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: { $expr: { $eq: ['$_id', '$$groupId'] } },
                },
                new ModelWeightResponseFormat().groupMasterTableResponseFormat(
                  1010,
                  dto.responseFormat,
                ),
              );
              if (dto.screenType.includes(102)) {
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
                      1020,
                      dto.responseFormat,
                    ),
                  );
                  if (dto.screenType.includes(103)) {
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
                            1030,
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

            pipeline.push(
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

          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.PURCHASE_BOOKING_ITEMS,
            let: { purchaseBookingId: '$_purchaseBookingId' },
            pipeline: purchaseBookingItemsPipeline(),
            as: 'purchaseBookingItems',
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
