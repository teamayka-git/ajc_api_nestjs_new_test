import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Products } from 'src/tableModels/products.model';
import * as mongoose from 'mongoose';
import { GlobalConfig } from 'src/config/global_config';
import { Counters } from 'src/tableModels/counters.model';
import { StringUtils } from 'src/utils/string_utils';
import { ProductStoneLinkings } from 'src/tableModels/productStoneLinkings.model';
import { SubCategories } from 'src/tableModels/sub_categories.model';
import {
  ProductCreateDto,
  ProductEcommerceStatusChangeDto,
  ProductListDto,
} from './products.dto';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { PhotographerRequests } from 'src/tableModels/photographer_requests.model';
import { HalmarkingRequests } from 'src/tableModels/halmarking_requests.model';
import { Departments } from 'src/tableModels/departments.model';
import { BarCodeQrCodePrefix } from 'src/common/barcode_qrcode_prefix';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { OrderSalesItems } from 'src/tableModels/order_sales_items.model';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(ModelNames.PRODUCTS)
    private readonly productModel: Model<Products>,
    @InjectModel(ModelNames.PRODUCT_STONE_LINKIGS)
    private readonly productStoneLinkingsModel: Model<ProductStoneLinkings>,
    @InjectModel(ModelNames.SUB_CATEGORIES)
    private readonly subCategoriesModel: Model<SubCategories>,
    @InjectModel(ModelNames.DEPARTMENT)
    private readonly departmentsModel: Model<Departments>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: Model<Counters>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleMainModel: Model<OrderSalesMain>,
    @InjectModel(ModelNames.ORDER_SALES_ITEMS)
    private readonly orderSaleItemsModel: Model<OrderSalesItems>,
    @InjectModel(ModelNames.PHOTOGRAPHER_REQUESTS)
    private readonly photographerRequestModel: Model<PhotographerRequests>,
    @InjectModel(ModelNames.HALMARKING_REQUESTS)
    private readonly halmarkRequestModel: Model<HalmarkingRequests>,

    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: Model<OrderSaleHistories>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: ProductCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToProducts = [];

      var arrayStonesLinkings = [];
      var arrayOrderSaleHistory = [];
      var arraySubCategoryidsMDB = [];

      dto.arrayItems.forEach((it) => {
        arraySubCategoryidsMDB.push(
          new mongoose.Types.ObjectId(it.subCategoryId),
        );
      });

      var resultSubcategory = await this.subCategoriesModel.aggregate([
        {
          $match: {
            _id: { $in: arraySubCategoryidsMDB },
          },
        },
        {
          $project: {
            _categoryId: 1,
            _code: 1,
          },
        },
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
              { $project: { _groupId: 1 } },

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
                    {
                      $project: {
                        _purity: 1,
                      },
                    },
                  ],
                  as: 'groupDetails',
                },
              },
              {
                $unwind: {
                  path: '$groupDetails',
                },
              },
            ],
            as: 'categoryDetails',
          },
        },
        {
          $unwind: {
            path: '$categoryDetails',
          },
        },
      ]);

      if (resultSubcategory.length == 0) {
        throw new HttpException(
          'subCategory Is Empty',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var resultProduct = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.PRODUCTS },
        {
          $inc: {
            _count: dto.arrayItems.length,
          },
        },
        { new: true, session: transactionSession },
      );

      var resultPhotographer = await this.departmentsModel.aggregate([
        {
          $match: {
            _code: 1004,
            _status: 1,
          },
        },
        { $project: { _id: 1 } },
        {
          $lookup: {
            from: ModelNames.EMPLOYEES,
            let: { departmentId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_departmentId', '$$departmentId'] },
                },
              },

              {
                $lookup: {
                  from: ModelNames.PHOTOGRAPHER_REQUESTS,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        _status: 1,
                        $expr: { $eq: ['$_userId', '$$userId'] },
                      },
                    },
                    { $project: { _id: 1 } },
                  ],
                  as: 'photographyRequestList',
                },
              },
              {
                $project: {
                  _userId: 1,
                  photographyRequestCount: {
                    $size: '$photographyRequestList',
                  },
                },
              },
            ],
            as: 'employeeList',
          },
        },
        {
          $unwind: {
            path: '$employeeList',
            preserveNullAndEmptyArrays: true,
          },
        },
        { $sort: { 'employeeList.photographyRequestCount': 1 } },
        { $limit: 1 },
        {
          $group: {
            _id: '$_id',
            employeeList: {
              $push: '$employeeList',
            },
          },
        },
      ]);
      if (resultPhotographer.length == 0) {
        throw new HttpException(
          'Photography department not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (resultPhotographer[0].employeeList.length == 0) {
        throw new HttpException(
          'Photography employees not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      for (var i = 0; i < dto.arrayItems.length; i++) {
        let subCategoryIndex = resultSubcategory.findIndex(
          (it) => it._id == dto.arrayItems[i].subCategoryId,
        );
        if (subCategoryIndex == -1) {
          throw new HttpException(
            'Subcategory mismatch',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        var autoIncrementNumber = resultProduct._count - i;
        var productId = new mongoose.Types.ObjectId();
        var shopId = dto.shopId;
        var orderId = dto.orderId;
        var orderItemId = dto.arrayItems[i].orderItemId;
        if (shopId == '' || shopId == 'nil') {
          shopId = null;
        }
        if (orderId == '' || orderId == 'nil') {
          orderId = null;
        }
        if (orderItemId == '' || orderItemId == 'nil') {
          orderItemId = null;
        }

        dto.arrayItems[i].stonesArray.map((mapItem1) => {
          arrayStonesLinkings.push({
            _productId: productId,
            _stoneId: mapItem1.stoneId,
            _stoneColourId: mapItem1.colourId,
            _stoneWeight: mapItem1.stoneWeight,
            _quantity: mapItem1.quantity,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });

        arrayToProducts.push({
          _id: productId,
          _name: dto.arrayItems[i].name,
          _designerId: `${resultSubcategory[subCategoryIndex]._code}-${autoIncrementNumber}`,
          _shopId: shopId,
          _orderItemId: orderItemId,
          _netWeight: dto.arrayItems[i].netWeight,
          _totalStoneWeight: dto.arrayItems[i].totalStoneWeight,
          _grossWeight: dto.arrayItems[i].grossWeight,
          _barcode:
            BarCodeQrCodePrefix.PRODUCT_AND_INVOICE +
            new StringUtils().intToDigitString(autoIncrementNumber, 8),
          _categoryId: resultSubcategory[subCategoryIndex]._categoryId,
          _subCategoryId: dto.arrayItems[i].subCategoryId,
          _groupId:
            resultSubcategory[subCategoryIndex].categoryDetails._groupId,
          _type: dto.arrayItems[i].type,
          _purity:
            resultSubcategory[subCategoryIndex].categoryDetails.groupDetails
              ._purity,
          _hmSealingStatus: dto.arrayItems[i].hmSealingStatus,
          _huId: [],
          _eCommerceStatus: dto.arrayItems[i].eCommerceStatus,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        if (orderItemId != null) {
          await this.orderSaleItemsModel.findOneAndUpdate(
            {
              _id: orderItemId,
            },
            {
              $set: {
                _productId: productId,
              },
            },
          );
        }

        if (orderId != null) {
          var result = await this.orderSaleMainModel.findOneAndUpdate(
            {
              _id: dto.orderId,
            },
            {
              $set: {
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
                _isProductGenerated: 1,
                _orderItemId: orderItemId,
                _workStatus: (dto.arrayItems.findIndex((it)=>it.hmSealingStatus==1)!=-1) ? 8 : 16, 
              },
            },
            { new: true, session: transactionSession },
          );
          arrayOrderSaleHistory.push({
            _orderSaleId: dto.orderId,
            _userId: null,
            _type: 6,
            _shopId: null,
            _orderSaleItemId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
          if (dto.arrayItems[i].hmSealingStatus == 0) {
            arrayOrderSaleHistory.push({
              _orderSaleId: dto.orderId,
              _userId: null,
              _type: 16,
              _shopId: null,
              _orderSaleItemId: null,
              _description: '',
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _status: 1,
            });
          }
        }
        if (dto.arrayItems[i].eCommerceStatus == 1 && orderId != null) {
          var resultCounterPhotographer =
            await this.counterModel.findOneAndUpdate(
              { _tableName: ModelNames.PHOTOGRAPHER_REQUESTS },
              {
                $inc: {
                  _count: 1,
                },
              },
              { new: true, session: transactionSession },
            );

            var photographyUid=resultCounterPhotographer._count;

          const photographerRequestModel = new this.photographerRequestModel({
            _rootCauseId: null,
            _orderItemId: orderItemId,
            _productId: productId,
            _requestStatus: 0,
            _description: '',
            _uid: photographyUid,
            _userId: resultPhotographer[0].employeeList[0]._userId,
            _finishedAt: 0,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: 0,
            _status: 1,
          });
          await photographerRequestModel.save({
            session: transactionSession,
          });
          arrayOrderSaleHistory.push({
            _orderSaleId: dto.orderId,
            _userId: resultPhotographer[0].employeeList[0]._userId,
            _type: 105,
            _shopId: null,
            _orderSaleItemId: null,
            _description: 'Photography request UID: '+photographyUid,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        }

        if (dto.arrayItems[i].hmSealingStatus == 1 && orderId != null) {
          var resultCounterHalmarkRequest =
            await this.counterModel.findOneAndUpdate(
              { _tableName: ModelNames.HALMARKING_REQUESTS },
              {
                $inc: {
                  _count: 1,
                },
              },
              { new: true, session: transactionSession },
            );

          const halmarkRequestModel = new this.halmarkRequestModel({
            _uid: resultCounterHalmarkRequest._count,
            _orderSaleItemId: orderItemId,
            _productId: productId,
            _halmarkCenterId: null,
            _halmarkCenterUserId: null,
            _verifyUserId: null,
            _requestStatus: 5,
            _rootCauseId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: 0,
            _status: 1,
          });
          await halmarkRequestModel.save({
            session: transactionSession,
          });
          arrayOrderSaleHistory.push({
            _orderSaleId: dto.orderId,
            _userId: null,
            _type: 8,
            _orderSaleItemId: null,
            _shopId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        }
      }

      var result1 = await this.productModel.insertMany(arrayToProducts, {
        session: transactionSession,
      });

      await this.productStoneLinkingsModel.insertMany(arrayStonesLinkings, {
        session: transactionSession,
      });

      if (arrayOrderSaleHistory.length != 0) {
        await this.orderSaleHistoriesModel.insertMany(arrayOrderSaleHistory, {
          session: transactionSession,
        });
      }
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

  async list(dto: ProductListDto) {
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
              { _name: new RegExp(dto.searchingText, 'i') },
              { _barcode: dto.searchingText },
              { _huId: dto.searchingText },
              { _designerId: dto.searchingText },
            ],
          },
        });
      }
      if (dto.productIds.length > 0) {
        var newSettingsId = [];
        dto.productIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _id: { $in: newSettingsId } },
        });
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

      if (dto.orderIds.length > 0) {
        var newSettingsId = [];
        dto.orderIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _orderId: { $in: newSettingsId } },
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
      if (dto.categoryIds.length > 0) {
        var newSettingsId = [];
        dto.categoryIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _categoryId: { $in: newSettingsId } },
        });
      }
      if (dto.groupIds.length > 0) {
        var newSettingsId = [];
        dto.groupIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _groupId: { $in: newSettingsId } },
        });
      }

      if (dto.barcodes.length > 0) {
        arrayAggregation.push({
          $match: { _barcode: { $in: dto.barcodes } },
        });
      }

      if (dto.huId.length > 0) {
        arrayAggregation.push({
          $match: { _huId: { $in: dto.huId } },
        });
      }

      if (dto.type.length > 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.type } },
        });
      }
      if (dto.eCommerceStatuses.length > 0) {
        arrayAggregation.push({
          $match: { _eCommerceStatus: { $in: dto.eCommerceStatuses } },
        });
      }
      if (dto.hmStealingStatus.length > 0) {
        arrayAggregation.push({
          $match: { _hmSealingStatus: { $in: dto.hmStealingStatus } },
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
          arrayAggregation.push({ $sort: { _name: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _designerId: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _grossWeight: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _type: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _purity: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _hmSealingStatus: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _huId: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _eCommerceStatus: dto.sortOrder } });
          break;
      }
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      arrayAggregation.push(
        new ModelWeightResponseFormat().productTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(100)) {
        const shopPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_id', '$$shopId'] }],
                },
              },
            },
            new ModelWeightResponseFormat().shopTableResponseFormat(
              1000,
              dto.responseFormat,
            ),
          );
          const shopGlobalGallery = dto.screenType.includes(107);
          if (shopGlobalGallery) {
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
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: shopPipeline(),
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

      if (dto.screenType.includes(101)) {
        const orderSaleItemPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_id', '$$orderItemId'] }],
                },
              },
            },
            new ModelWeightResponseFormat().orderSaleItemsTableResponseFormat(
              101,
              dto.responseFormat,
            ),
          );

          const orderSaleItemOrderSaleMain = dto.screenType.includes(112);
          if (orderSaleItemOrderSaleMain) {
            const orderSaleItemOrderSaleMainPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$_id', '$$orderId'] }],
                    },
                  },
                },
                new ModelWeightResponseFormat().orderSaleMainTableResponseFormat(
                  1120,
                  dto.responseFormat,
                ),
              );
              const orderSaleItemOrderSaleMainDocuments =
                dto.screenType.includes(113);
              if (orderSaleItemOrderSaleMainDocuments) {
                const orderSaleItemOrderSaleMainDocumentsPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        _status: 1,
                        $expr: {
                          $eq: ['$_orderSaleId', '$$orderSaleIdId'],
                        },
                      },
                    },

                    new ModelWeightResponseFormat().orderSaleDocumentsTableResponseFormat(
                      1130,
                      dto.responseFormat,
                    ),
                  );
                  const orderSaleItemOrderSaleMainDocumentsGlobalGallery =
                    dto.screenType.includes(114);
                  if (orderSaleItemOrderSaleMainDocumentsGlobalGallery) {
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
                              114,
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
                    pipeline: orderSaleItemOrderSaleMainDocumentsPipeline(),
                    as: 'orderSaleDocumentList',
                  },
                });
              }
              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.ORDER_SALES_MAIN,
                  let: { orderId: '$_orderSaleId' },
                  pipeline: orderSaleItemOrderSaleMainPipeline(),
                  as: 'orderDetails',
                },
              },
              {
                $unwind: {
                  path: '$orderDetails',
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
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { orderItemId: '$_orderItemId' },
              pipeline: orderSaleItemPipeline(),
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

      if (dto.screenType.includes(102)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SUB_CATEGORIES,
              let: { subCategoryId: '$_subCategoryId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$_id', '$$subCategoryId'] }],
                    },
                  },
                },
                new ModelWeightResponseFormat().subCategoryTableResponseFormat(
                  1020,
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
      if (dto.screenType.includes(103)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.CATEGORIES,
              let: { categoryId: '$_categoryId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$_id', '$$categoryId'] }],
                    },
                  },
                },
                new ModelWeightResponseFormat().categoryTableResponseFormat(
                  1030,
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

      if (dto.screenType.includes(104)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.GROUP_MASTERS,
              let: { groupId: '$_groupId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$_id', '$$groupId'] }],
                    },
                  },
                },
                new ModelWeightResponseFormat().groupMasterTableResponseFormat(
                  1040,
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

      if (dto.screenType.includes(105)) {
        const productStoneLinkingPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_productId', '$$productId'] }],
                },
              },
            },
            new ModelWeightResponseFormat().productStoneLinkingTableResponseFormat(
              1050,
              dto.responseFormat,
            ),
          );

          const productStoneLinkingStone = dto.screenType.includes(109);
          if (productStoneLinkingStone) {
            const productStoneLinkingStonePipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$_id', '$$stoneId'] }],
                    },
                  },
                },
                new ModelWeightResponseFormat().stoneMasterTableResponseFormat(
                  1090,
                  dto.responseFormat,
                ),
              );

              const stoneDetailsGlobalGallery = dto.screenType.includes(110);
              if (stoneDetailsGlobalGallery) {
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
                          1100,
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
                  from: ModelNames.STONE,
                  let: { stoneId: '$_stoneId' },
                  pipeline: productStoneLinkingStonePipeline(),
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

            const productStoneLinkingColourMaster =
              dto.screenType.includes(111);
            if (productStoneLinkingColourMaster) {
              pipeline.push(
                {
                  $lookup: {
                    from: ModelNames.COLOUR_MASTERS,
                    let: { stoneColourId: '$_stoneColourId' },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ['$_id', '$$stoneColourId'] },
                        },
                      },
                      new ModelWeightResponseFormat().colourMasterTableResponseFormat(
                        1110,
                        dto.responseFormat,
                      ),
                    ],
                    as: 'stoneColourDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$stoneColourDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              );
            }
          }
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.PRODUCT_STONE_LINKIGS,
            let: { productId: '$_id' },
            pipeline: productStoneLinkingPipeline(),
            as: 'stoneLinkings',
          },
        });
      }

      if (dto.screenType.includes(106)) {
        const productDocumentsLinkingPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: {
                  $and: [{ $eq: ['$_productId', '$$productId'] }],
                },
              },
            },
            new ModelWeightResponseFormat().productDocumentLinkingTableResponseFormat(
              1060,
              dto.responseFormat,
            ),
          );

          const productsDocumentsGlobalGallery = dto.screenType.includes(108);
          if (productsDocumentsGlobalGallery) {
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

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.PRODUCT_DOCUMENTS_LINKIGS,
            let: { productId: '$_id' },
            pipeline: productDocumentsLinkingPipeline(),
            as: 'documentList',
          },
        });
      }
      var result = await this.productModel
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

        var resultTotalCount = await this.productModel
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

  async change_e_commerce_status(
    dto: ProductEcommerceStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.productModel.updateMany(
        {
          _id: { $in: dto.productIds },
        },
        {
          $set: {
            _eCommerceStatus: dto.eCommerceStatus,
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

  async tempGetMinJobPhotographer() {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.departmentsModel.aggregate([
        {
          $match: {
            _code: 1004,
            _status: 1,
          },
        },
        { $project: { _id: 1 } },
        {
          $lookup: {
            from: ModelNames.EMPLOYEES,
            let: { departmentId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_departmentId', '$$departmentId'] },
                },
              },

              {
                $lookup: {
                  from: ModelNames.PHOTOGRAPHER_REQUESTS,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        _status: 1,
                        $expr: { $eq: ['$_userId', '$$userId'] },
                      },
                    },
                    { $project: { _id: 1 } },
                  ],
                  as: 'photographyRequestList',
                },
              },
              {
                $project: {
                  _userId: 1,
                  photographyRequestCount: { $size: '$photographyRequestList' },
                },
              },
            ],
            as: 'employeeList',
          },
        },
        {
          $unwind: {
            path: '$employeeList',
            preserveNullAndEmptyArrays: true,
          },
        },
        { $sort: { 'employeeList.photographyRequestCount': 1 } },
        { $limit: 1 },
        {
          $group: {
            _id: '$_id',
            employeeList: {
              $push: '$employeeList',
            },
          },
        },
      ]);

      const responseJSON = { message: 'success', data: { list: result } };
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
