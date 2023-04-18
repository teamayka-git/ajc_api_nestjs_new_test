import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { User } from 'src/tableModels/user.model';
import { UserNotifications } from 'src/tableModels/user_notifications.model';

@Injectable()
export class CronJobSchedulerServiceService {
  constructor(
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.USER_NOTIFICATIONS)
    private readonly userNotificationModel: mongoose.Model<UserNotifications>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  @Cron('0 0 * * *')
  async handleCron() {
    console.log('_____ cronjob');
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToUserNotifications = [];
      arrayToUserNotifications.push({
        _viewStatus: 0,
        _title: 'From cronjob',
        _body: 'From cronjob',
        _orderSaleId: null,
        _userId: null,
        _viewAt: 0,
        _createdAt: dateTime,
        _status: 1,
      });
      await this.userNotificationModel.insertMany(arrayToUserNotifications, {
        session: transactionSession,
      });

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      //   return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }
}
