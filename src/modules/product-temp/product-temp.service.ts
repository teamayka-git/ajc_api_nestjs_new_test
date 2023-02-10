import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import {
  ProductTempCreateDto,
  ProductTempEditDto,
  ProductTempListDto,
  ProductTempStatusChangeDto,
} from './product_temp.dto';
import * as mongoose from 'mongoose';
import { ProductTemps } from 'src/tableModels/product_temps.model';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Counters } from 'src/tableModels/counters.model';
import { GlobalConfig } from 'src/config/global_config';
import { BarCodeQrCodePrefix } from 'src/common/barcode_qrcode_prefix';
import { StringUtils } from 'src/utils/string_utils';
import { ProductTempStoneLinkings } from 'src/tableModels/product_temp_stone_linkings.model';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';

@Injectable()
export class ProductTempService {
  constructor(
    @InjectModel(ModelNames.PRODUCT_TEMPS)
    private readonly productTempModel: mongoose.Model<ProductTemps>,
    @InjectModel(ModelNames.PRODUCT_STONE_LINKING_TEMPS)
    private readonly productTempStoneLinkingModel: mongoose.Model<ProductTempStoneLinkings>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: ProductTempCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToProductTemp = [];
      var arrayToProductTempStoneLinking = [];
      var responseArray = [];
      var resultCounterProduct = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.PRODUCTS },
        {
          $inc: {
            _count: dto.array.length,
          },
        },
        { new: true, session: transactionSession },
      );

