import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { Counters } from 'src/tableModels/counters.model';
import { HalmarkBundles } from 'src/tableModels/halmark_bundles.model';
import { HalmarkOrderItems } from 'src/tableModels/halmark_order_items.model';
import { HalmarkOrderMain } from 'src/tableModels/halmark_order_mains.model';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import {
  AddTestPiecesDto,
  AssignHmCenterHalmarkBundleDto,
  BypassMainOrderDto,
  ListDto,
  ListPendingHmRequestMainDto,
  MakeNewHalmarkBundleDto,
  UpdateHmBundleWorkStatusDto,
  UpdateHmItemsValueDto,
} from './halmark_request.dto';

@Injectable()
export class HalmarkRequestService {
  constructor(
    @InjectModel(ModelNames.HALMARK_BUNDLES)
    private readonly halmarkBundlesModel: mongoose.Model<HalmarkBundles>,
    @InjectModel(ModelNames.HALMARK_ORDER_MAIN)
    private readonly halmarkBundlesMainModel: mongoose.Model<HalmarkOrderMain>,
    @InjectModel(ModelNames.HALMARK_ORDER_ITEMS)
    private readonly halmarkBundlesItemsModel: mongoose.Model<HalmarkOrderItems>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleMainModel: mongoose.Model<OrderSalesMain>,

    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: mongoose.Model<OrderSaleHistories>,
    @InjectModel(ModelNames.BRANCHES)
    private readonly countersModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async makeNewHalmarkBundle(dto: MakeNewHalmarkBundleDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var orderIds = [];
      var hmMainIds = [];
      var arrayToOrderHistories = [];
      dto.items.forEach((element) => {
        orderIds.push(element.orderSaleId);
        hmMainIds.push(element.hmMainId);
      });

      var resultCheckHmMain = await this.halmarkBundlesMainModel.find({
        _id: { $in: hmMainIds },
        _status: 1,
        _workStatus: 0,
      });
      if (resultCheckHmMain.length != hmMainIds.length) {
        throw new HttpException(
          'Already created hm bundle',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      var resultCounterHm = await this.countersModel.findOneAndUpdate(
        { _tableName: ModelNames.HALMARK_BUNDLES },
        {
          $inc: {
            _count: 1,
          },
        },
        { new: true, session: transactionSession },
      );
      var uid = resultCounterHm._count;

      dto.items.forEach((element) => {
        arrayToOrderHistories.push({
          _orderSaleId: element.orderSaleId,
          _userId: null,
          _type: 115,
          _deliveryProviderId: null,
          _deliveryCounterId: null,
          _shopId: null,
          _orderSaleItemId: null,
          _description: `UID: ${uid}`,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      });
      const halmarkBundlesModelMongo = new this.halmarkBundlesModel({
        _hmCenter: null,
        _uid: uid,
        _workStatus: 0,
        _acceptedAt: -1,
        _finishedAt: -1,
        _rootCause: '',
        _rootCauseId: null,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: 0,
        _status: 1,
      });
      var halmarkBundlesModelMongoFinal = await halmarkBundlesModelMongo.save({
        session: transactionSession,
      });

      await this.halmarkBundlesMainModel.updateMany(
        {
          _id: { $in: hmMainIds },
        },
        {
          $set: {
            _workStatus: 0,
            _updatedAt: dateTime,
            _updatedUserId: _userId_,
            _hmBundleId: halmarkBundlesModelMongoFinal._id,
          },
        },
        { new: true, session: transactionSession },
      );
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

  async assignHmCenterHalmarkBundle(
    dto: AssignHmCenterHalmarkBundleDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultHmBundles = await this.halmarkBundlesModel.find({
        _id: { $in: dto.hmBundleIds },
        _hmCenter: null,
        _status: 1,
        _workStatus: 0,
      });
      if (resultHmBundles.length != dto.hmBundleIds.length) {
        throw new HttpException(
          'Already linked with hm center',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.halmarkBundlesModel.updateMany(
        {
          _id: { $in: dto.hmBundleIds },
        },
        {
          $set: {
            _hmCenter: dto.hmCenterId,
            _updatedAt: dateTime,
            _updatedUserId: _userId_,
          },
        },
        { new: true, session: transactionSession },
      );

      var hmBundleMongoIds = [];

      dto.hmBundleIds.forEach((element) => {
        hmBundleMongoIds.push(new mongoose.Types.ObjectId(element));
      });

      var resultHmBundlesMongo = await this.halmarkBundlesModel.aggregate([
        {
          $match: {
            _id: { $in: hmBundleMongoIds },
          },
        },
        {
          $lookup: {
            from: ModelNames.HALMARK_ORDER_MAIN,
            let: { mainId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_hmBundleId', '$$mainId'] },
                },
              },
            ],
            as: 'hmMain',
          },
        },
      ]);

      var arrayToOrderHistories = [];
      resultHmBundlesMongo.forEach((elementBundles) => {
        elementBundles.hmMain.forEach((elementBundlesMain) => {
          arrayToOrderHistories.push({
            _orderSaleId: elementBundlesMain._orderSaleMainId,
            _userId: null,
            _type: 116,
            _deliveryProviderId: null,
            _deliveryCounterId: null,
            _shopId: null,
            _orderSaleItemId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });
      });
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

  async listPendingHmRequestMain(dto: ListPendingHmRequestMainDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _orderUid: new RegExp(dto.searchingText, 'i') }],
          },
        });
      }

      if (dto.salesOrderIds.length > 0) {
        var newSettingsId = [];
        dto.salesOrderIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _orderSaleMainId: { $in: newSettingsId } },
        });
      }

      if (dto.hmMainIds.length > 0) {
        var newSettingsId = [];
        dto.hmMainIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _id: { $in: newSettingsId } },
        });
      }
      if (dto.salesOrderUids.length > 0) {
        arrayAggregation.push({
          $match: { _orderUid: { $in: dto.salesOrderUids } },
        });
      }

      if (dto.workStatus.length > 0) {
        arrayAggregation.push({
          $match: { _workStatus: { $in: dto.workStatus } },
        });
      }
      if (dto.type.length > 0) {
        arrayAggregation.push({ $match: { _type: { $in: dto.type } } });
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
              _uid: dto.sortOrder,
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
        new ModelWeightResponseFormat().hmMainTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(100)) {
        const orderSalePipeline = () => {
          const pipeline = [];
          pipeline.push(
            { $match: { $expr: { $eq: ['$_id', '$$orderSaleMainId'] } } },
            new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
              1000,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(101)) {
            const orderSaleShopOrderHeadPipeline = () => {
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
              if (dto.screenType.includes(102)) {
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
                          1020,
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

          if (dto.screenType.includes(103)) {
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
                  1030,
                  dto.responseFormat,
                ),
              );

              const isorderSaledocumentsGlobalGallery =
                dto.screenType.includes(104);

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

            pipeline.push({
              $lookup: {
                from: ModelNames.ORDER_SALES_DOCUMENTS,
                let: { orderSaleIdId: '$_id' },
                pipeline: orderSaleDocumentsPipeline(),
                as: 'orderSaleDocumentList',
              },
            });
          }

          if (dto.screenType.includes(105)) {
            const orderSaleShopPipeline = () => {
              const pipeline = [];
              pipeline.push(
                { $match: { $expr: { $eq: ['$_id', '$$shopId'] } } },
                new ModelWeightResponseFormat().shopTableResponseFormat(
                  1050,
                  dto.responseFormat,
                ),
              );
              const isorderSaleshopGlobalGallery = dto.screenType.includes(106);
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

            pipeline.push(
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

          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_MAIN,
              let: { orderSaleMainId: '$_orderSaleMainId' },
              pipeline: orderSalePipeline(),
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

      if (dto.screenType.includes(107)) {
        const hmOrderSaleItemsPipeline = () => {
          var pipeline = [];
          pipeline.push({
            $match: {
              $expr: { $eq: ['$_id', '$$osItemId'] },
            },
          });

          ////

          const isorderSaleItemdocuments = dto.screenType.includes(108);

          if (isorderSaleItemdocuments) {
            const orderSaleItemDocumentsPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_orderSaleItemId', '$$orderSaleItemId'] },
                  },
                },
                new ModelWeightResponseFormat().orderSaleItemDocumentsTableResponseFormat(
                  1080,
                  dto.responseFormat,
                ),
              );

              const isorderSaledocumentsGlobalGallery =
                dto.screenType.includes(109);

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
              return pipeline;
            };

            pipeline.push({
              $lookup: {
                from: ModelNames.ORDER_SALE_ITEM_DOCUMENTS,
                let: { orderSaleItemId: '$_id' },
                pipeline: orderSaleItemDocumentsPipeline(),
                as: 'orderSaleItemDocumentList',
              },
            });
          }

          const isorderSalesItemsProduct = dto.screenType.includes(110);
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
                      1100,
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

          const isorderSalesItemsDesign = dto.screenType.includes(111);
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
                      1110,
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

          const isorderSalesItemsSubCategory = dto.screenType.includes(112);
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
                  1120,
                  dto.responseFormat,
                ),
              );

              const isorderSalesItemsSubCategoryCategory =
                dto.screenType.includes(113);
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
                      1130,
                      dto.responseFormat,
                    ),
                  );

                  const isorderSalesItemsSubCategoryCategoryGroup =
                    dto.screenType.includes(114);
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
                              1140,
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

          //////

          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.HALMARK_ORDER_ITEMS,
            let: { hmMainId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $eq: ['$_hmMainId', '$$hmMainId'],
                  },
                },
              },
              new ModelWeightResponseFormat().hmMainItemsTableResponseFormat(
                1070,
                dto.responseFormat,
              ),
              {
                $lookup: {
                  from: ModelNames.ORDER_SALES_ITEMS,
                  let: { osItemId: '$_orderSaleItemId' },
                  pipeline: hmOrderSaleItemsPipeline(),
                  as: 'hmOrderItemDetails',
                },
              },
              {
                $unwind: {
                  path: '$hmOrderItemDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: 'hmItems',
          },
        });
      }

      var result = await this.halmarkBundlesMainModel
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

        var resultTotalCount = await this.halmarkBundlesMainModel
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

  async list(dto: ListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _orderUid: new RegExp(dto.searchingText, 'i') }],
          },
        });
      }

      if (dto.bundleIds.length > 0) {
        var newSettingsId = [];
        dto.bundleIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _id: { $in: newSettingsId } },
        });
      }

      if (dto.rootCauseIds.length > 0) {
        var newSettingsId = [];
        dto.rootCauseIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _rootCause: { $in: newSettingsId } },
        });
      }

      if (dto.hmCenterIds.length > 0) {
        var newSettingsId = [];
        dto.hmCenterIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _hmCenter: { $in: newSettingsId } },
        });
      }

      if (dto.uids.length > 0) {
        arrayAggregation.push({
          $match: { _uid: { $in: dto.uids } },
        });
      }

      if (dto.workStatus.length > 0) {
        arrayAggregation.push({
          $match: { _workStatus: { $in: dto.workStatus } },
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
              _uid: dto.sortOrder,
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
        new ModelWeightResponseFormat().hmBundleTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(90)) {
        const HmMainPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: { $eq: ['$_hmBundleId', '$$hmBundleId'] },
              },
            },
            new ModelWeightResponseFormat().hmMainTableResponseFormat(
              900,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(100)) {
            const orderSalePipeline = () => {
              const pipeline = [];
              pipeline.push(
                { $match: { $expr: { $eq: ['$_id', '$$orderSaleMainId'] } } },
                new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
                  1000,
                  dto.responseFormat,
                ),
              );

              if (dto.screenType.includes(101)) {
                const orderSaleShopOrderHeadPipeline = () => {
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
                  if (dto.screenType.includes(102)) {
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
                              1020,
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

              if (dto.screenType.includes(103)) {
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
                      1030,
                      dto.responseFormat,
                    ),
                  );

                  const isorderSaledocumentsGlobalGallery =
                    dto.screenType.includes(104);

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

                pipeline.push({
                  $lookup: {
                    from: ModelNames.ORDER_SALES_DOCUMENTS,
                    let: { orderSaleIdId: '$_id' },
                    pipeline: orderSaleDocumentsPipeline(),
                    as: 'orderSaleDocumentList',
                  },
                });
              }

              if (dto.screenType.includes(105)) {
                const orderSaleShopPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    { $match: { $expr: { $eq: ['$_id', '$$shopId'] } } },
                    new ModelWeightResponseFormat().shopTableResponseFormat(
                      1050,
                      dto.responseFormat,
                    ),
                  );
                  const isorderSaleshopGlobalGallery =
                    dto.screenType.includes(106);
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

                pipeline.push(
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

              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.ORDER_SALES_MAIN,
                  let: { orderSaleMainId: '$_orderSaleMainId' },
                  pipeline: orderSalePipeline(),
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

          if (dto.screenType.includes(107)) {
            const hmOrderSaleItemsPipeline = () => {
              var pipeline = [];
              pipeline.push({
                $match: {
                  $expr: { $eq: ['$_id', '$$osItemId'] },
                },
              });

              ////

              const isorderSaleItemdocuments = dto.screenType.includes(108);

              if (isorderSaleItemdocuments) {
                const orderSaleItemDocumentsPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        _status: 1,
                        $expr: {
                          $eq: ['$_orderSaleItemId', '$$orderSaleItemId'],
                        },
                      },
                    },
                    new ModelWeightResponseFormat().orderSaleItemDocumentsTableResponseFormat(
                      1080,
                      dto.responseFormat,
                    ),
                  );

                  const isorderSaledocumentsGlobalGallery =
                    dto.screenType.includes(109);

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
                  return pipeline;
                };

                pipeline.push({
                  $lookup: {
                    from: ModelNames.ORDER_SALE_ITEM_DOCUMENTS,
                    let: { orderSaleItemId: '$_id' },
                    pipeline: orderSaleItemDocumentsPipeline(),
                    as: 'orderSaleItemDocumentList',
                  },
                });
              }

              const isorderSalesItemsProduct = dto.screenType.includes(110);
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
                          1100,
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

              const isorderSalesItemsDesign = dto.screenType.includes(111);
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
                          1110,
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

              const isorderSalesItemsSubCategory = dto.screenType.includes(112);
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
                      1120,
                      dto.responseFormat,
                    ),
                  );

                  const isorderSalesItemsSubCategoryCategory =
                    dto.screenType.includes(113);
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
                          1130,
                          dto.responseFormat,
                        ),
                      );

                      const isorderSalesItemsSubCategoryCategoryGroup =
                        dto.screenType.includes(114);
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
                                  1140,
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

              //////

              return pipeline;
            };

            pipeline.push({
              $lookup: {
                from: ModelNames.HALMARK_ORDER_ITEMS,
                let: { hmMainId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      _status: 1,
                      $expr: {
                        $eq: ['$_hmMainId', '$$hmMainId'],
                      },
                    },
                  },
                  new ModelWeightResponseFormat().hmMainItemsTableResponseFormat(
                    1070,
                    dto.responseFormat,
                  ),
                  {
                    $lookup: {
                      from: ModelNames.ORDER_SALES_ITEMS,
                      let: { osItemId: '$_orderSaleItemId' },
                      pipeline: hmOrderSaleItemsPipeline(),
                      as: 'hmOrderItemDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$hmOrderItemDetails',
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                ],
                as: 'hmItems',
              },
            });
          }

          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.HALMARK_ORDER_MAIN,
            let: { hmBundleId: '$_id' },
            pipeline: HmMainPipeline(),
            as: 'hmMains',
          },
        });
      }

      if (dto.screenType.includes(91)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
              let: { rootCauseId: '$_rootCauseId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$rootCauseId'] },
                  },
                },
                new ModelWeightResponseFormat().rootcauseTableResponseFormat(
                  910,
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

      if (dto.screenType.includes(92)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.HALMARK_CENTERS,
              let: { hmCenterId: '$_hmCenter' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$hmCenterId'] },
                  },
                },
                new ModelWeightResponseFormat().hmCenterTableResponseFormat(
                  920,
                  dto.responseFormat,
                ),
              ],
              as: 'hmCenterDetails',
            },
          },
          {
            $unwind: {
              path: '$hmCenterDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      var result = await this.halmarkBundlesMainModel
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

        var resultTotalCount = await this.halmarkBundlesMainModel
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

  async updateHmItemsValue(dto: UpdateHmItemsValueDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToOrderHistories = [];

      for (var i = 0; i < dto.items.length; i++) {
        await this.halmarkBundlesItemsModel.updateMany(
          {
            _id: dto.items[i].hmItemId,
          },
          {
            $set: {
              _huid: dto.items[i].huid,
              _weight: dto.items[i].weight,
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
            },
          },
          { new: true, session: transactionSession },
        );

        arrayToOrderHistories.push({
          _orderSaleId: dto.items[i].orderSaleId,
          _userId: null,
          _type: 117,
          _deliveryProviderId: null,
          _deliveryCounterId: null,
          _shopId: null,
          _orderSaleItemId: null,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
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

  async updateHmBundleWorkStatus(
    dto: UpdateHmBundleWorkStatusDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var hmBundlesIdsMongo = [];
      dto.hmBundleIds.forEach((elementMongoId) => {
        hmBundlesIdsMongo.push(new mongoose.Types.ObjectId(elementMongoId));
      });

      var resultHmBundle = await this.halmarkBundlesModel.aggregate([
        {
          $match: {
            _id: { $in: hmBundlesIdsMongo },
            _workStatus: dto.fromWorkStatus,
            _status: 1,
          },
        },

        {
          $lookup: {
            from: ModelNames.HALMARK_ORDER_MAIN,
            let: { hmBundleId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_hmBundleId', '$$hmBundleId'] },
                },
              },
            ],
            as: 'hmMains',
          },
        },
      ]);
      if (resultHmBundle.length != dto.hmBundleIds.length) {
        throw new HttpException(
          'Bundle already updated',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.halmarkBundlesModel.updateMany(
        {
          _id: { $in: dto.hmBundleIds },
        },
        {
          $set: {
            _workStatus: dto.workStatus,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );

      var arrayToOrderHistories = [];

      resultHmBundle.forEach((elementBundles) => {
        elementBundles.hmMains.forEach((elementOsMain) => {
          arrayToOrderHistories.push({
            _orderSaleId: elementOsMain._orderSaleMainId,
            _userId: null,
            _type: dto.orderSaleHistoryType,
            _deliveryProviderId: null,
            _deliveryCounterId: null,
            _shopId: null,
            _orderSaleItemId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });
      });

      if (dto.workStatus == 3) {
        var orderIds = [];
        resultHmBundle.forEach((elementBundles) => {
          elementBundles.hmMains.forEach((elementOsMain) => {
            orderIds.push(elementOsMain._orderSaleMainId);
            arrayToOrderHistories.push({
              _orderSaleId: elementOsMain._orderSaleMainId,
              _userId: null,
              _type: 6,
              _deliveryProviderId: null,
              _deliveryCounterId: null,
              _shopId: null,
              _orderSaleItemId: null,
              _description: '',
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _status: 1,
            });
          });
        });

        await this.orderSaleMainModel.updateMany(
          {
            _id: { $in: orderIds },
          },
          {
            $set: {
              _workStatus: 6,
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
            },
          },
          { new: true, session: transactionSession },
        );
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
  async addTestPieces(dto: AddTestPiecesDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToMainList = [];
      var arrayToItemList = [];

      dto.mainList.forEach((elementMainList) => {
        var mainTableId = new mongoose.Types.ObjectId();
        arrayToMainList.push({
          _id: mainTableId,
          _hmBundleId: dto.hmBundleId,
          _orderUid: '',
          _orderSaleMainId: null,
          _workStatus: 1,
          _type: 1,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
        elementMainList.itemList.forEach((elementItem) => {
          arrayToItemList.push({
            _orderSaleId: null,
            _hmMainId: mainTableId,
            _orderSaleItemId: null,
            _subCategoryId: elementItem.subCategoryId,
            _huid: '',
            _weight: elementItem.weight,
            _type: 1,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      });
      if (arrayToMainList.length != 0) {
        await this.halmarkBundlesMainModel.insertMany(arrayToMainList, {
          session: transactionSession,
        });
      }

      if (arrayToItemList.length != 0) {
        await this.halmarkBundlesItemsModel.insertMany(arrayToItemList, {
          session: transactionSession,
        });
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

  async bypassMainOrder(dto: BypassMainOrderDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var ordrSaleIds = [];
      var hmMainTableIds = [];
      dto.itemList.forEach((element) => {
        ordrSaleIds.push(element.orderSaleId);
        hmMainTableIds.push(element.hmMainId);
      });

      await this.halmarkBundlesMainModel.updateMany(
        {
          _id: { $in: hmMainTableIds },
        },
        {
          $set: {
            _workStatus: 3,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );

      await this.orderSaleMainModel.updateMany(
        {
          _id: { $in: ordrSaleIds },
        },
        {
          $set: {
            _workStatus: 6,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );

      var arrayToOrderHistories = [];

      ordrSaleIds.forEach((element) => {
        arrayToOrderHistories.push({
          _orderSaleId: element,
          _userId: null,
          _type: 9,
          _deliveryProviderId: null,
          _deliveryCounterId: null,
          _shopId: null,
          _orderSaleItemId: null,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      });

      await this.orderSaleHistoriesModel.insertMany(arrayToOrderHistories, {
        session: transactionSession,
      });

      if (dto.isAnyItemExist == 0) {
        await this.halmarkBundlesModel.updateMany(
          {
            _id: dto.hmBundleId,
          },
          {
            $set: {
              _workStatus: 4,
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
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
}
