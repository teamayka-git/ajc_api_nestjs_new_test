import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { EmployeeStockInHands } from 'src/tableModels/employee_stock_in_hand.model';
import { EmployeeStockInHandsItem } from 'src/tableModels/employee_stock_in_hand_item.model';
import {
  EmployeeStockInHandApproveStatusChangeDto,
  EmployeeStockInHandCreateDto,
  EmployeeStockInHandItemDeliveryStatusChangeDto,
  EmployeeStockInHandListDto,
  EmployeeStockInHandStatusChangeDto,
} from './employee_stock_in_hands.dto';
import { GlobalConfig } from 'src/config/global_config';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { Counters } from 'src/tableModels/counters.model';
import { Products } from 'src/tableModels/products.model';

@Injectable()
export class EmployeeStockHandsService {
  constructor(
    @InjectModel(ModelNames.EMPLOYEE_STOCK_IN_HANDS)
    private readonly employeeStockInHandModel: mongoose.Model<EmployeeStockInHands>,
    @InjectModel(ModelNames.EMPLOYEE_STOCK_IN_HAND_ITEMS)
    private readonly employeeStockInHandItemModel: mongoose.Model<EmployeeStockInHandsItem>,
    @InjectModel(ModelNames.PRODUCTS)
    private readonly productModel: mongoose.Model<Products>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: EmployeeStockInHandCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToPurchaseBooking = [];
      var arrayToPurchaseBookingItem = [];
      var arrayProductIds = [];

      var resultCounterFactoryStockTransfer =
        await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.EMPLOYEE_STOCK_IN_HANDS },
          {
            $inc: {
              _count: dto.array.length,
            },
          },
          { new: true, session: transactionSession },
        );

      dto.array.map((mapItem, index) => {
        var bookingId = new mongoose.Types.ObjectId();

        var uid =
          resultCounterFactoryStockTransfer._count -
          dto.array.length +
          (index + 1);

        arrayToPurchaseBooking.push({
          _id: bookingId,
          _userId: mapItem.userId,
          _approvedStatus: mapItem.approvedStatus,
          _uid: uid,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        mapItem.items.forEach((eachItemItem) => {
          arrayProductIds.push(eachItemItem.productId);
          arrayToPurchaseBookingItem.push({
            _employeeStockInHandsId: bookingId,
            _deliveryStatus: eachItemItem.deliveryStatus,

            _productId: eachItemItem.productId,

            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      });

      var resultProducts = await this.productModel.find({
        _id: { $in: arrayProductIds },
        _stockStatus: 1,
        _status: 1,
      });
      if(resultProducts.length != arrayProductIds.length){
        throw new HttpException('Product is not in stock', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      var result = await this.employeeStockInHandModel.insertMany(
        arrayToPurchaseBooking,
        {
          session: transactionSession,
        },
      );
      await this.employeeStockInHandItemModel.insertMany(
        arrayToPurchaseBookingItem,
        {
          session: transactionSession,
        },
      );

      console.log('__result   stockinhand    ' + JSON.stringify(result));
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

  async status_change(
    dto: EmployeeStockInHandStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.employeeStockInHandModel.updateMany(
        {
          _id: { $in: dto.employeeStockInHandIds },
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
  async changeApproveStatus(
    dto: EmployeeStockInHandApproveStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.employeeStockInHandModel.updateMany(
        {
          _id: { $in: dto.employeeStockInHandIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _approvedStatus: dto.approvedStatus,
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

  async changeItemDeliveryStatus(
    dto: EmployeeStockInHandItemDeliveryStatusChangeDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.employeeStockInHandItemModel.updateMany(
        {
          _id: { $in: dto.employeeStockInHandItemIds },
        },
        {
          $set: {
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
            _deliveryStatus: dto.deliveryStatus,
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

  async list(dto: EmployeeStockInHandListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

        if (dto.searchingText != '') {
          //todo
          arrayAggregation.push({
            $match: {
              $or: [{ _uid: dto.searchingText}],
            },
          });
        }
      if (dto.employeeStockInHandIds.length > 0) {
        var newSettingsId = [];
        dto.employeeStockInHandIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.userIds.length > 0) {
        var newSettingsId = [];
        dto.userIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _userId: { $in: newSettingsId } },
        });
      }

      if (dto.approvedStatus.length != 0) {
        arrayAggregation.push({
          $match: { _approvedStatus: { $in: dto.approvedStatus } },
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
            $sort: { _approvedStatus: dto.sortOrder, _id: dto.sortOrder },
          });
          break;
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }
      arrayAggregation.push(
        new ModelWeightResponseFormat().employeeStockInHandTableResponseFormat(
          0,
          dto.responseFormat,
        ),
      );

      if (dto.screenType.includes(100)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_userId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$userId'] },
                  },
                },
                new ModelWeightResponseFormat().userTableResponseFormat(
                  1000,
                  dto.responseFormat,
                ),
              ],
              as: 'userDetails',
            },
          },
          {
            $unwind: {
              path: '$userDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
 
      if (dto.screenType.includes(101)) {
        const employeeStockInHandItemsPipeline = () => {
          const pipeline = [];
          pipeline.push(
            {
              $match: {
                _status: 1,
                $expr: {
                  $eq: ['$_employeeStockInHandsId', '$$employeeStockInHandId'],
                },
              },
            },
            new ModelWeightResponseFormat().employeeStockInHandItemsTableResponseFormat(
              1010,
              dto.responseFormat,
            ),
          );

          if (dto.screenType.includes(102)) {




            const productPipeline = () => {
              const pipeline = [];
              pipeline.push( {
                $match: {
                  $expr: { $eq: ['$_id', '$$productId'] },
                },
              },
              new ModelWeightResponseFormat().productTableResponseFormat(
                1020,
                dto.responseFormat,
              ),);







              if (dto.screenType.includes(103)) {

                const designDocumentsLinkingPipeline = () => {
                  const pipeline = [];
                  pipeline.push(    {
                    $match: {
                      $expr: { $eq: ['$_id', '$$designerId'] },
                    },
                  },
                  new ModelWeightResponseFormat().productTableResponseFormat(
                    1030,
                    dto.responseFormat,
                  ),);
        
                  if (dto.screenType.includes(104)) {
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
                          1040,
                          dto.responseFormat,
                        ),
                      );
            
                      const productsDocumentsGlobalGallery = dto.screenType.includes(105);
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
                                  1050,
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
                }
        
               
        
        
        
                pipeline.push(
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










              return pipeline;
            }








            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.PRODUCTS,
                  let: { productId: '$_productId' },
                  pipeline:productPipeline(),
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
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.EMPLOYEE_STOCK_IN_HAND_ITEMS,
            let: { employeeStockInHandId: '$_id' },
            pipeline: employeeStockInHandItemsPipeline(),
            as: 'employeeStockInHandItems',
          },
        });
      }

      var result = await this.employeeStockInHandModel
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

        var resultTotalCount = await this.employeeStockInHandModel
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
