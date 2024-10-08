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
  GetBulkProductBarcodeDto,
  GetProductWithBarcodeDto,
  ProductCreateDto,
  ProductEcommerceStatusChangeDto,
  ProductEditDto,
  ProductListDto,
  StockFromProductTempDto,
} from './products.dto';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { PhotographerRequests } from 'src/tableModels/photographer_requests.model';
import { Departments } from 'src/tableModels/departments.model';
import { BarCodeQrCodePrefix } from 'src/common/barcode_qrcode_prefix';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { OrderSalesItems } from 'src/tableModels/order_sales_items.model';
import { ProductTagLinkings } from 'src/tableModels/product_tag_linkings.model';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { ProductsDocuments } from 'src/tableModels/products_documents.model';
import { ProductTemps } from 'src/tableModels/product_temps.model';
import { ModelWeight } from 'src/model_weight/model_weight';
import { HalmarkOrderItems } from 'src/tableModels/halmark_order_items.model';
import { HalmarkOrderMain } from 'src/tableModels/halmark_order_mains.model';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: Model<GlobalGalleries>,
    @InjectModel(ModelNames.PRODUCT_DOCUMENTS_LINKIGS)
    private readonly productDocumentModel: Model<ProductsDocuments>,
    @InjectModel(ModelNames.PRODUCTS)
    private readonly productModel: Model<Products>,
    @InjectModel(ModelNames.PRODUCT_TAG_LINKINGS)
    private readonly productTagLinkingModel: Model<ProductTagLinkings>,
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

    @InjectModel(ModelNames.HALMARK_ORDER_MAIN)
    private readonly halmarkBundlesMainModel: Model<HalmarkOrderMain>,
    @InjectModel(ModelNames.HALMARK_ORDER_ITEMS)
    private readonly halmarkBundlesItemsModel: Model<HalmarkOrderItems>,
    @InjectModel(ModelNames.PRODUCT_TEMPS)
    private readonly productTempModel: mongoose.Model<ProductTemps>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: Model<OrderSaleHistories>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: ProductCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      console.log('___dto  ' + JSON.stringify(dto));
      console.log('___a1');
      var arrayGlobalGalleries = [];
      var arrayGlobalGalleriesDocuments = [];

      if (file.hasOwnProperty('documents')) {
        var totalCountDocuments = 0;

        dto.arrayItems.forEach((elements) => {
          elements['mongoId'] = new mongoose.Types.ObjectId();
          totalCountDocuments += elements.arrayDocuments.length;
        });

        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: totalCountDocuments,
            },
          },
          { new: true, session: transactionSession },
        );

        // for (var i = 0; i < dto.arrayDocuments.length; i++) {
        //   var count = file['documents'].findIndex(
        //     (it) => dto.arrayDocuments[i].fileOriginalName == it.originalname,
        //   );

        //   if (count != -1) {
        //     if (dto.arrayDocuments[i].docType == 0) {
        //       var filePath =
        //         __dirname +
        //         `/../../../public${
        //           file['documents'][count]['path'].split('public')[1]
        //         }`;

        //       new ThumbnailUtils().generateThumbnail(
        //         filePath,
        //         UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP +
        //           new StringUtils().makeThumbImageFileName(
        //             file['documents'][count]['filename'],
        //           ),
        //       );
        //     }
        //   }
        // }
        for (var i = 0; i < file['documents'].length; i++) {
          var resultUpload = await new S3BucketUtils().uploadMyFile(
            file['documents'][i],
            UploadedFileDirectoryPath.GLOBAL_GALLERY_PRODUCT,
          );

          if (resultUpload['status'] == 0) {
            throw new HttpException(
              'File upload error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          for (var j = 0; j < dto.arrayItems.length; j++) {
            var count = dto.arrayItems[j].arrayDocuments.findIndex(
              (it) =>
                it.fileOriginalName == file['documents'][i]['originalname'],
            );
            if (count != -1) {
              dto.arrayItems[j].arrayDocuments[count]['url'] =
                resultUpload['url'];
            } else {
              dto.arrayItems[j].arrayDocuments[count]['url'] = 'nil';
            }
          }
        }

        for (var j = 0; j < dto.arrayItems.length; j++) {
          for (var i = 0; i < dto.arrayItems[j].arrayDocuments.length; i++) {
            var count = file['documents'].findIndex(
              (it) =>
                it.originalname ==
                dto.arrayItems[j].arrayDocuments[i].fileOriginalName,
            );
            if (count != -1) {
              var globalGalleryId = new mongoose.Types.ObjectId();
              arrayGlobalGalleries.push({
                _id: globalGalleryId,
                _name: dto.arrayItems[j].arrayDocuments[i].fileOriginalName,
                _globalGalleryCategoryId: null,
                _docType: dto.arrayItems[j].arrayDocuments[i].docType,
                _type: 7,
                _uid:
                  resultCounterPurchase._count -
                  dto.arrayItems[j].arrayDocuments.length +
                  (i + 1),
                _url: dto.arrayItems[j].arrayDocuments[i]['url'],
                _createdUserId: _userId_,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
                _status: 1,
              });
              arrayGlobalGalleriesDocuments.push({
                _productId: dto.arrayItems[j]['mongoId'],
                _globalGalleryId: globalGalleryId,
                _createdUserId: _userId_,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
                _status: 1,
              });
            }
          }
        }

        await this.globalGalleryModel.insertMany(arrayGlobalGalleries, {
          session: transactionSession,
        });
        await this.productDocumentModel.insertMany(
          arrayGlobalGalleriesDocuments,
          {
            session: transactionSession,
          },
        );
      }

      console.log('___a2');
      var arrayToProducts = [];
      var arrayToHamarkMains = [];
      var arrayToHamarkItems = [];
      var arrayStonesLinkings = [];
      var arrayTagLinkings = [];
      var arrayPhotographyRequestIds = [];

      var arrayOrderSaleHistory = [];
      var arraySubCategoryidsMDB = [];

      console.log('___a2.0');
      dto.arrayItems.forEach((it) => {
        console.log('___a2.00');
        console.log('___a2.01   ' + it.subCategoryId);

        console.log('___a2.011');
        arraySubCategoryidsMDB.push(
          new mongoose.Types.ObjectId(it.subCategoryId),
        );

        console.log('___a2.02');
      });

      console.log('___a2.1');
      console.log('___a2.2  ' + JSON.stringify(arraySubCategoryidsMDB));
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
      console.log('___a3');
      if (resultSubcategory.length == 0) {
        throw new HttpException(
          'subCategory Is Empty',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      console.log('___a3.0');
      var resultProduct = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.PRODUCTS },
        {
          $inc: {
            _count: dto.arrayItems.length,
          },
        },
        { new: true, session: transactionSession },
      );

      console.log('___a3.1   ' + JSON.stringify(resultProduct));
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

      console.log('___a3.2');
      if (resultPhotographer.length == 0) {
        throw new HttpException(
          'Photography department not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      console.log('___a3.3');
      if (resultPhotographer[0].employeeList.length == 0) {
        throw new HttpException(
          'Photography employees not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      console.log('___a4');
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
        var productId =
          dto.arrayItems[i]['mongoId'] != null
            ? dto.arrayItems[i]['mongoId']
            : new mongoose.Types.ObjectId();
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

        var designUid = '';
        if (dto.arrayItems[i].type == 3) {
          var resultDesignUid = await this.counterModel.findOneAndUpdate(
            { _tableName: ModelNames.PRODUCTS + '_design' },
            {
              $inc: {
                _count: dto.arrayItems.length,
              },
            },
            { new: true, session: transactionSession },
          );
          designUid = resultDesignUid._count.toString();
        }
        console.log('___a5');
        dto.arrayItems[i].stonesArray.map((mapItem1) => {
          arrayStonesLinkings.push({
            _productId: productId,
            _stoneId: mapItem1.stoneId,
            _stoneColourId: mapItem1.colourId,
            _stoneWeight: mapItem1.stoneWeight,

            _stoneAmount: mapItem1.stoneAmount,
            _quantity: mapItem1.quantity,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });

        if (dto.arrayItems[i].photographyRequestId != '') {
          arrayPhotographyRequestIds.push(
            dto.arrayItems[i].photographyRequestId,
          );
        }

        dto.arrayItems[i].tagIds.map((mapItem1) => {
          arrayTagLinkings.push({
            _tagId: mapItem1,
            _productId: productId,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
        console.log('___a1');
        console.log('___a1.1');

        var designId =
          dto.arrayItems[i].designId == ''
            ? new mongoose.Types.ObjectId()
            : dto.arrayItems[i].designId;

        console.log('___a2  ' + designId);
        console.log('___a2.1  ' + designId);
        console.log('___a2.2  ' + dto.arrayItems[i].designId);
        arrayToProducts.push({
          _id: productId,
          _name: dto.arrayItems[i].name,
          _designerId:
            dto.arrayItems[i].type == 3
              ? null
              : dto.arrayItems[i].type == 1
              ? designId
              : dto.arrayItems[i].eCommerceStatus == 0
              ? null
              : designId,
          _shopId: shopId,
          _orderItemId: orderItemId,
          _stockStatus: 0,
          _soldCount: 0,
          _designUid: designUid,
          _netWeight: dto.arrayItems[i].netWeight,
          _totalStoneWeight: dto.arrayItems[i].totalStoneWeight,
          _totalStoneAmount: dto.arrayItems[i].totalStoneAmount,
          _grossWeight: dto.arrayItems[i].grossWeight,
          _barcode:
            dto.arrayItems[i].type != 3
              ? BarCodeQrCodePrefix.PRODUCT_AND_INVOICE +
                new StringUtils().intToDigitString(autoIncrementNumber, 8)
              : '',
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
          _isStone: dto.arrayItems[i].isStone,
          _moldNumber: dto.arrayItems[i].moldNumber,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        console.log('___a3');
        if (
          dto.arrayItems[i].eCommerceStatus == 1 &&
          dto.arrayItems[i].type == 0
        ) {
          var designUidSecondary = '';
          var resultDesignUidSecondary =
            await this.counterModel.findOneAndUpdate(
              { _tableName: ModelNames.PRODUCTS + '_design' },
              {
                $inc: {
                  _count: dto.arrayItems.length,
                },
              },
              { new: true, session: transactionSession },
            );
          designUidSecondary = resultDesignUidSecondary._count.toString();

          arrayToProducts.push({
            _id: designId,
            _name: dto.arrayItems[i].name,
            _designerId: null,
            _shopId: null,
            _orderItemId: null,
            _designUid: designUidSecondary,
            _soldCount: 0,
            _netWeight: dto.arrayItems[i].netWeight,
            _totalStoneWeight: dto.arrayItems[i].totalStoneWeight,
            _totalStoneAmount: dto.arrayItems[i].totalStoneAmount,
            _grossWeight: dto.arrayItems[i].grossWeight,
            _barcode: '',
            _categoryId: resultSubcategory[subCategoryIndex]._categoryId,
            _subCategoryId: dto.arrayItems[i].subCategoryId,
            _groupId:
              resultSubcategory[subCategoryIndex].categoryDetails._groupId,
            _type: 3,
            _stockStatus: 0,
            _purity:
              resultSubcategory[subCategoryIndex].categoryDetails.groupDetails
                ._purity,
            _hmSealingStatus: 0,
            _huId: [],
            _eCommerceStatus: 1,
            _isStone: dto.arrayItems[i].isStone,
            _moldNumber: dto.arrayItems[i].moldNumber,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        }
        console.log('___a4');
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
          var result = await this.orderSaleMainModel.updateMany(
            {
              _id: dto.orderId,
              _workStatus: 4,
            },
            {
              $set: {
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
                _isProductGenerated: 1,
                _orderItemId: orderItemId,
                _workStatus:
                  dto.arrayItems.findIndex((it) => it.hmSealingStatus == 1) !=
                  -1
                    ? 8
                    : 6,
              },
            },
            { new: true, session: transactionSession },
          );

          if (result == null) {
            throw new HttpException(
              'Product already generated',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          arrayOrderSaleHistory.push({
            _orderSaleId: dto.orderId,
            _userId: null,
            _type: 6,
            _shopId: null,
            _deliveryCounterId: null,
            _deliveryProviderId: null,
            _orderSaleItemId: null,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
          // if (dto.arrayItems[i].hmSealingStatus == 0) {
          //   arrayOrderSaleHistory.push({
          //     _orderSaleId: dto.orderId,
          //     _userId: null,
          //     _type: 16,
          //     _shopId: null,
          //     _deliveryProviderId:null,
          //     _orderSaleItemId: null,
          //     _description: '',
          //     _createdUserId: _userId_,
          //     _createdAt: dateTime,
          //     _status: 1,
          //   });
          // }
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

          var photographyUid = resultCounterPhotographer._count;

          const photographerRequestModel = new this.photographerRequestModel({
            _rootCauseId: null,
            _orderItemId: orderItemId,
            _designerId: designId,
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
            _deliveryProviderId: null,
            _deliveryCounterId: null,
            _shopId: null,
            _orderSaleItemId: null,
            _description: 'Photography request UID: ' + photographyUid,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        }

        if (dto.arrayItems[i].hmSealingStatus == 1 && orderId != null) {
          var halmarkMainTableId;
          var resultOrderHalmarkMain = await this.halmarkBundlesMainModel
            .find({
              _orderSaleMainId: orderId,
              _hmBundleId: null,
              _workStatus: {$ne:1},
              _type: 0,
              _status: 1,
            })
            .session(transactionSession);
          if (resultOrderHalmarkMain.length == 0) {
            var resultOrder = await this.orderSaleMainModel.find({
              _id: orderId,
            });
            if (resultOrder.length == 0) {
              throw new HttpException(
                'Order not found',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }

            halmarkMainTableId = new mongoose.Types.ObjectId();
            arrayToHamarkMains.push({
              _id: halmarkMainTableId,
              _hmBundleId: null,
              _orderUid: resultOrder[0]._uid,
              _orderSaleMainId: orderId,
              _workStatus: 0,
              _type: 0,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: 0,
              _status: 1,
            });
          } else {
            halmarkMainTableId = resultOrderHalmarkMain[0]._id;
          }

          arrayToHamarkItems.push({
            _orderSaleId: orderId,
            _hmMainId: halmarkMainTableId,
            _orderSaleItemId: dto.arrayItems[i].orderItemId,
            _subCategoryId: dto.arrayItems[i].subCategoryId,
            _huid: '',
            _weight: dto.arrayItems[i].netWeight,
            _type: 0,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: 0,
            _status: 1,
          });

          var resultOrderItem = await this.orderSaleItemsModel.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(dto.arrayItems[i].orderItemId),
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
          ]);
          if (resultOrderItem.length == 0) {
            throw new HttpException(
              'Order item not found',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          arrayOrderSaleHistory.push({
            _orderSaleId: dto.orderId,
            _userId: null,
            _type: 8,
            _orderSaleItemId: null,
            _deliveryCounterId: null,
            _deliveryProviderId: null,
            _shopId: null,
            _description: `UID: ${resultOrderItem[0]._uid}, qty:${resultOrderItem[0]._quantity}, wt:${resultOrderItem[0]._weight}, SubCategory:${resultOrderItem[0].subCategoryDetails._name} `,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        }
      }

      if (arrayPhotographyRequestIds.length != 0) {
        await this.photographerRequestModel.findOneAndUpdate(
          {
            _id: { $in: arrayPhotographyRequestIds },
          },
          {
            $set: {
              _requestStatus: 3,
              _finishedAt: dateTime,
              _updatedUserId: _userId_,
              _updatedAt: dateTime,
            },
          },
          { new: true, session: transactionSession },
        );
      }
      if (arrayToHamarkMains.length != 0) {
        await this.halmarkBundlesMainModel.insertMany(arrayToHamarkMains, {
          session: transactionSession,
        });
      }
      if (arrayToHamarkItems.length != 0) {
        await this.halmarkBundlesItemsModel.insertMany(arrayToHamarkItems, {
          session: transactionSession,
        });
      }
      var result1 = await this.productModel.insertMany(arrayToProducts, {
        session: transactionSession,
      });

      await this.productStoneLinkingsModel.insertMany(arrayStonesLinkings, {
        session: transactionSession,
      });
      await this.productTagLinkingModel.insertMany(arrayTagLinkings, {
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

  async edit(dto: ProductEditDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayGlobalGalleries = [];
      var arrayGlobalGalleriesDocuments = [];
      console.log('___f1');
      if (file.hasOwnProperty('documents')) {
        console.log('___f2');
        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: dto.arrayDocuments.length,
            },
          },
          { new: true, session: transactionSession },
        );
        console.log('___f3');
        // for (var i = 0; i < dto.arrayDocuments.length; i++) {
        //   var count = file['documents'].findIndex(
        //     (it) => dto.arrayDocuments[i].fileOriginalName == it.originalname,
        //   );

        //   if (count != -1) {
        //     if (dto.arrayDocuments[i].docType == 0) {
        //       var filePath =
        //         __dirname +
        //         `/../../../public${
        //           file['documents'][count]['path'].split('public')[1]
        //         }`;

        //       new ThumbnailUtils().generateThumbnail(
        //         filePath,
        //         UploadedFileDirectoryPath.GLOBAL_GALLERY_SHOP +
        //           new StringUtils().makeThumbImageFileName(
        //             file['documents'][count]['filename'],
        //           ),
        //       );
        //     }
        //   }
        // }
        for (var i = 0; i < file['documents'].length; i++) {
          console.log('___f4');
          var resultUpload = await new S3BucketUtils().uploadMyFile(
            file['documents'][i],
            UploadedFileDirectoryPath.GLOBAL_GALLERY_PRODUCT,
          );
          console.log('___f5');
          if (resultUpload['status'] == 0) {
            throw new HttpException(
              'File upload error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          console.log('___f6');
          var count = dto.arrayDocuments.findIndex(
            (it) => it.fileOriginalName == file['documents'][i]['originalname'],
          );
          console.log('___f7');
          if (count != -1) {
            dto.arrayDocuments[count]['url'] = resultUpload['url'];
          } else {
            dto.arrayDocuments[count]['url'] = 'nil';
          }
        }
        console.log('___f8');
        for (var i = 0; i < dto.arrayDocuments.length; i++) {
          var count = file['documents'].findIndex(
            (it) => it.originalname == dto.arrayDocuments[i].fileOriginalName,
          );
          if (count != -1) {
            var globalGalleryId = new mongoose.Types.ObjectId();
            arrayGlobalGalleries.push({
              _id: globalGalleryId,
              _name: dto.arrayDocuments[i].fileOriginalName,
              _globalGalleryCategoryId: null,
              _docType: dto.arrayDocuments[i].docType,
              _type: 7,
              _uid:
                resultCounterPurchase._count -
                dto.arrayDocuments.length +
                (i + 1),
              _url: dto.arrayDocuments[i]['url'],
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
            });
            arrayGlobalGalleriesDocuments.push({
              _productId: dto.productId,
              _globalGalleryId: globalGalleryId,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
            });
          }
        }
        console.log('___f9');
        await this.globalGalleryModel.insertMany(arrayGlobalGalleries, {
          session: transactionSession,
        });
        await this.productDocumentModel.insertMany(
          arrayGlobalGalleriesDocuments,
          {
            session: transactionSession,
          },
        );
      }
      console.log('___f10');
      var arrayToProducts = [];

      var arrayStonesLinkings = [];
      var arrayTagLinkings = [];
      var arrayOrderSaleHistory = [];
      var arraySubCategoryidsMDB = [];

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

      /*
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
      }*/
      let subCategoryIndex = resultSubcategory.findIndex(
        (it) => it._id == dto.subCategoryId,
      );
      if (subCategoryIndex == -1) {
        throw new HttpException(
          'Subcategory mismatch',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      dto.stonesArray.map((mapItem1) => {
        arrayStonesLinkings.push({
          _productId: dto.productId,
          _stoneId: mapItem1.stoneId,
          _stoneColourId: mapItem1.colourId,
          _stoneWeight: mapItem1.stoneWeight,

          _stoneAmount: mapItem1.stoneAmount,
          _quantity: mapItem1.quantity,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      dto.tagIds.map((mapItem1) => {
        arrayTagLinkings.push({
          _tagId: mapItem1,
          _productId: dto.productId,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      await this.productModel.findOneAndUpdate(
        {
          _id: dto.productId,
        },
        {
          $set: {
            _name: dto.name,
            _netWeight: dto.netWeight,
            _totalStoneWeight: dto.totalStoneWeight,
            _totalStoneAmount: dto.totalStoneAmount,
            _grossWeight: dto.grossWeight,
            _categoryId: resultSubcategory[subCategoryIndex]._categoryId,
            _subCategoryId: dto.subCategoryId,
            _groupId:
              resultSubcategory[subCategoryIndex].categoryDetails._groupId,
            _type: dto.type,
            _purity:
              resultSubcategory[subCategoryIndex].categoryDetails.groupDetails
                ._purity,
            _isStone: dto.isStone,
            _moldNumber: dto.moldNumber,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );
      if (dto.orderId != '') {
        arrayOrderSaleHistory.push({
          _orderSaleId: dto.orderId,
          _userId: null,
          _type: 109,
          _orderSaleItemId: null,
          _deliveryCounterId: null,
          _deliveryProviderId: null,
          _shopId: null,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      }

      if (arrayStonesLinkings.length != 0) {
        await this.productStoneLinkingsModel.insertMany(arrayStonesLinkings, {
          session: transactionSession,
        });
      }
      if (arrayTagLinkings.length != 0) {
        await this.productTagLinkingModel.insertMany(arrayTagLinkings, {
          session: transactionSession,
        });
      }

      if (arrayOrderSaleHistory.length != 0) {
        await this.orderSaleHistoriesModel.insertMany(arrayOrderSaleHistory, {
          session: transactionSession,
        });
      }

      if (dto.documentRemoveLinkingIds.length != 0) {
        await this.productDocumentModel.updateMany(
          {
            _id: { $in: dto.documentRemoveLinkingIds },
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
      if (dto.tagRemoveLinkingIds.length != 0) {
        await this.productTagLinkingModel.updateMany(
          {
            _id: { $in: dto.tagRemoveLinkingIds },
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
      if (dto.stoneRemoveLinkingIds.length != 0) {
        await this.productStoneLinkingsModel.updateMany(
          {
            _id: { $in: dto.stoneRemoveLinkingIds },
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

  async list(dto: ProductListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      console.log('____q1');

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [
              { _moldNumber: new RegExp(`^${dto.searchingText}$`, 'i') },
              { _name: new RegExp(dto.searchingText, 'i') },
              { _barcode: dto.searchingText },
              { _huId: new RegExp(`^${dto.searchingText}$`, 'i') },
              { _designerId: new RegExp(`^${dto.searchingText}$`, 'i') },
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

      console.log('____q2');
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

      if (dto.subTagIds!=null&& dto.subTagIds.length > 0) {
        var newSettingsId = [];
        dto.subTagIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.PRODUCT_TAG_LINKINGS,
              let: { productId: '$_id' },
              pipeline: [
                {
                  $match: {
                    _status: 1,
                    $expr: { $eq: ['$_productId', '$$productId'] },
                  },
                },
                {
                  $match: {
                    _tagId: { $in: newSettingsId },
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
              as: 'subTagLinkingsMongoCheck',
            },
          },
          {
            $match: { subTagLinkingsMongoCheck: { $ne: [] } },
          },
        );
      }
      if (dto.tagIds!=null&&dto.tagIds.length > 0) {
        var newSettingsId = [];
        dto.tagIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.PRODUCT_TAG_LINKINGS,
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
                    from: ModelNames.TAG_MASTERS,
                    let: { tagId: '$_tagId' },
                    pipeline: [
                      {
                        $match: {
                          _status: 1,
                          $expr: { $eq: ['$_id', '$$tagId'] },
                        },
                      },
                      {
                        $match: { 
                          _tagId: { $in: newSettingsId },
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                        },
                      },
                    ],
                    as: 'tagLinkingsMongoCheckSecond',
                  },
                },

                {
                  $match: { tagLinkingsMongoCheckSecond: { $ne: [] } },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
              as: 'subTagLinkingsMongoCheckSecond',
            },
          },
          {
            $match: { subTagLinkingsMongoCheckSecond: { $ne: [] } },
          },
        );
      }
      console.log("____product list 1");
      if (dto.moldNumbers!=null&&dto.moldNumbers.length > 0) {
        arrayAggregation.push({
          $match: { _moldNumber: { $in: dto.moldNumbers } },
        });
      }

      if (dto.designUids!=null&&dto.designUids.length > 0) {
        arrayAggregation.push({
          $match: { _designUid: { $in: dto.designUids } },
        });
      }

      if (dto.createdDateStart !=null &&dto.createdDateStart != -1) {
        arrayAggregation.push({
          $match: {
            _createdAt: { $gte: dto.createdDateStart },
          },
        });
      }
      console.log("____product list 2");
      if (dto.createdDateEnd !=null&&dto.createdDateEnd != -1) {
        arrayAggregation.push({
          $match: {
            _createdAt: { $lte: dto.createdDateEnd },
          },
        });
      }

      if (dto.netWeightStart                            !=null && dto.netWeightStart != -1) {
        arrayAggregation.push({
          $match: {
            _netWeight: { $gte: dto.netWeightStart },
          },
        });
      }
      console.log("____product list 3");
      if (dto.netWeightEnd!=null && dto.netWeightEnd != -1) {
        arrayAggregation.push({
          $match: {
            _netWeight: { $lte: dto.netWeightEnd },
          },
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

      console.log('____q3');
      if (dto.isStone.length > 0) {
        arrayAggregation.push({
          $match: { _isStone: { $in: dto.isStone } },
        });
      }
      console.log("____product list 4");
      if (dto.type.length > 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.type } },
        });
      }

      if (dto.stockStatus != null && dto.stockStatus.length > 0) {
        arrayAggregation.push({
          $match: { _stockStatus: { $in: dto.stockStatus } },
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
      console.log("____product list 5");
      if (
        dto.cityIds.length != 0 ||
        dto.relationshipManagerIds.length != 0 ||
        dto.orderHeadIds.length != 0
      ) {
        var pipelineShop = [];
        pipelineShop.push(
          {
            $match: {
              $expr: { $eq: ['$_id', '$$shopId'] },
            },
          },
          {
            $project: {
              _id: 1,
              _cityId: 1,
              _orderHeadId: 1,
              _relationshipManagerId: 1,
            },
          },
        );

        if (dto.cityIds.length > 0) {
          var newSettingsId = [];
          dto.cityIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          pipelineShop.push({
            $match: { _cityId: { $in: newSettingsId } },
          });
        }

        if (dto.relationshipManagerIds.length > 0) {
          var newSettingsId = [];
          dto.relationshipManagerIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          pipelineShop.push({
            $match: { _relationshipManagerId: { $in: newSettingsId } },
          });
        }

        if (dto.orderHeadIds.length > 0) {
          var newSettingsId = [];
          dto.orderHeadIds.map((mapItem) => {
            newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
          });
          pipelineShop.push({
            $match: { _orderHeadId: { $in: newSettingsId } },
          });
        }

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.SHOPS,
              let: { shopId: '$_shopId' },
              pipeline: pipelineShop,
              as: 'mongoCheckShopList',
            },
          },
          {
            $match: { mongoCheckShopList: { $ne: [] } },
          },
        );
      }

      console.log("____product list 6");
      if (dto.orderSaleUids.length != 0) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ORDER_SALES_ITEMS,
              let: { ordersaleItemsId: '$_orderItemId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$ordersaleItemsId'] },
                  },
                },
                {
                  $project: {
                    _orderSaleId: 1,
                  },
                },

                {
                  $lookup: {
                    from: ModelNames.ORDER_SALES_MAIN,
                    let: { ordersaleId: '$_orderSaleId' },
                    pipeline: [
                      {
                        $match: {
                          _uid: { $in: dto.orderSaleUids },
                          $expr: { $eq: ['$_id', '$$ordersaleId'] },
                        },
                      },
                      {
                        $project: {
                          _uid: 1,
                        },
                      },
                    ],
                    as: 'ordersaleDetails',
                  },
                },
                {
                  $unwind: {
                    path: '$ordersaleDetails',
                  },
                },
              ],
              as: 'ordersaleItems',
            },
          },
          {
            $unwind: {
              path: '$ordersaleItems',
            },
          },
        );
      }

      console.log("____product list 7");
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
            $sort: { _name: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 3:
          arrayAggregation.push({
            $sort: { _designerId: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 4:
          arrayAggregation.push({
            $sort: { _grossWeight: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 5:
          arrayAggregation.push({
            $sort: { _type: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 6:
          arrayAggregation.push({
            $sort: { _purity: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 7:
          arrayAggregation.push({
            $sort: { _hmSealingStatus: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 8:
          arrayAggregation.push({
            $sort: { _huId: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 9:
          arrayAggregation.push({
            $sort: { _eCommerceStatus: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
        case 10:
          arrayAggregation.push({
            $sort: { _soldCount: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }
      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      console.log("____product list 8");
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
      console.log("____product list 8");
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

      console.log("____product list 9");
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
      console.log("____product list 10");
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
      console.log("____product list 11");
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
      console.log("____product list 11");
      if (dto.screenType.includes(105)) {
        const productStoneLinkingPipeline = () => {
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
          }
          const productStoneLinkingColourMaster = dto.screenType.includes(111);
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
      console.log("____product list 12");
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
      console.log("____product list 12");
      if (dto.screenType.includes(115)) {
        const productTagsLinkingPipeline = () => {
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
            new ModelWeightResponseFormat().productTagLinkingResponseFormat(
              1150,
              dto.responseFormat,
            ),
          );

          const productTagLinkingTagMaster = dto.screenType.includes(116);
          if (productTagLinkingTagMaster) {
            const productTagsLinkingTagMasterPipeline = () => {
              const pipeline = [];
              pipeline.push(
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$tagId'] },
                  },
                },
                new ModelWeightResponseFormat().tagMasterResponseFormat(
                  1160,
                  dto.responseFormat,
                ),
              );

              if (dto.screenType.includes(117)) {
                const productTagsDocumentsLinkingPipeline = () => {
                  const pipeline = [];
                  pipeline.push(
                    {
                      $match: {
                        $expr: { $eq: ['$_tagId', '$$tagChildId'] },
                      },
                    },
                    { $sort: { _priority: 1 } },
                    new ModelWeightResponseFormat().tagDocumentsLinkingResponseFormat(
                      1170,
                      dto.responseFormat,
                    ),
                  );

                  if (dto.screenType.includes(118)) {
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

                pipeline.push({
                  $lookup: {
                    from: ModelNames.TAG_MASTER_DOCUMENTS,
                    let: { tagChildId: '$_id' },
                    pipeline: productTagsDocumentsLinkingPipeline(),
                    as: 'tagDocumentsLinkings',
                  },
                });
              }
              return pipeline;
            };

            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.TAG_MASTERS,
                  let: { tagId: '$_tagId' },
                  pipeline: productTagsLinkingTagMasterPipeline(),
                  as: 'tagDetails',
                },
              },
              {
                $unwind: {
                  path: '$tagDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            );
          }
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.PRODUCT_TAG_LINKINGS,
            let: { productId: '$_id' },
            pipeline: productTagsLinkingPipeline(),
            as: 'tagLinkings',
          },
        });
      }
      console.log("____product list 13");
      if (dto.screenType.includes(118)) {
        const designDocumentsLinkingPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                $expr: { $eq: ['$_id', '$$designerId'] },
              },
            },
            new ModelWeightResponseFormat().productTableResponseFormat(
              1180,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(119)) {
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
                  1190,
                  dto.responseFormat,
                ),
              );

              const productsDocumentsGlobalGallery =
                dto.screenType.includes(120);
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
                          1200,
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
                from: ModelNames.PRODUCT_DOCUMENTS_LINKIGS,
                let: { productId: '$_id' },
                pipeline: productDocumentsLinkingPipeline(),
                as: 'documentList',
              },
            });
          }
          return pipeline;
        };

        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.PRODUCTS,
              let: { designerId: '$_designerId' },
              pipeline: designDocumentsLinkingPipeline(),
              as: 'designerDetails',
            },
          },
          {
            $unwind: {
              path: '$designerDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      console.log("____product list 14");
      if (dto.screenType.includes(121)) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.PRODUCTS,
            let: { variantId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  _stockStatus: 1,
                  _type: 2,
                  $expr: { $eq: ['$_designerId', '$$variantId'] },
                },
              },
              { $project: new ModelWeight().productTableCustom1() },
            ],
            as: 'variantLists',
          },
        });
      }
      console.log("____product list 15    "+JSON.stringify(arrayAggregation));
      var result = await this.productModel
        .aggregate(arrayAggregation)
        .session(transactionSession);
        console.log("____product list 16");

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
      console.log("____product list 17");
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
  async getBulkProductBarcode(dto: GetBulkProductBarcodeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var barcodes = [];

      var resultProduct = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.PRODUCTS },
        {
          $inc: {
            _count: dto.count,
          },
        },
        { new: true, session: transactionSession },
      );

      for (var i = 0; i < dto.count; i++) {
        var autoIncrementNumber = resultProduct._count - i;

        var barcode =
          BarCodeQrCodePrefix.BULK_GENERATED_PRODUCT_AND_INVOICE +
          new StringUtils().intToDigitString(autoIncrementNumber, 8);
        barcodes.push(barcode);
      }

      const responseJSON = { message: 'success', data: { list: barcodes } };
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
  async createStockFromProductTemp(
    dto: StockFromProductTempDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCheckStatus = await this.productTempModel.find({
        _id: { $in: dto.productTempIds },
        _status: 1,
      });
      if (resultCheckStatus.length != dto.productTempIds.length) {
        throw new HttpException(
          'Already created stock',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var productTempIdsMongo = [];
      dto.productTempIds.map((mapItem) => {
        productTempIdsMongo.push(new mongoose.Types.ObjectId(mapItem));
      });
      var resultProductTempGet = await this.productTempModel.aggregate([
        { $match: { _id: { $in: productTempIdsMongo }, _status: 1 } },
        {
          $lookup: {
            from: ModelNames.PRODUCT_STONE_LINKING_TEMPS,
            let: { productTempId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_productTempId', '$$productTempId'] },
                },
              },
            ],
            as: 'stoneLinking',
          },
        },
      ]);

      // await this.productTempModel.updateMany(
      //   {
      //     _id: { $in: dto.productTempIds },
      //   },
      //   {
      //     $set: {
      //       _updatedUserId: _userId_,
      //       _updatedAt: dateTime,
      //       _status: 0,
      //     },
      //   },
      //   { new: true, session: transactionSession },
      // );

      var arrayToProducts = [];
      var arrayStonesLinkings = [];

      for (var i = 0; i < resultProductTempGet.length; i++) {
        var productId = new mongoose.Types.ObjectId();
        arrayToProducts.push({
          _id: productId,
          _name: resultProductTempGet[i]._name,
          _designUid: resultProductTempGet[i]._designUid,
          _designerId: resultProductTempGet[i]._designerId,
          _shopId: resultProductTempGet[i]._shopId,
          _orderItemId: resultProductTempGet[i]._orderItemId,
          _grossWeight: resultProductTempGet[i]._grossWeight,
          _barcode: resultProductTempGet[i]._barcode,
          _categoryId: resultProductTempGet[i]._categoryId,
          _subCategoryId: resultProductTempGet[i]._subCategoryId,
          _groupId: resultProductTempGet[i]._groupId,
          _type: resultProductTempGet[i]._type,
          _stockStatus: 1,
          _soldCount: 0,
          _purity: resultProductTempGet[i]._purity,
          _hmSealingStatus: resultProductTempGet[i]._hmSealingStatus,
          _totalStoneWeight: resultProductTempGet[i]._totalStoneWeight,
          _totalStoneAmount: resultProductTempGet[i]._totalStoneAmount,
          _netWeight: resultProductTempGet[i]._netWeight,
          _huId: resultProductTempGet[i]._huId,
          _eCommerceStatus: resultProductTempGet[i]._eCommerceStatus,
          _moldNumber: resultProductTempGet[i]._moldNumber,
          _isStone: resultProductTempGet[i]._isStone,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        resultProductTempGet[i].stoneLinking.forEach((elementStone) => {
          arrayStonesLinkings.push({
            _productId: productId,
            _stoneId: elementStone._stoneId,
            _stoneColourId: elementStone._stoneColourId,
            _stoneWeight: elementStone._stoneWeight,
            _stoneAmount: elementStone._stoneAmount,
            _quantity: elementStone._quantity,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });

        await this.productTempModel.findOneAndUpdate(
          {
            _id: resultProductTempGet[i]._id,
          },
          {
            $set: {
              _generatedProductId: productId,
            },
          },
          { new: true, session: transactionSession },
        );
      }

      await this.productModel.insertMany(arrayToProducts, {
        session: transactionSession,
      });

      await this.productStoneLinkingsModel.insertMany(arrayStonesLinkings, {
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
}
