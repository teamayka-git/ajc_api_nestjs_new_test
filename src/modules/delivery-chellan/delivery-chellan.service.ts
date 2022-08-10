import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { DeliveryChallans } from 'src/tableModels/delivery_challans.model';
import { DeliveryChallanItems } from 'src/tableModels/delivery_challan_items.model';
import { Counters } from 'src/tableModels/counters.model';
import {
  DeliveryChallanCreateDto,
  DeliveryChallanListDto,
  DeliveryChallanStatusChangeDto,
} from './delivery_chellan.dto';
import { GlobalConfig } from 'src/config/global_config';

import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';

@Injectable()
export class DeliveryChellanService {
  constructor(
    @InjectModel(ModelNames.DELIVERY_CHALLANS)
    private readonly deliveryChallansModel: mongoose.Model<DeliveryChallans>,
    @InjectModel(ModelNames.DELIVERY_CHALLAN_ITEMS)
    private readonly deliveryChallanItemsModel: mongoose.Model<DeliveryChallanItems>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: DeliveryChallanCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToDeliveryChallan = [];
      var arrayToDeliveryChallanItems = [];

      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.DELIVERY_CHALLANS },
        {
          $inc: {
            _count: dto.arrayDeliveryChallan.length,
          },
        },
        { new: true, session: transactionSession },
      );

      dto.arrayDeliveryChallan.map((mapItem, index) => {
        var deliveryChallanId = new mongoose.Types.ObjectId();
        arrayToDeliveryChallan.push({
          _id: deliveryChallanId,
          _userId: _userId_,
          _uid:
            resultCounterPurchase._count -
            dto.arrayDeliveryChallan.length +
            (index + 1),
          _deliveryMode: mapItem.deliveryMode,
          _deliveryProviderId:
            mapItem.deliveryProviderId == '' ||
            mapItem.deliveryProviderId == 'nil'
              ? null
              : mapItem.deliveryProviderId,
          _deliveryExicutiveId:
            mapItem.deliveryExecutiveId == '' ||
            mapItem.deliveryExecutiveId == 'nil'
              ? null
              : mapItem.deliveryExecutiveId,
          _rootCauseId: null,
          _description: mapItem.description,
          _referenceUrl: mapItem.referenceUrl,
          _type: mapItem.type,
          _saleType: mapItem.saleType,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        mapItem.arrayDeliveryChallanItems.map((mapItem1) => {
          arrayToDeliveryChallanItems.push({
            _deliveryChallanId: deliveryChallanId,
            _orderSaleItemId: mapItem1.orderSaleItemId,
            _categoryName: mapItem1.categoryName,
            _subCategoryName: mapItem1.subCategoryName,
            _productName: mapItem1.productName,
            _purity: mapItem1.purity,
            _hsnCode: mapItem1.hsnCode,
            _huid: mapItem1.huid,
            _grossWeight: mapItem1.grossWeight,
            _stoneWeight: mapItem1.stoneWeight,
            _netWeight: mapItem1.netWeight,
            _tought: mapItem1.tough,
            _pureWeight: mapItem1.pureWeight,
            _pureWeightHundredPercentage: mapItem1.pureWeightHundredPercentage,
            _unitRate: mapItem1.unitRate,
            _amount: mapItem1.amount,
            _stoneAmount: mapItem1.stoneAmount,
            _totalValue: mapItem1.totalValue,
            _cgst: mapItem1.cgst,
            _sgst: mapItem1.sgst,
            _igst: mapItem1.igst,
            _metalAmountGst: mapItem1.metalAmountGst,
            _stoneAmountGst: mapItem1.stoneAmount,
            _grossAmount: mapItem1.grossAmount,
            _halmarkingCharge: mapItem1.halmarkingCharge,
            _otherCharge: mapItem1.otherCharge,
            _roundOff: mapItem1.roundOff,
            _netTotal: mapItem1.netTotal,
            _tdsReceivable: mapItem1.tdsReceivable,
            _tdsPayable: mapItem1.tdsPayable,
            _netReceivableAmount: mapItem1.netReceivableAmount,
            _cgstHalmarkCharge: mapItem1.cgstHalmarkCharge,
            _cgstOtherCharge: mapItem1.cgstOtherCharge,
            _sgstHalmarkCharge: mapItem1.sgstHalmarkCharge,
            _sgstOtherCharge: mapItem1.sgstOtherCharge,
            _igstHalmarkCharge: mapItem1.igstHalmarkCharge,
            _igstOtherCharge: mapItem1.igstOtherCharge,
            _makingChargeWithHundredPercentage:
              mapItem1.makingChargeWithHundredPercentage,
            _makingChargeAmount: mapItem1.makingChargeAmount,
            _productBarcode: mapItem1.productBarcide,
            _productId:
              mapItem1.productId == '' || mapItem1.productId == 'nil'
                ? null
                : mapItem1.productId,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      });

      var result1 = await this.deliveryChallansModel.insertMany(
        arrayToDeliveryChallan,
        {
          session: transactionSession,
        },
      );
      await this.deliveryChallanItemsModel.insertMany(
        arrayToDeliveryChallanItems,
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

  async deliveryChallanStatusChange(
    dto: DeliveryChallanStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.deliveryChallansModel.updateMany(
        {
          _id: { $in: dto.deliveryChallanIds },
        },
        {
          $set: {
            _rootCauseId:
              dto.rootCauseId == '' || dto.rootCauseId == 'nil'
                ? null
                : dto.rootCauseId,
            _description:
              dto.description == '' || dto.description == 'nil'
                ? null
                : dto.description,
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

  async list(dto: DeliveryChallanListDto) {
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
              { _uid: dto.searchingText },
              { _referenceUrl: dto.searchingText },
            ],
          },
        });
      }
      if (dto.deliveryChallanIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryChallanIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }
      if (dto.deliveryProviderIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryProviderIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _deliveryProviderId: { $in: newSettingsId } },
        });
      }
      if (dto.deliveryExecutiveIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryExecutiveIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _deliveryExicutiveId: { $in: newSettingsId } },
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
      if (dto.createdUserIds.length > 0) {
        var newSettingsId = [];
        dto.createdUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _createdUserId: { $in: newSettingsId } },
        });
      }
      if (dto.userIds.length > 0) {
        var newSettingsId = [];
        dto.userIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _userId: { $in: newSettingsId } } });
      }

      if (dto.types.length > 0) {
        arrayAggregation.push({ $match: { _type: { $in: dto.types } } });
      }
      if (dto.deliveryModes.length > 0) {
        arrayAggregation.push({
          $match: { _deliveryMode: { $in: dto.deliveryModes } },
        });
      }
      if (dto.saleTypes.length > 0) {
        arrayAggregation.push({
          $match: { _saleType: { $in: dto.saleTypes } },
        });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      arrayAggregation.push({ $sort: { _id: -1 } });

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

      if (dto.screenType.includes(100)) {
        const userPipeline = () => {
          const pipeline = [];
          pipeline.push(
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1000,
              dto.responseFormat,
            ),
          );
          const userGlobalGallery = dto.screenType.includes(106);
          if (userGlobalGallery) {
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
                      106,
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
              let: { userId: '$_userId' },
              pipeline: userPipeline(),
              as: 'userDetails',
            },
          },
          {
            $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
          },
        );
      }
      if (dto.screenType.includes(101)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.DELIVERY_PROVIDER,
              let: { deliveryProviderId: '$_deliveryProviderId' },
              pipeline: [
                {
                  $match: { $expr: { $eq: ['$_id', '$$deliveryProviderId'] } },
                },

                new ModelWeightResponseFormat().deliveryProviderTableResponseFormat(
                  1010,
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
      if (dto.screenType.includes(102)) {
        const deliveryExicutiveIdPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: { $expr: { $eq: ['$_id', '$$deliveryExecutiveId'] } },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1020,
              dto.responseFormat,
            ),
          );
          const deliveryExecutiveGlobalGallery = dto.screenType.includes(107);
          if (deliveryExecutiveGlobalGallery) {
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
                      1070,
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
              let: { deliveryExecutiveId: '$_deliveryExicutiveId' },
              pipeline: deliveryExicutiveIdPipeline(),
              as: 'deliveryExecutiveDetails',
            },
          },
          {
            $unwind: {
              path: '$deliveryExecutiveDetails',
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
                {
                  $match: { $expr: { $eq: ['$_id', '$$rootCauseId'] } },
                },
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
      if (dto.screenType.includes(104)) {
        const createdUserPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: { $expr: { $eq: ['$_id', '$$createdUserId'] } },
            },
            new ModelWeightResponseFormat().userTableResponseFormat(
              1040,
              dto.responseFormat,
            ),
          );

          const createdUserGlobalGallery = dto.screenType.includes(108);
          if (createdUserGlobalGallery) {
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
                      1080,
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
              let: { createdUserId: '$_createdUserId' },
              pipeline: createdUserPipeline(),
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

      if (dto.screenType.includes(105)) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.DELIVERY_CHALLAN_ITEMS,
            let: { deliveryChallanId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $eq: ['$_deliveryChallanId', '$$deliveryChallanId'],
                  },
                },
              },

              new ModelWeightResponseFormat().deliveryChellanTableResponseFormat(
                1050,
                dto.responseFormat,
              ),
            ],
            as: 'deliveryChallanItems',
          },
        });
      }
      var result = await this.deliveryChallansModel
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

        var resultTotalCount = await this.deliveryChallansModel
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
