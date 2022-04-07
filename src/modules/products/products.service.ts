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
import { ProductCreateDto, ProductListDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(ModelNames.PRODUCTS)
    private readonly productModel: Model<Products>,
    @InjectModel(ModelNames.PRODUCT_STONE_LINKIGS)
    private readonly productStoneLinkingsModel: Model<ProductStoneLinkings>,
    @InjectModel(ModelNames.SUB_CATEGORIES)
    private readonly subCategoriesModel: Model<SubCategories>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: ProductCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToProducts = [];

      var arrayStonesLinkings = [];

      var resultSubcategory = await this.subCategoriesModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(dto.subCategoryId),
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
            _count: 1,
          },
        },
        { new: true, session: transactionSession },
      );

      var autoIncrementNumber = resultProduct._count;
      var productId = new mongoose.Types.ObjectId();
      var customerId = dto.customerId;
      var orderId = dto.orderId;
      if (customerId == '' || customerId == 'nil') {
        customerId = null;
      }
      if (orderId == '' || orderId == 'nil') {
        orderId = null;
      }

      dto.stonesArray.map((mapItem1) => {
        arrayStonesLinkings.push({
          _productId: productId,
          _stoneId: mapItem1.stoneId,
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
        _name: dto.name,
        _designerId: `${resultSubcategory[0]._code}-${autoIncrementNumber}`,
        _customerId: customerId,
        _orderId: orderId,
        _netWeight: dto.netWeight,
        _totalStoneWeight: dto.totalStoneWeight,
        _grossWeight: dto.grossWeight,
        _barcode: new StringUtils().intToDigitString(autoIncrementNumber, 12),
        _categoryId: resultSubcategory[0]._categoryId,
        _subCategoryId: dto.subCategoryId,
        _groupId: resultSubcategory[0].categoryDetails._groupId,
        _type: dto.type,
        _purity: resultSubcategory[0].categoryDetails.groupDetails._purity,
        _hmSealingStatus: dto.hmSealingStatus,
        _huId: '',
        _eCommerceStatus: dto.eCommerceStatus,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });

      var result1 = await this.productModel.insertMany(arrayToProducts, {
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
      if (dto.customerIds.length > 0) {
        var newSettingsId = [];
        dto.customerIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _customerId: { $in: newSettingsId } },
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

      if (dto.screenType.findIndex((it) => it == 100) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_customerId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$_id', '$$userId'] }],
                    },
                  },
                },
                {
                  $project: {
                    _type: 1,
                    _employeeId: 1,
                    _agentId: 1,
                    _supplierId: 1,
                    _customerId: 1,
                  },
                },

                {
                  $lookup: {
                    from: ModelNames.CUSTOMERS,
                    let: { customerId: '$_customerId' },
                    pipeline: [
                      { $match: { $expr: { $eq: ['$_id', '$$customerId'] } } },
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
                      {
                        $project: {
                          _name: 1,
                          _email: 1,
                          _mobile: 1,
                          _uid: 1,
                          globalGalleryDetails: {
                            _name: 1,
                            _docType: 1,
                            _type: 1,
                            _uid: 1,
                            _url: 1,
                          },
                        },
                      },
                    ],
                    as: 'customerDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$customerDetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: 'userDetailsCustomer',
            },
          },
          {
            $unwind: {
              path: '$userDetailsCustomer',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.findIndex((it) => it == 101) != -1) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES,
              let: { orderId: '$_orderId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$_id', '$$orderId'] }],
                    },
                  },
                },
                {
                  $lookup: {
                    from: ModelNames.ORDER_SALES_DOCUMENTS,
                    let: { orderSaleIdId: '$_id' },
                    pipeline: [
                      {
                        $match: {
                          _status: 1,
                          $expr: { $eq: ['$_orderSaleId', '$$orderSaleIdId'] },
                        },
                      },
                      {
                        $project: {
                          _orderSaleId: 1,
                          _globalGalleryId: 1,
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
                    as: 'orderSaleDocumentList',
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
        );
      }

      if (dto.screenType.findIndex((it) => it == 102) != -1) {
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
      if (dto.screenType.findIndex((it) => it == 103) != -1) {
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

      if (dto.screenType.findIndex((it) => it == 104) != -1) {
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

      if (dto.screenType.findIndex((it) => it == 105) != -1) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.PRODUCT_STONE_LINKIGS,
            let: { productId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_productId', '$$productId'] }],
                  },
                },
              },
              {
                $lookup: {
                  from: ModelNames.STONE,
                  let: { stoneId: '$_stoneId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [{ $eq: ['$_id', '$$stoneId'] }],
                        },
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
                  as: 'stoneDetails',
                },
              },
              {
                $unwind: {
                  path: '$stoneDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: 'stoneLinkings',
          },
        });
      }

      var result = await this.productModel
        .aggregate(arrayAggregation)
        .session(transactionSession);

      var totalCount = 0;
      if (dto.screenType.findIndex((it) => it == 0) != -1) {
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
}
