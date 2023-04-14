import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { User } from 'src/tableModels/user.model';
import {
  UserCheckEmailExistDto,
  UserCheckMobileExistDto,
  UserNotificationCreatetDto,
  UserNotificationListDto,
} from './user.dto';
import { GlobalConfig } from 'src/config/global_config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserNotifications } from 'src/tableModels/user_notifications.model';
import { FcmUtils } from 'src/utils/FcmUtils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.USER_NOTIFICATIONS)
    private readonly userNotificationModel: mongoose.Model<UserNotifications>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async checkEmailExisting(dto: UserCheckEmailExistDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCount = await this.userModel
        .count({
          _email: dto.value,
          _id: { $nin: dto.existingIds },
          _status: { $in: [1, 0] },
        })
        .session(transactionSession);

      const responseJSON = {
        message: 'success',
        data: { count: resultCount },
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

  async checkMobileExisting(dto: UserCheckMobileExistDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultCount = await this.userModel
        .count({
          _mobile: dto.value,
          _id: { $nin: dto.existingIds },
          _status: { $in: [1, 0] },
        })
        .session(transactionSession);

      const responseJSON = {
        message: 'success',
        data: { count: resultCount },
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
  async createUserNotification(dto: UserNotificationCreatetDto) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToUserNotifications = [];
      var arrayUserFcmIds = [];

      dto.array.map((mapItem) => {
        arrayToUserNotifications.push({
          _viewStatus: 0,
          _title: dto.title,
          _body: dto.body,
          _orderSaleId: dto.orderSaleId != '' ? dto.orderSaleId : null,
          _userId: mapItem.userId,
          _viewAt: 0,
          _createdAt: dateTime,
          _status: 1,
        });
        arrayUserFcmIds.push(mapItem.fcmId);
      });

      var result1 = await this.userNotificationModel.insertMany(
        arrayToUserNotifications,
        {
          session: transactionSession,
        },
      );

      new FcmUtils().sendFcm(dto.title, dto.body, arrayUserFcmIds, {
        ajc: 'AJC_NOTIFICATION',
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
  async listUserNotifications(dto: UserNotificationListDto, _userId_: string) {
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
              { _title: new RegExp(dto.searchingText, 'i') },
              { _body: new RegExp(dto.searchingText, 'i') },
            ],
          },
        });
      }
      console.log('_userId_   list notification  ' + _userId_);
      if (dto.screenType.includes(201)) {
        arrayAggregation.push({
          $match: { _userId: new mongoose.Types.ObjectId(_userId_) },
        });
      }

      if (dto.notificationIds.length > 0) {
        var newSettingsId = [];
        dto.notificationIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
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
      }

      if (dto.skip != -1) {
        arrayAggregation.push({ $skip: dto.skip });
        arrayAggregation.push({ $limit: dto.limit });
      }

      console.log(
        'arrayAggregation   list notification  ' +
          JSON.stringify(arrayAggregation),
      );
      var result = await this.userNotificationModel
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

        var resultTotalCount = await this.userNotificationModel
          .aggregate(arrayAggregation)
          .session(transactionSession);
        if (resultTotalCount.length > 0) {
          totalCount = resultTotalCount[0].totalCount;
        }
      }

      if (dto.screenType.includes(200)) {
        var notificationIds = [];
        result.forEach((element) => {
          notificationIds.push(element._id);
        });
        await this.userNotificationModel.updateMany(
          { _id: { $in: notificationIds } , _viewStatus:0,},
          {
            $set: {
              _viewStatus: 1,
              _viewAt: dateTime,
            },
          },
          { new: true, session: transactionSession },
        );
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
