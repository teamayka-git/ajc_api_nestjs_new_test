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
  ProductEditDto,
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
import { ProductTagLinkings } from 'src/tableModels/product_tag_linkings.model';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { ProductsDocuments } from 'src/tableModels/products_documents.model';

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
    @InjectModel(ModelNames.HALMARKING_REQUESTS)
    private readonly halmarkRequestModel: Model<HalmarkingRequests>,

    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: Model<OrderSaleHistories>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: ProductCreateDto, _userId_: string, file: Object) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {

console.log("___dto  "+JSON.stringify(dto));
console.log("___a1");
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
      console.log("___a2");
      var arrayToProducts = [];

      var arrayStonesLinkings = [];
      var arrayTagLinkings = [];
      var arrayOrderSaleHistory = [];
      var arraySubCategoryidsMDB = [];

      console.log("___a2.0");
      dto.arrayItems.forEach((it) => {
        
      console.log("___a2.00");
      console.log("___a2.01   "+it.subCategoryId);
      
      console.log("___a2.011");
        arraySubCategoryidsMDB.push(
          new mongoose.Types.ObjectId(it.subCategoryId),
        );
        
      console.log("___a2.02");
      });

      console.log("___a2.1");
      console.log("___a2.2  "+JSON.stringify(arraySubCategoryidsMDB));
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
      console.log("___a3");
      if (resultSubcategory.length == 0) {
        throw new HttpException(
          'subCategory Is Empty',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      console.log("___a3.0");
      var resultProduct = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.PRODUCTS },
        {
          $inc: {
            _count: dto.arrayItems.length,
          },
        },
        { new: true, session: transactionSession },
      );

      console.log("___a3.1   "+JSON.stringify(resultProduct));
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
      
      console.log("___a3.2");
      if (resultPhotographer.length == 0) {
        throw new HttpException(
          'Photography department not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      console.log("___a3.3");
      if (resultPhotographer[0].employeeList.length == 0) {
        throw new HttpException(
          'Photography employees not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      console.log("___a4");
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
        if (dto.arrayItems[i].type != 3) {
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
        console.log("___a5");
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

            console.log('___a2  '+designId);
            console.log('___a2.1  '+designId);
            console.log('___a2.2  '+dto.arrayItems[i].designId);
        arrayToProducts.push({
          _id: productId,
          _name: dto.arrayItems[i].name,
          _designerId: dto.arrayItems[i].eCommerceStatus == 0 ? null : designId,
          _shopId: shopId,
          _orderItemId: orderItemId,
          _designUid: designUid,
          _productType: 0,
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
          _isStone: dto.arrayItems[i].isStone,
          _moldNumber: dto.arrayItems[i].moldNumber,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        console.log('___a3');
        if (dto.arrayItems[i].eCommerceStatus == 1 && dto.arrayItems[i].type!=3) {
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

            _productType: 1,
            _netWeight: dto.arrayItems[i].netWeight,
            _totalStoneWeight: dto.arrayItems[i].totalStoneWeight,
            _grossWeight: dto.arrayItems[i].grossWeight,
            _barcode: '',
            _categoryId: resultSubcategory[subCategoryIndex]._categoryId,
            _subCategoryId: dto.arrayItems[i].subCategoryId,
            _groupId:
              resultSubcategory[subCategoryIndex].categoryDetails._groupId,
            _type: 3,
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
                _workStatus:
                  dto.arrayItems.findIndex((it) => it.hmSealingStatus == 1) !=
                  -1
                    ? 8
                    : 6,
              },
            },
            { new: true, session: transactionSession },
          );
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
            _deliveryCounterId: null,
            _deliveryProviderId: null,
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

      if (file.hasOwnProperty('image')) {
        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: dto.arrayDocuments,
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

          var count = dto.arrayDocuments.findIndex(
            (it) => it.fileOriginalName == file['documents'][i]['originalname'],
          );
          if (count != -1) {
            dto.arrayDocuments[count]['url'] = resultUpload['url'];
          } else {
            dto.arrayDocuments[count]['url'] = 'nil';
          }
        }

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

      var arrayToProducts = [];

      var arrayStonesLinkings = [];
      var arrayTagLinkings = [];
      var arrayOrderSaleHistory = [];
      var arraySubCategoryidsMDB = [];

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

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [
              { _moldNumber: new RegExp(`^${dto.searchingText}$`, 'i') },
              { _name: new RegExp(dto.searchingText, 'i') },
              { _barcode: new RegExp(`^${dto.searchingText}$`, 'i') },
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

      if (dto.isStone.length > 0) {
        arrayAggregation.push({
          $match: { _isStone: { $in: dto.isStone } },
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
      var result = await this.productModel
        .aggregate(arrayAggregation)
        .session(transactionSession);
      console.log(
        'arrayAggregation product __  ' + JSON.stringify(arrayAggregation),
      );
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
