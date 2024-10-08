import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import {
  ChangeProcessDescriptionOrderStatusDto,
  ChangeProcessOrderStatusDto,
  ChangeSubProcessOrderStatusDto,
  SetProcessCreateDto,
  SetProcessHistoryListDto,
  SetProcessTakebackDto,
  SetSubProcessHistoryListDto,
} from './order_sale_set_process.dto';
import * as mongoose from 'mongoose';
import { OrderSaleSetProcesses } from 'src/tableModels/order_sale_set_processes.model';
import { OrderSaleSetProcessHistories } from 'src/tableModels/order_sale_set_process_histories.model';
import { OrderSaleSetSubProcesses } from 'src/tableModels/order_sale_set_sub_processes.model';
import { OrderSaleSetSubProcessHistories } from 'src/tableModels/order_sale_set_sub_process_histories.model';
import { SubProcessMaster } from 'src/tableModels/subProcessMaster.model';
import { IndexUtils } from 'src/utils/IndexUtils';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { GlobalConfig } from 'src/config/global_config';
import { Employee } from 'src/tableModels/employee.model';
import { ModelWeight } from 'src/model_weight/model_weight';
import { OrderSalesMain } from 'src/tableModels/order_sales_main.model';
import { Counters } from 'src/tableModels/counters.model';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { GlobalGalleries } from 'src/tableModels/globalGalleries.model';
import { OrderSaleSetProcessDocuments } from 'src/tableModels/set_process_documents.model';
import { ProcessMaster } from 'src/tableModels/processMaster.model';
import { startOfMonth } from 'date-fns';
import { User } from 'src/tableModels/user.model';
import { UserNotifications } from 'src/tableModels/user_notifications.model';
import { FcmUtils } from 'src/utils/FcmUtils';

