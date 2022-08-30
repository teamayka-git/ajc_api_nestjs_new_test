import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FactoriesCreateDto } from '../factories/factories.dto';
import * as mongoose from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { GoldTestRequests } from 'src/tableModels/gold_testing_requests.model';
import { GoldTestRequestItems } from 'src/tableModels/gold_testing_request_items.model';
import {
  GoldTestRequestCreateDto,
  GoldTestRequestEditDto,
  GoldTestRequestItemEditFromManufactorDto,
  GoldTestRequestItemEditFromTestCenterDto,
  GoldTestRequestListDto,
  GoldTestRequestStatusChangeDto,
} from './gold_test_requests.dto';
import { Counters } from 'src/tableModels/counters.model';
import { GlobalConfig } from 'src/config/global_config';
import { CompanyListDto } from '../company/company.dto';

@Injectable()
export class GoldTestingRequestService {
  constructor(
    @InjectModel(ModelNames.GOLD_TESTING_REQUESTS)
    private readonly goldTestRequestModel: mongoose.Model<GoldTestRequests>,
    @InjectModel(ModelNames.GOLD_TESTING_REQUEST_ITEMS)
    private readonly goldTestRequestItemsModel: mongoose.Model<GoldTestRequestItems>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: GoldTestRequestCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToGoldRequestItems = [];

      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.GOLD_TESTING_REQUESTS },
        {
          $inc: {
            _count: 1,
          },
        },
        { new: true, session: transactionSession },
      );

      var goldRequestId = new mongoose.Types.ObjectId();
      const goldTestRequest = new this.goldTestRequestModel({
        _id: goldRequestId,
        _testCenterId: dto.testCenterId,
        _uid: resultCounterPurchase._count,
        _workStatus: 0,
        _rootCauseId: null,
        _description: '',
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _updatedUserId: null,
        _updatedAt: -1,
        _status: 1,
      });
      var resultGoldRequest = await goldTestRequest.save({
        session: transactionSession,
      });

      dto.arrayItems.map((mapItem) => {
        arrayToGoldRequestItems.push({
          _goldTestRequesId: goldRequestId,
          _groupId: mapItem.groupId,
          _weight: mapItem.weight,
          _fineWeight: mapItem.fineWeight,
          _expectedPurity: mapItem.expectedPurity,
          _purity: mapItem.purity,
          _testedWeight: -1,
          _receivedWeight: -1,
          _testedPurity: -1,
          _actualFineWeight: -1,
          _weightLoss: -1,
          _allowedWeightLoss: mapItem.allowedWeightLoss,
          _testCharge: -1,
          _total: -1,
          _cgst: -1,
          _isUpdateManufacureItemVerificationComplete:0,
          _isUpdateTestCenterItemVerificationComplete:0,
          _sgst: -1,
          _igst: -1,
          _tcDoneUserId: null,
          _verifiedManufactureUserId: null,
          _verifiedManufactureTime: -1,
          _tcDoneTime: -1,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: 0,
          _status: 1,
        });
      });

      var result1 = await this.goldTestRequestItemsModel.insertMany(
        arrayToGoldRequestItems,
        {
          session: transactionSession,
        },
      );

      const responseJSON = { message: 'success', data: resultGoldRequest };
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

  async updateGoldRequest(dto: GoldTestRequestEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {



      for(var i=0;i<dto.arrayItems.length;i++){
        await this.goldTestRequestModel.findOneAndUpdate(
          {
            _id: dto.arrayItems[i].goldTestRequestId,
          },
          {
            $set: {
              _workStatus: dto.arrayItems[i].workStatus,
              _rootCauseId:  (dto.arrayItems[i].rootCauseId==""||dto.arrayItems[i].rootCauseId=="nil")?null:dto.arrayItems[i].rootCauseId,
              _description: dto.arrayItems[i].description,
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

  async updateGoldRequestItemFromTestCenter(
    dto: GoldTestRequestItemEditFromTestCenterDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var objectForUpdate = {
        _testedWeight: dto.testedWeight,
        _testedPurity: dto.testedPurity,
        _weightLoss: dto.weightLoss,
        _testCharge: dto.testCharge,
        _total: dto.total,
        _cgst: dto.cgst,
        _sgst: dto.sgst,
        _igst: dto.igst,
        _isUpdateTestCenterItemVerificationComplete:dto.isUpdateTestCenterItemVerificationComplete,

        _updatedUserId: _userId_,
        _updatedAt: dateTime,
      };

      if (dto.isUpdateTestCenterItemVerificationComplete == 1) {
        objectForUpdate['_tcDoneUserId'] = _userId_;
        objectForUpdate['_tcDoneTime'] = dateTime;
      }

      var result = await this.goldTestRequestItemsModel.findOneAndUpdate(
        {
          _id: dto.goldTestRequestItemId,
        },
        {
          $set: objectForUpdate,
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

  async updateGoldRequestItemFromManufactor(
    dto: GoldTestRequestItemEditFromManufactorDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var objectForUpdate = {
        _receivedWeight: dto.receivedWeight,
        _actualFineWeight: dto.actualFineWeight,
        _isUpdateManufacureItemVerificationComplete:dto.isUpdateManufacureItemVerificationComplete,
        _updatedUserId: _userId_,
        _updatedAt: dateTime,
      };

      if (dto.isUpdateManufacureItemVerificationComplete == 1) {
        objectForUpdate['_verifiedManufactureUserId'] = _userId_;
        objectForUpdate['_verifiedManufactureTime'] = dateTime;
      }

      var result = await this.goldTestRequestItemsModel.findOneAndUpdate(
        {
          _id: dto.goldTestRequestItemId,
        },
        {
          $set: objectForUpdate,
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

  async status_change(dto: GoldTestRequestStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.goldTestRequestModel.updateMany(
        {
          _id: { $in: dto.goldTestRequestIds },
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

  async list(dto: GoldTestRequestListDto) {
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
              { _uid:new RegExp(`^${dto.searchingText}$`, 'i') },
            ],
          },
        });
      }
      if (dto.goldRequestIdsIds.length > 0) {
        var newSettingsId = [];
        dto.goldRequestIdsIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
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
      if (dto.workStatus.length > 0) {
        arrayAggregation.push({
          $match: { _workStatus: { $in: dto.workStatus } },
        });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      switch (dto.sortType) {
        case 0:
          arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
          break;
        case 1:
          arrayAggregation.push({ $sort: { _status: dto.sortOrder } });
          break;
        case 2:
          arrayAggregation.push({ $sort: { _uid: dto.sortOrder } });
          break;
        case 3:
          arrayAggregation.push({ $sort: { _workStatus: dto.sortOrder } });
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
              from: ModelNames.TEST_CENTER_MASTERS,
              let: { testCenterId: '$_testCenterId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$testCenterId'] } } },
              ],
              as: 'testCenterDetails',
            },
          },
          {
            $unwind: {
              path: '$testCenterDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (dto.screenType.includes( 101)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.ROOT_CAUSES,
              let: { rootCauseId: '$_rootCauseId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$rootCauseId'] } } },
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
      if (dto.screenType.includes(102)) {
        arrayAggregation.push(
          {
            $lookup: {
              from: ModelNames.USER,
              let: { userId: '$_createdUserId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$userId'] },
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
      if (dto.screenType.includes(103)) {
        arrayAggregation.push({
          $lookup: {
            from: ModelNames.GOLD_TESTING_REQUEST_ITEMS,
            let: { requestId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: { $eq: ['$_goldTestRequesId', '$$requestId'] },
                },
              },
            ],
            as: 'goldTestRequestItems',
          },
        });

        if (dto.screenType.includes(104)) {
          arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline.push(
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
        if (dto.screenType.includes( 105)) {
          arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline.push(
            {
              $lookup: {
                from: ModelNames.USER,
                let: { userId: '$_tcDoneUserId' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$userId'] },
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
                as: 'tcDoneUserDetails',
              },
            },
            {
              $unwind: {
                path: '$tcDoneUserDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
          );
        }
        if (dto.screenType.includes( 106)) {
          arrayAggregation[arrayAggregation.length - 1].$lookup.pipeline.push(
            {
              $lookup: {
                from: ModelNames.USER,
                let: { userId: '$_verifiedManufactureUserId' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$userId'] },
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
                as: 'manufactureVerificationDoneUserDetails',
              },
            },
            {
              $unwind: {
                path: '$manufactureVerificationDoneUserDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
          );
        }
      }
      var result = await this.goldTestRequestModel
        .aggregate(arrayAggregation)
        .session(transactionSession);

      var totalCount = 0;
      if (dto.screenType.includes( 0)) {
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

        var resultTotalCount = await this.goldTestRequestModel
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
