import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { User } from 'src/tableModels/user.model';
import { UserNotifications } from 'src/tableModels/user_notifications.model';
import { Departments } from 'src/tableModels/departments.model';
import { FcmUtils } from 'src/utils/FcmUtils';
import { Products } from 'src/tableModels/products.model';
import {
  endOfDay,
  endOfMonth,
  endOfToday,
  startOfDay,
  startOfMonth,
} from 'date-fns';

@Injectable()
export class CronJobSchedulerServiceService {
  constructor(
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.USER_NOTIFICATIONS)
    private readonly userNotificationModel: mongoose.Model<UserNotifications>,
    @InjectModel(ModelNames.DEPARTMENT)
    private readonly departmentModel: mongoose.Model<Departments>,
    @InjectModel(ModelNames.PRODUCTS)
    private readonly productModel: mongoose.Model<Products>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  @Cron('0 11,17 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async ohNotAssignedWorkerCountSendCronJob() {
    console.log('_____ cronjob ohNotAssignedWorkerCountSendCronJob()');
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.departmentModel.aggregate([
        { $match: { _code: 1000, _status: 1 } },
        {
          $lookup: {
            from: ModelNames.EMPLOYEES,
            let: { departmentId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $eq: ['$_departmentId', '$$departmentId'],
                  },
                },
              },
              {
                $project: {
                  _userId: 1,
                },
              },

              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        _status: 1,
                        $expr: {
                          $eq: ['$_id', '$$userId'],
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        _name: 1,
                        _isNotificationEnable: 1,
                        _fcmId: 1,
                      },
                    },

                    {
                      $lookup: {
                        from: ModelNames.ORDER_SALES_MAIN,
                        let: { userId: '$_id' },
                        pipeline: [
                          {
                            $match: {
                              _workStatus: 3,
                              _status: 1,
                              $expr: {
                                $eq: ['$_orderHeadId', '$$userId'],
                              },
                            },
                          },
                          {
                            $project: {
                              _id: 1,
                            },
                          },
                          {
                            $lookup: {
                              from: ModelNames.ORDER_SALE_SET_PROCESSES,
                              let: { osId: '$_id' },
                              pipeline: [
                                {
                                  $match: {
                                    _status: 1,
                                    _orderStatus: { $in: [0, 4, 5, 6, 7] },
                                    $expr: {
                                      $eq: ['$_orderSaleId', '$$osId'],
                                    },
                                  },
                                },
                                {
                                  $project: {
                                    _id: 1,
                                  },
                                },
                              ],
                              as: 'setProcessList',
                            },
                          },
                          {
                            $match: { setProcessList: { $ne: [] } },
                          },
                          {
                            $group: { _id: null, totalCount: { $sum: 1 } },
                          },
                        ],
                        as: 'orderSaleList',
                      },
                    },
                    {
                      $unwind: {
                        path: '$orderSaleList',
                      },
                    },
                  ],
                  as: 'userDetails',
                },
              },
              {
                $unwind: {
                  path: '$userDetails',
                },
              },
            ],
            as: 'employeeDetails',
          },
        },
      ]);
      if (result.length != 0) {
        for (var j = 0; j < result[0].employeeDetails.length; j++) {
          //doing notification

          var userFcmIds = [];
          var userNotificationTable = [];
          var notificationTitle = 'Pending set process';
          var notificationBody = `Your ${result[0].employeeDetails[j].userDetails.orderSaleList.totalCount} set process not assigned to workers, its still not pending`;
          var notificationOrderSale = '';

          if (
            result[0].employeeDetails[j].userDetails._isNotificationEnable ==
              1 &&
            result[0].employeeDetails[j].userDetails._fcmId != ''
          ) {
            userFcmIds.push(result[0].employeeDetails[j].userDetails._fcmId);
          }
          userNotificationTable.push({
            _viewStatus: 0,
            _title: notificationTitle,
            _body: notificationBody,
            _orderSaleId:
              notificationOrderSale == '' ? null : notificationOrderSale,
            _userId: result[0].employeeDetails[j].userDetails._id,
            _createdAt: dateTime,
            _viewAt: 0,
            _status: 1,
          });

          if (userNotificationTable.length != 0) {
            await this.userNotificationModel.insertMany(userNotificationTable, {
              session: transactionSession,
            });
          }
          if (userFcmIds.length != 0) {
            new FcmUtils().sendFcm(
              notificationTitle,
              notificationBody,
              userFcmIds,
              {
                ajc: 'AJC_NOTIFICATION',
              },
            );
          }
          //done notification
        }
      }

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      //   return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }



  @Cron('5 16 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async workerTodayDueAndBacklogCountSendCronJob() {
    console.log('_____ cronjob workerTodayDueAndBacklogCountSendCronJob()');
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.departmentModel.aggregate([
        { $match: { _code: 1003, _status: 1 } },
        {
          $lookup: {
            from: ModelNames.EMPLOYEES,
            let: { departmentId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $eq: ['$_departmentId', '$$departmentId'],
                  },
                },
              },
              {
                $project: {
                  _userId: 1,
                },
              },

              {
                $lookup: {
                  from: ModelNames.USER,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        _status: 1,
                        $expr: {
                          $eq: ['$_id', '$$userId'],
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        _name: 1,
                        _isNotificationEnable: 1,
                        _fcmId: 1,
                      },
                    },

                    {
                      $lookup: {
                        from: ModelNames.ORDER_SALE_SET_PROCESSES,
                        let: { userId: '$_id' },
                        pipeline: [
                          {
                            $match: {
                              _dueDate: {
                                $lte: endOfDay(dateTime).getTime(),
                                $gte: startOfDay(dateTime).getTime(),
                              },
                              _status: 1,
                              _orderStatus: { $in: [1, 2] },
                              $expr: {
                                $eq: ['$_userId', '$$userId'],
                              },
                            },
                          },
                          {
                            $project: {
                              _id: 1,
                            },
                          },
                          {
                            $group: { _id: null, totalCount: { $sum: 1 } },
                          },
                        ],
                        as: 'todaySetProcess',
                      },
                    },
                    
                    {
                      $lookup: {
                        from: ModelNames.ORDER_SALE_SET_PROCESSES,
                        let: { userId: '$_id' },
                        pipeline: [
                          {
                            $match: {
                              _dueDate: {
                                $lte: startOfDay(dateTime).getTime(),
                              },
                              _status: 1,
                              _orderStatus: { $in: [1, 2] },
                              $expr: {
                                $eq: ['$_userId', '$$userId'],
                              },
                            },
                          },
                          {
                            $project: {
                              _id: 1,
                            },
                          },
                          {
                            $group: { _id: null, totalCount: { $sum: 1 } },
                          },
                        ],
                        as: 'backlogSetProcess',
                      },
                    },
                    {
                      $match: {
                        $or: [
                          { todaySetProcess: { $ne: [] } },
                          { backlogSetProcess: { $ne: [] } },
                        ],
                      },
                    },
                  
                  ],
                  as: 'userDetails',
                },
              },
              {
                $unwind: {
                  path: '$userDetails',
                },
              },
            ],
            as: 'employeeDetails',
          },
        },
      ]);

      
      if (result.length != 0) {
        for (var j = 0; j < result[0].employeeDetails.length; j++) {
          //doing notification

          var userFcmIds = [];
          var userNotificationTable = [];
          var notificationTitle = 'Set process due date report';
          var notificationBody = `Your set process `;
          if(result[0].employeeDetails[j].userDetails.todaySetProcess.length!=0){
            notificationBody+=`${result[0].employeeDetails[j].userDetails.todaySetProcess[0].totalCount} items due date is today and `;
          }
          if(result[0].employeeDetails[j].userDetails.backlogSetProcess.length!=0){
            notificationBody+=`${result[0].employeeDetails[j].userDetails.backlogSetProcess[0].totalCount} items already backlog`;
          }
          var notificationOrderSale = '';

          if (
            result[0].employeeDetails[j].userDetails._isNotificationEnable ==
              1 &&
            result[0].employeeDetails[j].userDetails._fcmId != ''
          ) {
            userFcmIds.push(result[0].employeeDetails[j].userDetails._fcmId);
          }
          userNotificationTable.push({
            _viewStatus: 0,
            _title: notificationTitle,
            _body: notificationBody,
            _orderSaleId:
              notificationOrderSale == '' ? null : notificationOrderSale,
            _userId: result[0].employeeDetails[j].userDetails._id,
            _createdAt: dateTime,
            _viewAt: 0,
            _status: 1,
          });

          if (userNotificationTable.length != 0) {
            await this.userNotificationModel.insertMany(userNotificationTable, {
              session: transactionSession,
            });
          }
          if (userFcmIds.length != 0) {
            new FcmUtils().sendFcm(
              notificationTitle,
              notificationBody,
              userFcmIds,
              {
                ajc: 'AJC_NOTIFICATION',
              },
            );
          }
          //done notification
        }
      }

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      //   return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  @Cron('30 17 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async sendShopUserTodayAddedDesignsCronJob() {
    console.log('_____ cronjob sendShopUserTodayAddedDesignsCronJob()');
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.productModel.count({
        _createdAt: {
          $lte: endOfDay(dateTime).getTime(),
          $gte: startOfDay(dateTime).getTime(),
        },
        _type: 3,
        _status: 1,
      });

      if (result > 0) {
         //doing notification
      var userFcmCheck = await this.userModel.find(
        { _shopId: {$ne:null},_status:1 },
        { _isNotificationEnable: 1, _fcmId: 1 },
      );
      var userFcmIds = [];
      var userNotificationTable = [];
      var notificationTitle = 'Online store updated';
      var notificationBody = `Today ${result} items added to online store`;
      var notificationOrderSale = "";
      userFcmCheck.forEach((elementUserNotification) => {
        if (
          elementUserNotification._isNotificationEnable == 1 &&
          elementUserNotification._fcmId != ''
        ) {
          userFcmIds.push(elementUserNotification._fcmId);
        }
        userNotificationTable.push({
          _viewStatus: 0,
          _title: notificationTitle,
          _body: notificationBody,
          _orderSaleId:
            notificationOrderSale == '' ? null : notificationOrderSale,
          _userId: elementUserNotification._id,
          _createdAt: dateTime,
          _viewAt: 0,
          _status: 1,
        });
      });
      if (userNotificationTable.length != 0) {
        await this.userNotificationModel.insertMany(userNotificationTable, {
          session: transactionSession,
        });
      }
      if (userFcmIds.length != 0) {
        new FcmUtils().sendFcm(
          notificationTitle,
          notificationBody,
          userFcmIds,
          {
            ajc: 'AJC_NOTIFICATION',
          },
        );
      }
      //done notification
      }

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
