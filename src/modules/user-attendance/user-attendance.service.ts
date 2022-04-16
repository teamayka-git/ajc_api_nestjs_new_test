import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';
import { UserAttendance } from 'src/tableModels/user_attendances.model';
import {
  UserAttendanceDto,
  UserAttendanceListDto,
} from './user_attendance.dto';
@Injectable()
export class UserAttendanceService {
  constructor(
    @InjectModel(ModelNames.USER_ATTENDANCES)
    private readonly userAttendanceModel: mongoose.Model<UserAttendance>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: UserAttendanceDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultAttendace = await this.userAttendanceModel
        .find({ _userId: _userId_, _status: 1 })
        .sort({ _id: -1 })
        .limit(1)
        .session(transactionSession);

      var result;
      if (resultAttendace.length == 0 || resultAttendace[0]._stopTime != 0) {
        const newsettingsModel = new this.userAttendanceModel({
          _userId: _userId_,
          _startTime: dateTime,
          _stopTime: 0,
          _status: 1,
        });
        result = await newsettingsModel.save({
          session: transactionSession,
        });
      } else {
        result = await this.userAttendanceModel.findOneAndUpdate(
          { _id: resultAttendace[0]._id },
          {
            $set: {
              _stopTime: dateTime,
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
  async list(dto: UserAttendanceListDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];
      var userIds = [];

      if (dto.userIds.length > 0) {
        dto.userIds.map((mapItem) => {
          userIds.push(new mongoose.Types.ObjectId(mapItem));
        });
      }

      if (dto.screenType.findIndex((it) => it == 50) != -1) {
        userIds.push(new mongoose.Types.ObjectId(_userId_));
      }
      if (userIds.length != 0) {
        arrayAggregation.push({ $match: { _userId: { $in: userIds } } });
      }

      if (dto.userAttendanceIds.length > 0) {
        var newSettingsId = [];
        dto.userAttendanceIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
      }

      if (dto.startTime != -1) {
        arrayAggregation.push({
          $match: { _startTime: { $gt: dto.startTime } },
        });
      }
      if (dto.stopTime != -1) {
        arrayAggregation.push({
          $match: { _stopTime: { $gt: dto.stopTime } },
        });
      }

      arrayAggregation.push({ $match: { _status: { $in: [1] } } });

      var result = await this.userAttendanceModel
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

        var resultTotalCount = await this.userAttendanceModel
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
