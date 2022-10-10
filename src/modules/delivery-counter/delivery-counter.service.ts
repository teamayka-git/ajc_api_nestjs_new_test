import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryCounters } from 'src/tableModels/delivery_counters.model';
import * as mongoose from 'mongoose';
import {
  DeliveryCounterCreateDto,
  DeliveryCounterEditDto,
  DeliveryCounterLinkUnlinkCreateDto,
  DeliveryCounterListDto,
  DeliveryCounterStatusChangeDto,
} from './delivery_counter.dto';
import { GlobalConfig } from 'src/config/global_config';
import { ModelWeightResponseFormat } from 'src/model_weight/model_weight_response_format';
import { DeliveryCounterUserLinkings } from 'src/tableModels/delivery_counter_user_linkings.model';

@Injectable()
export class DeliveryCounterService {
  constructor(
    @InjectModel(ModelNames.DELIVERY_COUNTERS)
    private readonly deliveryCounterModel: mongoose.Model<DeliveryCounters>,
    @InjectModel(ModelNames.DELIVERY_COUNTER_USER_LINKINGS)
    private readonly deliveryCounterUserLinkingModel: mongoose.Model<DeliveryCounterUserLinkings>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: DeliveryCounterCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToStates = [];
      var arrayToLinkingUser = [];

      dto.array.map((mapItem) => {
        var dcId = new mongoose.Types.ObjectId();
        arrayToStates.push({
          _id: dcId,
          _name: mapItem.name,
          _code: mapItem.code,
          _dataGuard: mapItem.dataGuard,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
        mapItem.userIdsForLink.map((mapItemChild) => {
          arrayToLinkingUser.push({
            _userId: mapItemChild,
            _deliveryCounterId: dcId,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
          });
        });
      });

      var result1 = await this.deliveryCounterModel.insertMany(arrayToStates, {
        session: transactionSession,
      });
      if (arrayToLinkingUser.length != 0) {
        await this.deliveryCounterUserLinkingModel.insertMany(
          arrayToLinkingUser,
          {
            session: transactionSession,
          },
        );
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

  async edit(dto: DeliveryCounterEditDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCheck = await this.deliveryCounterUserLinkingModel.find({
        _deliveryCounterId: dto.deliveryCounterId,
        _userId: { $in: dto.userIdsForLink },
        _status: 1,
      });
      if (resultCheck.length != 0) {
        throw new HttpException(
          'Some users already linked',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var result = await this.deliveryCounterModel.findOneAndUpdate(
        {
          _id: dto.deliveryCounterId,
        },
        {
          $set: {
            _name: dto.name,
            _code: dto.code,
            _dataGuard: dto.dataGuard,
            _updatedUserId: _userId_,
            _updatedAt: dateTime,
          },
        },
        { new: true, session: transactionSession },
      );

      var arrayToLinkingUser = [];
      var arrayToUnlinkLinkingId = [];

      dto.userIdsForLink.map((mapItemChild) => {
        arrayToLinkingUser.push({
          _userId: mapItemChild,
          _deliveryCounterId: dto.deliveryCounterId,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      if (arrayToLinkingUser.length != 0) {
        await this.deliveryCounterUserLinkingModel.insertMany(
          arrayToLinkingUser,
          {
            session: transactionSession,
          },
        );
      }

      dto.userLinkingIdsForUnlink.map((mapItemChild) => {
        arrayToUnlinkLinkingId.push(mapItemChild);
      });

      if (arrayToUnlinkLinkingId.length != 0) {
        await this.deliveryCounterUserLinkingModel.findOneAndUpdate(
          {
            _id: { $in: arrayToUnlinkLinkingId },
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

  async status_change(dto: DeliveryCounterStatusChangeDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.deliveryCounterModel.updateMany(
        {
          _id: { $in: dto.deliveryCounterIds },
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

  async list(dto: DeliveryCounterListDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.searchingText != '') {
        //todo
        arrayAggregation.push({
          $match: {
            $or: [{ _name: new RegExp(dto.searchingText, 'i') },
            { _code: new RegExp(`^${dto.searchingText}$`, 'i') }],
          },
        });
      }
      if (dto.deliveryCounterIds.length > 0) {
        var newSettingsId = [];
        dto.deliveryCounterIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
      arrayAggregation.push({ $sort: { _id: -1 } });

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      arrayAggregation.push(
        new ModelWeightResponseFormat().deliveryCounterResponseFormat(
          0,
          dto.responseFormat,
        ),
      );
      if (dto.screenType.includes(100)) {
        const fcLinkingPipeline = () => {
          const pipeline = [];
          pipeline.push({
            $match: {_status:1, $expr: { $eq: ['$_deliveryCounterId', '$$dcId'] } },
          });

          if (dto.screenType.includes(101)) {
            pipeline.push(
              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { userId: '$_userId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
                    new ModelWeightResponseFormat().userTableResponseFormat(
                      1010,
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
          return pipeline;
        };

        arrayAggregation.push({
          $lookup: {
            from: ModelNames.DELIVERY_COUNTER_USER_LINKINGS,
            let: { dcId: '$_id' },
            pipeline: fcLinkingPipeline(),
            as: 'listDcLinkedList',
          },
        });
      }
      var result = await this.deliveryCounterModel
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

        var resultTotalCount = await this.deliveryCounterModel
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

  async linkAndUnlinkUser(
    dto: DeliveryCounterLinkUnlinkCreateDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultLinkAndUnlink=[];
      var resultCheck = await this.deliveryCounterUserLinkingModel.find({
        _deliveryCounterId: dto.dcId,
        _userId: { $in: dto.userIdsForLink },
        _status: 1,
      });
      if (resultCheck.length != 0) {
        throw new HttpException(
          'Some users already linked',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var arrayToLinkingUser = [];
      var arrayToUnlinkLinkingId = [];

      dto.userIdsForLink.map((mapItemChild) => {
        arrayToLinkingUser.push({
          _userId: mapItemChild,
          _deliveryCounterId: dto.dcId,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      if (arrayToLinkingUser.length != 0) {
        resultLinkAndUnlink=   await this.deliveryCounterUserLinkingModel.insertMany(
          arrayToLinkingUser,
          {
            session: transactionSession,
          },
        );
      }

      dto.userLinkingIdsForUnlink.map((mapItemChild) => {
        arrayToUnlinkLinkingId.push(mapItemChild);
      });

      if (arrayToUnlinkLinkingId.length != 0) {
        await this.deliveryCounterUserLinkingModel.findOneAndUpdate(
          {
            _id: { $in: arrayToUnlinkLinkingId },
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

      const responseJSON = { message: 'success', data: {listLinkUnlink:resultLinkAndUnlink} };
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