console.log("___hhh1 ");
      dto.array.map((mapItem, index) => {
        var productTempId = new mongoose.Types.ObjectId();

        var autoIncrementNumber = resultCounterProduct._count - index;
        var barcode =
          BarCodeQrCodePrefix.BULK_GENERATED_PRODUCT_AND_INVOICE +
          new StringUtils().intToDigitString(autoIncrementNumber, 8);
          dto.array[index]['productTempId'] = productTempId.toString();
          dto.array[index]['barcode'] = barcode;
        arrayToProductTemp.push({
          _id: productTempId,
          _name: mapItem.name,
          _designUid: mapItem.designUid,

          _generatedProductId: null,
          _designerId: mapItem.designId == '' ? null : mapItem.designId,
          _shopId: mapItem.shopId == '' ? null : mapItem.shopId,
          _orderItemId: mapItem.orderItemId == '' ? null : mapItem.orderItemId,
          _factoryTransferItemId:
            mapItem.factoryTransferItemId == ''
              ? null
              : mapItem.factoryTransferItemId,
          _grossWeight: mapItem.grossWeight,
          _barcode: barcode,
          _categoryId: mapItem.categoryId == '' ? null : mapItem.categoryId,
          _subCategoryId:
            mapItem.subCategoryId == '' ? null : mapItem.subCategoryId,
          _groupId: mapItem.groupId == '' ? null : mapItem.groupId,
          _type: mapItem.type,
          _purity: mapItem.purity,
          _hmSealingStatus: mapItem.hmSealingStatus,
          _totalStoneWeight: mapItem.totalStoneWeight,
          _totalStoneAmount: mapItem.totalStoneAmount,
          _netWeight: mapItem.netWeight,
          _huId: [],
          _eCommerceStatus: mapItem.ecommerceStatus,
          _moldNumber: mapItem.moldNumber,
          _isStone: mapItem.isStone,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        mapItem.arrayStoneLinking.forEach((elementStoneItem) => {
          arrayToProductTempStoneLinking.push({
            _productTempId: productTempId,
            _stoneId:
              elementStoneItem.stoneId == '' ? null : elementStoneItem.stoneId,
            _stoneColourId:
              elementStoneItem.stoneColorId == ''
                ? null
                : elementStoneItem.stoneColorId,
            _stoneWeight: elementStoneItem.stoneWeight,
            _stoneAmount: elementStoneItem.stoneAmount,
            _quantity: elementStoneItem.quantity,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      });

      var productTemp = await this.productTempModel.insertMany(
        arrayToProductTemp,
        {
          session: transactionSession,
        },
      );

      await this.productTempStoneLinkingModel.insertMany(
        arrayToProductTempStoneLinking,
        {
          session: transactionSession,
        },
      );

      const responseJSON = {
        message: 'success',
        data: dto,
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

  async edit(dto: ProductTempEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.productTempModel.findOneAndUpdate(
        {
          _id: dto.productTempId,
        },
        {
          $set: {
            _name: dto.name,
            _designUid: dto.designUid,
            _designerId: dto.designId == '' ? null : dto.designId,
            _shopId: dto.shopId == '' ? null : dto.shopId,
            _orderItemId: dto.orderItemId == '' ? null : dto.orderItemId,
            _factoryTransferItemId:
              dto.factoryTransferItemId == ''
                ? null
                : dto.factoryTransferItemId,
            _grossWeight: dto.grossWeight,

            _categoryId: dto.categoryId == '' ? null : dto.categoryId,
            _subCategoryId: dto.subCategoryId == '' ? null : dto.subCategoryId,
            _groupId: dto.groupId == '' ? null : dto.groupId,
            _type: dto.type,
            _purity: dto.purity,
            _hmSealingStatus: dto.hmSealingStatus,
            _totalStoneWeight: dto.totalStoneWeight,
            _totalStoneAmount: dto.totalStoneAmount,
            _netWeight: dto.netWeight,

            _eCommerceStatus: dto.ecommerceStatus,
            _moldNumber: dto.moldNumber,
            _isStone: dto.isStone,

            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );
      var arrayToProductTempStoneLinking = [];
      dto.arrayNewStoneLinking.forEach((elementStoneItem) => {
        arrayToProductTempStoneLinking.push({
          _productTempId: dto.productTempId,
          _stoneId:
            elementStoneItem.stoneId == '' ? null : elementStoneItem.stoneId,
          _stoneColourId:
            elementStoneItem.stoneColorId == ''
              ? null
              : elementStoneItem.stoneColorId,
          _stoneWeight: elementStoneItem.stoneWeight,
          _stoneAmount: elementStoneItem.stoneAmount,
          _quantity: elementStoneItem.quantity,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      if (arrayToProductTempStoneLinking.length != 0) {
        await this.productTempStoneLinkingModel.insertMany(
          arrayToProductTempStoneLinking,
          {
            session: transactionSession,
          },
        );
      }

      if (dto.deleteStoneLinkingIds.length != 0) {
        await this.productTempStoneLinkingModel.updateMany(
          {
            _id: { $in: dto.deleteStoneLinkingIds },
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
  async status_change(dto: ProductTempStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.productTempModel.updateMany(
        {
          _id: { $in: dto.productTempIds },
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

  async list(dto: ProductTempListDto) {
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
              { _designUid: dto.searchingText },
              { _barcode: dto.searchingText },
            ],
          },
        });
      }
      if (dto.productTempIds.length > 0) {
        var newSettingsId = [];
        dto.productTempIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }
      if (dto.designerIds.length > 0) {
        var newSettingsId = [];
        dto.designerIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _designerId: { $in: newSettingsId } },
        });
      }
      if (dto.shopIds.length > 0) {
        var newSettingsId = [];
        dto.shopIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _shopId: { $in: newSettingsId } } });
      }
      if (dto.orderItemIds.length > 0) {
        var newSettingsId = [];
        dto.orderItemIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _orderItemId: { $in: newSettingsId } },
        });
      }

      if (dto.categoryIds.length > 0) {
        var newSettingsId = [];
        dto.categoryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _categoryId: { $in: newSettingsId } },
        });
      }
      if (dto.subCategoryIds.length > 0) {
        var newSettingsId = [];
        dto.subCategoryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _subCategoryId: { $in: newSettingsId } },
        });
      }
      if (dto.groupIds.length > 0) {
        var newSettingsId = [];
        dto.groupIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _groupId: { $in: newSettingsId } } });
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

          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      arrayAggregation.push(
        new ModelWeightResponseFormat().productTempTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(100)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.PRODUCTS,
              let: { designId: '$_designerId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$designId'] },
                  },
                },
                new ModelWeightResponseFormat().productTableResponseFormat(
                  1000,
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
      if (dto.screenType.includes(101)) {
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
                  1010,
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
      if (dto.screenType.includes(102)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderItemId: '$_orderItemId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$orderItemId'] },
                  },
                },
                new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
                  1020,
                  dto.responseFormat,
                ),
              ],
              as: 'orderItemDetails',
            },
          },
          {
            $unwind: {
              path: '$orderItemDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (dto.screenType.includes(103)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GROUP_MASTERS,
              let: { groupId: '$_groupId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$groupId'] },
                  },
                },
                new ModelWeightResponseFormat().groupMasterTableResponseFormat(
                  1030,
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
      if (dto.screenType.includes(104)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.CATEGORIES,
              let: { categoryId: '$_categoryId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$categoryId'] },
                  },
                },
                new ModelWeightResponseFormat().categoryTableResponseFormat(
                  1040,
                  dto.responseFormat,
                ),
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
      if (dto.screenType.includes(105)) {
        arrayAggregation.push(
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
                  1050,
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

      if (dto.screenType.includes(106)) {
        const productTempStoneLinkingPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_productTempId', '$$productTempId'] },
              },
            },
            new ModelWeightResponseFormat().productTempStoneLinkingTableResponseFormat(
              1060,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(107)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.STONE,
                  let: { stoneId: '$_stoneId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$stoneId'] },
                      },
                    },
                    new ModelWeightResponseFormat().stoneMasterTableResponseFormat(
                      1070,
                      dto.responseFormat,
                    ),
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
            );
          }
          if (dto.screenType.includes(108)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.COLOUR_MASTERS,
                  let: { stoneColorId: '$_stoneColourId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$stoneColorId'] },
                      },
                    },
                    new ModelWeightResponseFormat().colourMasterTableResponseFormat(
                      1080,
                      dto.responseFormat,
                    ),
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
            );
          }

          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.PRODUCT_STONE_LINKING_TEMPS,
            let: { productTempId: '$_id' },
            pipeline: productTempStoneLinkingPipeline(),
            as: 'stoneLinkings',
          },
        });
      }

      var result = await this.productTempModel
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

        var resultTotalCount = await this.productTempModel
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
