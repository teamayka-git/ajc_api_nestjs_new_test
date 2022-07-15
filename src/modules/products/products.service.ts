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
import { OrderSales } from 'src/tableModels/order_sales.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { PhotographerRequests } from 'src/tableModels/photographer_requests.model';
import { HalmarkingRequests } from 'src/tableModels/halmarking_requests.model';
import { Departments } from 'src/tableModels/departments.model';
import { BarCodeQrCodePrefix } from 'src/common/barcode_qrcode_prefix';

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
    @InjectModel(ModelNames.ORDER_SALES)
    private readonly orderSaleModel: Model<OrderSales>,
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
      var shopId = dto.shopId;
      var orderId = dto.orderId;
      if (shopId == '' || shopId == 'nil') {
        shopId = null;
      }
      if (orderId == '' || orderId == 'nil') {
        orderId = null;
      }

      dto.stonesArray.map((mapItem1) => {
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
        _name: dto.name,
        _designerId: `${resultSubcategory[0]._code}-${autoIncrementNumber}`,
        _shopId: shopId,
        _orderId: orderId,
        _netWeight: dto.netWeight,
        _totalStoneWeight: dto.totalStoneWeight,
        _grossWeight: dto.grossWeight,
        _barcode:BarCodeQrCodePrefix.PRODUCT_AND_INVOICE+ new StringUtils().intToDigitString(autoIncrementNumber, 12), 
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

      await this.productStoneLinkingsModel.insertMany(arrayStonesLinkings, {
        session: transactionSession,
      });

      if (orderId != null) {

     


        var result = await this.orderSaleModel.findOneAndUpdate(
          {
            _id: dto.orderId,
          },
          {
            $set: {
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
              _isProductGenerated: 1, 
              _workStatus:(dto.hmSealingStatus == 1)?8: 16, 
            },
          },
          { new: true, session: transactionSession },
        );
        arrayOrderSaleHistory.push({
          _orderSaleId: dto.orderId,
          _userId: null,
          _type: 6,
          _shopId: null,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
        if(dto.hmSealingStatus == 0){
        arrayOrderSaleHistory.push({
          _orderSaleId: dto.orderId,
          _userId: null,
          _type: 16,
          _shopId: null,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      }
      }
      if (dto.eCommerceStatus == 1 && orderId != null) {
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
        const photographerRequestModel = new this.photographerRequestModel({
          _rootCauseId: null,
          _orderId: orderId,
          _productId: productId,
          _requestStatus: 0,
          _description: '',
          _uid: resultCounterPhotographer._count,
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
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      }

      console.log('___s1 dto.hmSealingStatus ' + dto.hmSealingStatus);
      console.log('___s1 orderId ' + orderId);
      if (dto.hmSealingStatus == 1 && orderId != null) {
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
          _orderId: orderId,
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
          _shopId: null,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      }
if(arrayOrderSaleHistory.length!=0){
  await this.orderSaleHistoriesModel.insertMany(
    arrayOrderSaleHistory,
    {
      session: transactionSession,
    },
  )
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

      if (dto.screenType.includes(100)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$_id', '$$shopId'] }],
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
                      {
                        $project: {
                          _name: 1,
                          _docType: 1,
                          _type: 1,
                          _uid: 1,
                          _url: 1,
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
            ],
            as: 'stoneLinkings',
          },
        });
      }

      if (dto.screenType.includes(106)) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.PRODUCT_DOCUMENTS_LINKIGS,
            let: { productId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $and: [{ $eq: ['$_productId', '$$productId'] }],
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
                    {
                      $project: {
                        _name: 1,
                        _docType: 1,
                        _type: 1,
                        _uid: 1,
                        _url: 1,
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