@Injectable()
export class OrderSaleSetProcessService {
  constructor(
    @InjectModel(ModelNames.ORDER_SALE_SET_PROCESSES_DOCUMENTS)
    private readonly ordersaleSetprocessDocumentsModel: mongoose.Model<OrderSaleSetProcessDocuments>,
    @InjectModel(ModelNames.GLOBAL_GALLERIES)
    private readonly globalGalleryModel: mongoose.Model<GlobalGalleries>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectModel(ModelNames.ORDER_SALE_SET_PROCESSES)
    private readonly orderSaleSetProcessModel: mongoose.Model<OrderSaleSetProcesses>,
    @InjectModel(ModelNames.ORDER_SALE_SET_PROCESS_HISTORIES)
    private readonly orderSaleSetProcessHistoriesModel: mongoose.Model<OrderSaleSetProcessHistories>,
    @InjectModel(ModelNames.ORDER_SALE_SET_SUB_PROCESSES)
    private readonly orderSaleSetSubProcessModel: mongoose.Model<OrderSaleSetSubProcesses>,
    @InjectModel(ModelNames.ORDER_SALE_SET_SUB_PROCESS_HISTORIES)
    private readonly orderSaleSetSubProcessHistoriesModel: mongoose.Model<OrderSaleSetSubProcessHistories>,
    @InjectModel(ModelNames.EMPLOYEES)
    private readonly employeeModel: mongoose.Model<Employee>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: mongoose.Model<OrderSaleHistories>,

    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.USER_NOTIFICATIONS)
    private readonly userNotificationModel: mongoose.Model<UserNotifications>,
    @InjectModel(ModelNames.PROCESS_MASTER)
    private readonly processMasterModel: mongoose.Model<ProcessMaster>,
    @InjectModel(ModelNames.ORDER_SALES_MAIN)
    private readonly orderSaleMainModel: mongoose.Model<OrderSalesMain>,
    @InjectModel(ModelNames.SUB_PROCESS_MASTER)
    private readonly subProcessModel: mongoose.Model<SubProcessMaster>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(dto: SetProcessCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToSetProcess = [];
      var arrayToSetProcessHistories = [];
      var arrayToSetSubProcess = [];
      var arrayToSetSubProcessHistories = [];

      var arrayToOrderSaleHistories = [];
      var arrayProcessIds = [];
      var arrayOrdersaleIds = [];

      dto.array.map((mapItem) => {
        arrayOrdersaleIds.push(mapItem.orderSaleId);

        mapItem.arrayProcess.map((mapItem1) => {
          arrayProcessIds.push(mapItem1.processId);
        });
      });

      var resultCheckOrderSale = await this.orderSaleMainModel.find({
        _id: { $in: arrayOrdersaleIds },
        _workStatus: 1,
      });

      if (resultCheckOrderSale.length != arrayOrdersaleIds.length) {
        throw new HttpException(
          'Already done setprocess',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      var resultSubProcess = await this.subProcessModel.find(
        { _processMasterId: { $in: arrayProcessIds }, _status: 1 },
        { _processMasterId: 1, _id: 1 },
      );
      dto.array.map((mapItem) => {
        mapItem.arrayProcess.map((mapItem1, index) => {
          var processId = new mongoose.Types.ObjectId();
          var isLastItem = 0;

          if (mapItem.arrayProcess.length - 1 == index) {
            isLastItem = 1;
          }
          mapItem1['setProcessId'] = processId;
          arrayToSetProcess.push({
            _id: processId,
            _orderSaleId: mapItem.orderSaleId,
            _isLastItem: isLastItem,
            _userId: null,
            _rootCauseId: null,
            _workAssignedTime: -1,
            _workStartedTime: -1,
            _workCompletedTime: -1,
            _processNote: '',
            _rootCause: '',
            _dueDate: mapItem1.dueDate,
            _description: mapItem1.description,
            _index: mapItem1.index,
            _orderStatus: index == 0 ? 0 : -1,
            _processId: mapItem1.processId,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
          arrayToSetSubProcessHistories.push({
            _orderSaleSetProcessId: processId,
            _userId: null,
            _subProcessId: null,
            _type: 0,
            _description: '',
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });

          var arraySubProcessIndexes =
            new IndexUtils().multipleIndexSetSubProcess(
              resultSubProcess,
              mapItem1.processId,
            );
          arraySubProcessIndexes.map((mapItem2) => {
            arrayToSetSubProcess.push({
              _orderSaleSetProcessId: processId,
              _userId: null,
              _description: '',
              _orderStatus: 0,
              _subProcessId: resultSubProcess[mapItem2]._id,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _status: 1,
            });
          });
          arrayToSetProcessHistories.push({
            _orderSaleId: mapItem.orderSaleId,
            _userId: null,
            _type: 0,
            _processId: mapItem1.processId,
            _orderSaleSetProcessId: null,
            _description: mapItem1.description,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _status: 1,
          });
        });

        arrayToOrderSaleHistories.push({
          _orderSaleId: mapItem.orderSaleId,
          _userId: null,
          _shopId: null,
          _deliveryProviderId: null,
          _orderSaleItemId: null,
          _deliveryCounterId: null,
          _type: 3,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      });

      var result1 = await this.orderSaleSetProcessModel.insertMany(
        arrayToSetProcess,
        {
          session: transactionSession,
        },
      );

      /////////set process automatic assign start

      for (var i = 0; i < dto.array.length; i++) {
        // var orderSaleSetProcess = await this.orderSaleSetProcessModel
        //   .aggregate([
        //     {
        //       $match: {
        //         _orderSaleId: dto.array[i].orderSaleId,
        //         _userId: null,
        //         _status: 1,
        //       },
        //     },
        //     { $sort: { _index: 1 } },
        //     { $limit: 1 },
        //     {
        //       $lookup: {
        //         from: ModelNames.PROCESS_MASTER,
        //         let: { processId: '$_processId' },
        //         pipeline: [
        //           { $match: { $expr: { $eq: ['$_id', '$$processId'] } } },
        //         ],
        //         as: 'processDetails',
        //       },
        //     },
        //     {
        //       $unwind: {
        //         path: '$processDetails',
        //       },
        //     },
        //   ])
        //   .session(transactionSession);

        var processMasterDetails = await this.processMasterModel.find({
          _id: dto.array[i].arrayProcess[0].processId,
        });

        if (processMasterDetails.length == 0) {
          throw new HttpException(
            'process not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        if (processMasterDetails[0]._isAutomatic == 1) {
          var resultEmployees = await this.employeeModel
            .aggregate([
              {
                $match: {
                  _processMasterId: new mongoose.Types.ObjectId(
                    processMasterDetails[0]._id,
                  ),
                },
              },
              {
                $project: {
                  _id: 1,
                  _userId: 1,
                },
              },
              {
                $lookup: {
                  from: ModelNames.USER_ATTENDANCES,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        _stopTime: 0,
                        _status: 1,
                        $expr: { $eq: ['$_userId', '$$userId'] },
                      },
                    },
                  ],
                  as: 'userAttendance',
                },
              },
              {
                $match: { userAttendance: { $ne: [] } },
              },
              {
                $lookup: {
                  from: ModelNames.ORDER_SALE_SET_PROCESSES,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        _orderStatus: { $in: [0, 1, 2] },
                        _status: 1,
                        $expr: { $eq: ['$_userId', '$$userId'] },
                      },
                    },
                  ],
                  as: 'setProcessWorkList',
                },
              },
              {
                $lookup: {
                  from: ModelNames.ORDER_SALE_SET_PROCESSES,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        _workCompletedTime: {
                          $gte: startOfMonth(dateTime).getTime(),
                          $lte: dateTime,
                        },
                        _orderStatus: { $in: [3] },
                        _status: 1,
                        $expr: { $eq: ['$_userId', '$$userId'] },
                      },
                    },
                  ],
                  as: 'setProcessWorkListCompleted',
                },
              },
              {
                $project: {
                  _id: 1,
                  _userId: 1,
                  userAttendance: { _id: 1 },
                  workCount: { $size: '$setProcessWorkList' },
                  workCountCompleted: { $size: '$setProcessWorkListCompleted' },
                },
              },
              {
                $sort: {
                  workCount: 1,
                  workCountCompleted: -1,
                },
              },
            ])
            .session(transactionSession);

          if (resultEmployees.length != 0) {
            await this.orderSaleSetProcessModel.findOneAndUpdate(
              {
                _id: dto.array[i].arrayProcess[0]['setProcessId'],
              },
              {
                $set: {
                  _userId: resultEmployees[0]._userId,
                  _workAssignedTime: dateTime,
                  _orderStatus: 1,
                },
              },
              { new: true, session: transactionSession },
            );
            arrayToSetProcessHistories.push({
              _orderSaleId: dto.array[i].orderSaleId,
              _userId: resultEmployees[0]._userId,
              _type: 1,
              _processId: dto.array[i].arrayProcess[0].processId,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _description: '',
              _status: 1,
            });
          }
        }
      }
      /////////set process automatic assign end

      await this.orderSaleSetSubProcessModel.insertMany(arrayToSetSubProcess, {
        session: transactionSession,
      });

      await this.orderSaleSetProcessHistoriesModel.insertMany(
        arrayToSetProcessHistories,
        {
          session: transactionSession,
        },
      );
      await this.orderSaleSetSubProcessHistoriesModel.insertMany(
        arrayToSetSubProcessHistories,
        {
          session: transactionSession,
        },
      );

      await this.orderSaleMainModel.updateMany(
        {
          _id: { $in: arrayOrdersaleIds },
        },
        {
          $set: {
            _workStatus: 3,
          },
        },
        { new: true, session: transactionSession },
      );

      await this.orderSaleHistoriesModel.insertMany(arrayToOrderSaleHistories, {
        session: transactionSession,
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

  async changeProcessOrderStatus(
    dto: ChangeProcessOrderStatusDto,
    _userId_: string,
    file: Object,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayGlobalGalleries = [];
      var arrayGlobalGalleriesDocuments = [];

      if (file.hasOwnProperty('documents') && dto.arrayDocuments != null) {
        var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
          { _tableName: ModelNames.GLOBAL_GALLERIES },
          {
            $inc: {
              _count: dto.arrayDocuments.length,
            },
          },
          { new: true, session: transactionSession },
        );

        for (var i = 0; i < file['documents'].length; i++) {
          var resultUpload = await new S3BucketUtils().uploadMyFile(
            file['documents'][i],
            UploadedFileDirectoryPath.GLOBAL_GALLERY_SET_PROCESS_NOTES,
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
              _setProcessId: dto.orderSaleSetProcessId,
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
        await this.ordersaleSetprocessDocumentsModel.insertMany(
          arrayGlobalGalleriesDocuments,
          {
            session: transactionSession,
          },
        );
      }

      var userIdAfterFinishSetProcessNewAssignForNotification = '';

      console.log('___d1 reject employee    ' + JSON.stringify(dto));
      var objectUpdateOrderSaleSetProcess = {
        _userId: dto.userId == '' || dto.userId == 'nil' ? null : dto.userId,
        _orderStatus: dto.orderStatus,
        _description: dto.description,
        _rootCause: dto.rootCause,
        _rootCauseId:
          dto.rootCauseId == '' || dto.rootCauseId == 'nil'
            ? null
            : dto.rootCauseId,
      };
      console.log('___d2');
      switch (dto.orderStatus) {
        case 1:
          objectUpdateOrderSaleSetProcess['_workAssignedTime'] = dateTime;
          break;
        case 2:
          objectUpdateOrderSaleSetProcess['_workStartedTime'] = dateTime;
          break;
        case 3:
          objectUpdateOrderSaleSetProcess['_workCompletedTime'] = dateTime;
          if (dto.processNote != null) {
            objectUpdateOrderSaleSetProcess['_processNote'] = dto.processNote;
          }
          break;
      }

      var result = await this.orderSaleSetProcessModel.findOneAndUpdate(
        {
          _id: dto.orderSaleSetProcessId,
        },
        {
          $set: objectUpdateOrderSaleSetProcess,
        },
        { new: true, session: transactionSession },
      );
      console.log('___d3');
      var objDefaultProcessHistory = {
        _orderSaleId: result._orderSaleId,
        _userId: null,
        _type: dto.setProcessHistoryType,
        _processId: null,
        _orderSaleSetProcessId: null,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _description: dto.descriptionSetProcessHistory,
        _status: 1,
      };
      console.log('___d4');
      switch (dto.setProcessHistoryType) {
        /*
          0 - created  process
          1 - process work assigned
          2 - process work started
          3 - finished process work
          4 - process work on holding
          5 - process work on reassign request
          6 - process description editted
          7 - rejected
        */
        case 1:
          objDefaultProcessHistory._userId = dto.userId;
          objDefaultProcessHistory._processId = result._processId;
          objDefaultProcessHistory._orderSaleSetProcessId =
            dto.orderSaleSetProcessId;
          break;
        case 2:
          objDefaultProcessHistory._processId = result._processId;
          break;
        case 3:
          objDefaultProcessHistory._processId = result._processId;
          break;
        case 4:
          objDefaultProcessHistory._processId = result._processId;
          break;
        case 5:
          objDefaultProcessHistory._processId = result._processId;
          break;
        case 6:
          objDefaultProcessHistory._processId = result._processId;
          break;
        case 7:
          objDefaultProcessHistory._userId = dto.userId;
          objDefaultProcessHistory._processId = result._processId;
          break;
        case 8:
          objDefaultProcessHistory._processId = result._processId;
          break;
      }
      console.log('___d5');
      const orderSaleSetProcessHistory =
        new this.orderSaleSetProcessHistoriesModel(objDefaultProcessHistory);
      await orderSaleSetProcessHistory.save({
        session: transactionSession,
      });
      console.log('___d6');
      // if (dto.orderStatus == 6) {
      // const orderSaleNewSetProcess = new this.orderSaleSetProcessModel({
      //   _orderSaleId: result._orderSaleId,
      //   _userId: null,
      //   _orderStatus: 0,

      //   _workAssignedTime: -1,
      //   _workStartedTime: -1,
      //   _workCompletedTime: -1,
      //   _index: result._index,
      //   _rootCauseId: null,
      //   _rootCause: '',
      //   _description: '',
      //   _processId: result._processId,
      //   _isLastItem: result._isLastItem,
      //   _createdUserId: result._createdUserId,
      //   _createdAt: dateTime,
      //   _status: 1,
      // });
      // await orderSaleNewSetProcess.save({
      //   session: transactionSession,
      // });

      // const orderSaleNewSetProcessHistory =
      //   new this.orderSaleSetProcessHistoriesModel({
      //     _orderSaleId: result._orderSaleId,
      //     _userId: null,
      //     _type: 8,
      //     _orderSaleSetProcessId: null,
      //     _processId: null,
      //     _description: '',
      //     _createdUserId: null,
      //     _createdAt: dateTime,
      //     _status: 1,
      //   });
      // await orderSaleNewSetProcessHistory.save({
      //   session: transactionSession,
      // });
      // }

      if (dto.orderStatus == 2 || dto.orderStatus == 3) {
        var objSubProcessHistory = {
          _orderSaleSetProcessId: dto.orderSaleSetProcessId,
          _userId: null,
          _subProcessId: null,
          _type: -1,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        };
        if (dto.orderStatus == 2) {
          //started work
          objSubProcessHistory._type = 1;
        } else if (dto.orderStatus == 3) {
          //finished work
          objSubProcessHistory._type = 3;
        }
        console.log('___d7');
        const orderSaleSubProcessHistory =
          new this.orderSaleSetSubProcessHistoriesModel(objSubProcessHistory);
        await orderSaleSubProcessHistory.save({
          session: transactionSession,
        });
        console.log('___d8');
      }

      if (dto.isLastSetProcess == 0 && dto.orderStatus == 3) {
        var orderSaleSetProcess = await this.orderSaleSetProcessModel.aggregate(
          [
            {
              $match: {
                _orderSaleId: result._orderSaleId,
                _userId: null,
                _status: 1,
              },
            },
            { $sort: { _index: 1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: ModelNames.PROCESS_MASTER,
                let: { processId: '$_processId' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$processId'] } } },
                ],
                as: 'processDetails',
              },
            },
            {
              $unwind: {
                path: '$processDetails',
              },
            },
          ],
        );
        console.log('___d9');
        if (orderSaleSetProcess.length == 0) {
          throw new HttpException(
            'Next set process not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        //doing next setprocess workstatus to pending
        await this.orderSaleSetProcessModel.findOneAndUpdate(
          {
            _id: orderSaleSetProcess[0]._id,
          },
          {
            $set: {
              _orderStatus: 0,
            },
          },
          { new: true, session: transactionSession },
        );
        console.log('___d10');
        if (orderSaleSetProcess[0].processDetails._isAutomatic == 1) {
          var resultEmployees = await this.employeeModel
            .aggregate([
              {
                $match: {
                  _processMasterId: new mongoose.Types.ObjectId(
                    orderSaleSetProcess[0]._processId,
                  ),
                },
              },
              {
                $project: {
                  _id: 1,
                  _userId: 1,
                },
              },
              {
                $lookup: {
                  from: ModelNames.USER_ATTENDANCES,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        _stopTime: 0,
                        _status: 1,
                        $expr: { $eq: ['$_userId', '$$userId'] },
                      },
                    },
                  ],
                  as: 'userAttendance',
                },
              },
              {
                $match: { userAttendance: { $ne: [] } },
              },
              {
                $lookup: {
                  from: ModelNames.ORDER_SALE_SET_PROCESSES,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        _orderStatus: { $in: [0, 1, 2] },
                        _status: 1,
                        $expr: { $eq: ['$_userId', '$$userId'] },
                      },
                    },
                  ],
                  as: 'setProcessWorkList',
                },
              },
              {
                $lookup: {
                  from: ModelNames.ORDER_SALE_SET_PROCESSES,
                  let: { userId: '$_userId' },
                  pipeline: [
                    {
                      $match: {
                        _workCompletedTime: {
                          $gte: startOfMonth(dateTime).getTime(),
                          $lte: dateTime,
                        },
                        _orderStatus: { $in: [3] },
                        _status: 1,
                        $expr: { $eq: ['$_userId', '$$userId'] },
                      },
                    },
                  ],
                  as: 'setProcessWorkListCompleted',
                },
              },
              {
                $project: {
                  _id: 1,
                  _userId: 1,
                  userAttendance: { _id: 1 },
                  workCount: { $size: '$setProcessWorkList' },
                  workCountCompleted: { $size: '$setProcessWorkListCompleted' },
                },
              },
              {
                $sort: {
                  workCount: 1,
                  workCountCompleted: -1,
                },
              },
            ])
            .session(transactionSession);
            console.log('___d11');
            console.log('___d11.1    '+JSON.stringify(resultEmployees));
          if (resultEmployees.length != 0) {
            await this.orderSaleSetProcessModel.findOneAndUpdate(
              {
                _id: orderSaleSetProcess[0]._id,
              },
              {
                $set: {
                  _userId: resultEmployees[0]._userId,
                  _workAssignedTime: dateTime,
                  _orderStatus: 1,
                },
              },
              { new: true, session: transactionSession },
            );
            console.log('___d12');
            const orderSaleSetProcessHistoryAutomation =
              new this.orderSaleSetProcessHistoriesModel({
                _orderSaleId: result._orderSaleId,
                _userId: resultEmployees[0]._userId,
                _type: 1,
                _processId: orderSaleSetProcess[0]._processId,
                _createdUserId: _userId_,
                _createdAt: dateTime,
                _description: '',
                _status: 1,
              });

            await orderSaleSetProcessHistoryAutomation.save({
              session: transactionSession,
            });
            console.log('___d13');

            userIdAfterFinishSetProcessNewAssignForNotification =
              resultEmployees[0]._userId;
          }
        }
      }

      if (dto.isLastSetProcess == 1 && dto.orderStatus == 3) {
        console.log('___dd1');
        //finish process data
        await this.orderSaleMainModel.findOneAndUpdate(
          {
            _id: result._orderSaleId,
          },
          {
            $set: {
              _workStatus: 4,
            },
          },
          { new: true, session: transactionSession },
        );
        console.log('___d14');
        const orderSaleHistory = new this.orderSaleHistoriesModel({
          _orderSaleId: result._orderSaleId,
          _userId: null,
          _shopId: null,
          _deliveryCounterId: null,
          _type: 4,
          _deliveryProviderId: null,
          _description: '',
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
        await orderSaleHistory.save({
          session: transactionSession,
        });
        console.log('___d15');
      }

      if (dto.orderStatus == 6) {
        console.log('___dd2');
        //doing notification
        var resultUserRejectDone = await this.userModel.find(
          { _id: _userId_ },
          { _name: 1 },
        );
        if (resultUserRejectDone.length == 0) {
          throw new HttpException(
            'User not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        var resultOrderSaleSetProcessNotification =
          await this.orderSaleSetProcessModel.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(dto.orderSaleSetProcessId),
              },
            },

            {
              $lookup: {
                from: ModelNames.ORDER_SALES_MAIN,
                let: { osId: '$_orderSaleId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$osId'],
                      },
                    },
                  },

                  {
                    $project: {
                      _orderHeadId: 1,
                      _uid: 1,
                    },
                  },
                  {
                    $lookup: {
                      from: ModelNames.USER,
                      let: { ohId: '$_orderHeadId' },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$_id', '$$ohId'],
                            },
                          },
                        },

                        {
                          $project: {
                            _isNotificationEnable: 1,
                            _fcmId: 1,
                          },
                        },
                      ],
                      as: 'ohDetails',
                    },
                  },
                  {
                    $unwind: {
                      path: '$ohDetails',
                    },
                  },
                ],
                as: 'orderSaleDetails',
              },
            },
            {
              $unwind: {
                path: '$orderSaleDetails',
              },
            },
          ]);
        if (resultOrderSaleSetProcessNotification.length == 0) {
          throw new HttpException(
            'Setprocess not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        var userFcmIds = [];
        var userNotificationTable = [];
        var notificationTitle = 'Worker rejected';
        var notificationBody = `${resultUserRejectDone[0]._name} (worker) rejected setprocess `;
        var notificationOrderSale =
          resultOrderSaleSetProcessNotification[0].orderSaleDetails._id.toString();
        resultOrderSaleSetProcessNotification.forEach(
          (elementUserNotification) => {
            if (
              elementUserNotification.orderSaleDetails.ohDetails
                ._isNotificationEnable == 1 &&
              elementUserNotification.orderSaleDetails.ohDetails._fcmId != ''
            ) {
              userFcmIds.push(
                elementUserNotification.orderSaleDetails.ohDetails._fcmId,
              );
            }
            userNotificationTable.push({
              _viewStatus: 0,
              _title: notificationTitle,
              _body: notificationBody,
              _orderSaleId:
                notificationOrderSale == '' ? null : notificationOrderSale,
              _userId: elementUserNotification.orderSaleDetails.ohDetails._id,
              _createdAt: dateTime,
              _viewAt: 0,
              _status: 1,
            });
          },
        );
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

      if (dto.orderStatus == 7) {
        console.log('___dd3');
        //doing notification
        console.log('_______ orderStatus 7   ' + JSON.stringify(result));

        var resultOrderSaleSetProcessNotification =
          await this.orderSaleSetProcessModel.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(dto.orderSaleSetProcessId),
              },
            },

            {
              $lookup: {
                from: ModelNames.ORDER_SALES_MAIN,
                let: { osId: '$_orderSaleId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$osId'],
                      },
                    },
                  },

                  {
                    $project: {
                      _orderHeadId: 1,
                      _uid: 1,
                    },
                  },
                ],
                as: 'orderSaleDetails',
              },
            },
            {
              $unwind: {
                path: '$orderSaleDetails',
              },
            },
          ]);
        if (resultOrderSaleSetProcessNotification.length == 0) {
          throw new HttpException(
            'Setprocess not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        var resultUserRejectDone = await this.userModel.find(
          { _id: resultOrderSaleSetProcessNotification[0]._userId },
          { _isNotificationEnable: 1, _fcmId: 1 },
        );
        if (resultUserRejectDone.length == 0) {
          throw new HttpException(
            'User not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        var userFcmIds = [];
        var userNotificationTable = [];
        var notificationTitle = 'Order takeback';
        var notificationBody = `Order takeback from you, ${resultOrderSaleSetProcessNotification[0].orderSaleDetails._uid}`;
        var notificationOrderSale =
          resultOrderSaleSetProcessNotification[0].orderSaleDetails._id.toString();
        resultUserRejectDone.forEach((elementUserNotification) => {
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
      if (dto.orderStatus == 1) {
        console.log('___dd4');
        //doing notification

        var resultOrderSaleSetProcessNotification =
          await this.orderSaleSetProcessModel.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(dto.orderSaleSetProcessId),
              },
            },

            {
              $lookup: {
                from: ModelNames.ORDER_SALES_MAIN,
                let: { osId: '$_orderSaleId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$osId'],
                      },
                    },
                  },

                  {
                    $project: {
                      _orderHeadId: 1,
                      _uid: 1,
                      _reWorkCount: 1,
                      _internalReWorkCount: 1,
                    },
                  },
                ],
                as: 'orderSaleDetails',
              },
            },
            {
              $unwind: {
                path: '$orderSaleDetails',
              },
            },
          ]);
        if (resultOrderSaleSetProcessNotification.length == 0) {
          throw new HttpException(
            'Setprocess not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        if (
          resultOrderSaleSetProcessNotification[0].orderSaleDetails
            ._reWorkCount > 0 ||
          resultOrderSaleSetProcessNotification[0].orderSaleDetails
            ._internalReWorkCount > 0
        ) {
          var userFcmCheck = await this.userModel.find(
            { _id: dto.userId },
            { _isNotificationEnable: 1, _fcmId: 1 },
          );
          var userFcmIds = [];
          var userNotificationTable = [];
          var notificationTitle = 'Set process assigned';
          var notificationBody =
            'New set process assigned for you (Re work),UID: ' +
            resultOrderSaleSetProcessNotification[0].orderSaleDetails._uid;
          var notificationOrderSale =
            resultOrderSaleSetProcessNotification[0].orderSaleDetails._id.toString();
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
      }

      if (dto.isLastSetProcess == 0 && dto.orderStatus == 3 && userIdAfterFinishSetProcessNewAssignForNotification!="") {
        console.log('___dd5');
        // userIdAfterFinishSetProcessNewAssignForNotification=resultEmployees[0]._userId;

        //doing notification

        var resultOrderSaleSetProcessNotification =
          await this.orderSaleSetProcessModel.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(dto.orderSaleSetProcessId),
              },
            },

            {
              $lookup: {
                from: ModelNames.ORDER_SALES_MAIN,
                let: { osId: '$_orderSaleId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$osId'],
                      },
                    },
                  },

                  {
                    $project: {
                      _orderHeadId: 1,
                      _uid: 1,
                      _reWorkCount: 1,
                      _internalReWorkCount: 1,
                    },
                  },
                ],
                as: 'orderSaleDetails',
              },
            },
            {
              $unwind: {
                path: '$orderSaleDetails',
              },
            },
          ]);
          console.log("____dd2   "+JSON.stringify(resultOrderSaleSetProcessNotification));
        if (resultOrderSaleSetProcessNotification.length == 0) {
          throw new HttpException(
            'Setprocess not found',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        console.log("____dd3   ");
        if (
          resultOrderSaleSetProcessNotification[0].orderSaleDetails
            ._reWorkCount > 0 ||
          resultOrderSaleSetProcessNotification[0].orderSaleDetails
            ._internalReWorkCount > 0
        ) {
          
        console.log("____dd4   ");
          var userFcmCheck = await this.userModel.find(
            { _id: userIdAfterFinishSetProcessNewAssignForNotification },
            { _isNotificationEnable: 1, _fcmId: 1 },
          );
          
        console.log("____dd6   ");
          var userFcmIds = [];
          var userNotificationTable = [];
          var notificationTitle = 'Set process assigned';
          var notificationBody =
            'New set process assigned for you (Re work),UID: ' +
            resultOrderSaleSetProcessNotification[0].orderSaleDetails._uid;
          var notificationOrderSale =
            resultOrderSaleSetProcessNotification[0].orderSaleDetails._id.toString();
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

  async changeProcessDescriptionOrderStatus(
    dto: ChangeProcessDescriptionOrderStatusDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.orderSaleSetProcessModel.findOneAndUpdate(
        {
          _id: dto.orderSaleSetProcessId,
        },
        {
          $set: {
            _description: dto.description,
          },
        },
        { new: true, session: transactionSession },
      );

      const orderSaleSetProcessHistory =
        new this.orderSaleSetProcessHistoriesModel({
          _orderSaleId: result._orderSaleId,
          _userId: null,
          _type: 6,
          _processId: result._processId,
          _description: dto.description,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        });
      await orderSaleSetProcessHistory.save({
        session: transactionSession,
      });

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

  async changeSubProcessOrderStatus(
    dto: ChangeSubProcessOrderStatusDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.orderSaleSetSubProcessModel.findOneAndUpdate(
        {
          _id: dto.orderSaleSetSubProcessId,
        },
        {
          $set: {
            _userId: _userId_,
            _orderStatus: dto.orderStatus,
            _description: dto.description,
          },
        },
        { new: true, session: transactionSession },
      );

      const orderSaleHistory = new this.orderSaleSetSubProcessHistoriesModel({
        _orderSaleSetProcessId: result._orderSaleSetProcessId,
        _userId: _userId_,
        _type: 2, //this api only calling for sub task completed time, no more operation now
        _subProcessId: result._subProcessId,
        _description: '',
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _status: 1,
      });
      await orderSaleHistory.save({
        session: transactionSession,
      });

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

  async setProcessHistories(dto: SetProcessHistoryListDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.orderSaleIds.length > 0) {
        var newSettingsId = [];
        dto.orderSaleIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _orderSaleId: { $in: newSettingsId } },
        });
      }

      if (dto.userIds.length > 0) {
        var newSettingsId = [];
        dto.userIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _userId: { $in: newSettingsId } } });
      }
      if (dto.processIds.length > 0) {
        var newSettingsId = [];
        dto.processIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _processId: { $in: newSettingsId } },
        });
      }
      if (dto.createdUserIds.length > 0) {
        var newSettingsId = [];
        dto.createdUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _createdUserId: { $in: newSettingsId } },
        });
      }
      if (dto.types.length > 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.types } },
        });
      }
      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      arrayAggregation.push(
        {
          $lookup: {
            from: ModelNames.PROCESS_MASTER,
            let: { processId: '$_processId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$processId'] } } }],
            as: 'processDetails',
          },
        },
        {
          $unwind: {
            path: '$processDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
      );
      arrayAggregation.push(
        {
          $lookup: {
            from: ModelNames.USER,
            let: { userId: '$_userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              {
                $project: new ModelWeight().userTableLight(),
              },
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } },
                    },
                    {
                      $project: new ModelWeight().globalGalleryTableLight(),
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
            as: 'userDetails',
          },
        },
        {
          $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: ModelNames.USER,
            let: { userId: '$_createdUserId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              {
                $project: new ModelWeight().userTableLight(),
              },
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } },
                    },
                    {
                      $project: new ModelWeight().globalGalleryTableLight(),
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
      var result = await this.orderSaleSetProcessHistoriesModel
        .aggregate(arrayAggregation)
        .session(transactionSession);

      const responseJSON = {
        message: 'success',
        data: { list: result },
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

  async setSubProcessHistories(
    dto: SetSubProcessHistoryListDto,
    _userId_: string,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayAggregation = [];

      if (dto.orderSaleSetProcessIds.length > 0) {
        var newSettingsId = [];
        dto.orderSaleSetProcessIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _orderSaleSetProcessId: { $in: newSettingsId } },
        });
      }

      if (dto.userIds.length > 0) {
        var newSettingsId = [];
        dto.userIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({ $match: { _userId: { $in: newSettingsId } } });
      }
      if (dto.subProcessIds.length > 0) {
        var newSettingsId = [];
        dto.subProcessIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _subProcessId: { $in: newSettingsId } },
        });
      }
      if (dto.createdUserIds.length > 0) {
        var newSettingsId = [];
        dto.createdUserIds.map((mapItem) => {
          newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
        });
        arrayAggregation.push({
          $match: { _createdUserId: { $in: newSettingsId } },
        });
      }
      if (dto.types.length > 0) {
        arrayAggregation.push({
          $match: { _type: { $in: dto.types } },
        });
      }
      arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });

      arrayAggregation.push(
        {
          $lookup: {
            from: ModelNames.SUB_PROCESS_MASTER,
            let: { subProcessId: '$_subProcessId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$subProcessId'] } } },
              {
                $project: {
                  _id: 1,
                  _name: 1,
                  _code: 1,
                  _maxHours: 1,
                },
              },
            ],
            as: 'subProcessDetails',
          },
        },
        {
          $unwind: {
            path: '$subProcessDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
      );
      arrayAggregation.push(
        {
          $lookup: {
            from: ModelNames.USER,
            let: { userId: '$_userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              {
                $project: new ModelWeight().userTableLight(),
              },
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } },
                    },
                    {
                      $project: new ModelWeight().globalGalleryTableLight(),
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
            as: 'userDetails',
          },
        },
        {
          $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: ModelNames.USER,
            let: { userId: '$_createdUserId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              {
                $project: new ModelWeight().userTableLight(),
              },
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [
                    {
                      $match: { $expr: { $eq: ['$_id', '$$globalGalleryId'] } },
                    },
                    {
                      $project: new ModelWeight().globalGalleryTableLight(),
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
      var result = await this.orderSaleSetSubProcessHistoriesModel
        .aggregate(arrayAggregation)
        .session(transactionSession);

      const responseJSON = {
        message: 'success',
        data: { list: result },
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
  async takeback(dto: SetProcessTakebackDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var resultRemovedProcess =
        await this.orderSaleSetProcessModel.findOneAndUpdate(
          {
            _id: dto.orderSaleSetProcessId,
          },
          {
            $set: {
              _status: 0,
            },
          },
          { new: true, session: transactionSession },
        );

      const orderSaleSetProcessNewDataModel = new this.orderSaleSetProcessModel(
        {
          _orderSaleId: resultRemovedProcess._orderSaleId,
          _userId: null,
          _orderStatus: 0,
          _workAssignedTime: -1,
          _workStartedTime: -1,
          _workCompletedTime: -1,
          _dueDate: resultRemovedProcess._dueDate,
          _index: resultRemovedProcess._index,
          _rootCauseId: null,
          _rootCause: '',
          _description: resultRemovedProcess._description,
          _processId: resultRemovedProcess._processId,
          _isLastItem: resultRemovedProcess._isLastItem,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _status: 1,
        },
      );

      await orderSaleSetProcessNewDataModel.save({
        session: transactionSession,
      });

      var arrayToSetProcessHistories = [];

      arrayToSetProcessHistories.push({
        _orderSaleId: resultRemovedProcess._orderSaleId,
        _userId: null,
        _type: 8,
        _processId: resultRemovedProcess._processId,
        _orderSaleSetProcessId: null,
        _description: resultRemovedProcess._description,
        _createdUserId: _userId_,
        _createdAt: dateTime,
        _status: 1,
      });
      await this.orderSaleSetProcessHistoriesModel.insertMany(
        arrayToSetProcessHistories,
        {
          session: transactionSession,
        },
      );

      const responseJSON = {
        message: 'success',
        data: {},
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
