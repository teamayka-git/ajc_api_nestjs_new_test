import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import {
  ChangeProcessDescriptionOrderStatusDto,
  ChangeProcessOrderStatusDto,
  ChangeSubProcessOrderStatusDto,
  SetProcessCreateDto,
} from './order_sale_set_process.dto';
import * as mongoose from 'mongoose';
import { OrderSaleSetProcesses } from 'src/tableModels/order_sale_set_processes.model';
import { OrderSaleSetProcessHistories } from 'src/tableModels/order_sale_set_process_histories.model';
import { OrderSaleSetSubProcesses } from 'src/tableModels/order_sale_set_sub_processes.model';
import { OrderSaleSetSubProcessHistories } from 'src/tableModels/order_sale_set_sub_process_histories.model';
import { SubProcessMaster } from 'src/tableModels/subProcessMaster.model';
import { IndexUtils } from 'src/utils/IndexUtils';
import { OrderSales } from 'src/tableModels/order_sales.model';
import { OrderSaleHistories } from 'src/tableModels/order_sale_histories.model';
import { GlobalConfig } from 'src/config/global_config';

@Injectable()
export class OrderSaleSetProcessService {
  constructor(
    @InjectModel(ModelNames.ORDER_SALE_SET_PROCESSES)
    private readonly orderSaleSetProcessModel: mongoose.Model<OrderSaleSetProcesses>,
    @InjectModel(ModelNames.ORDER_SALE_SET_PROCESS_HISTORIES)
    private readonly orderSaleSetProcessHistoriesModel: mongoose.Model<OrderSaleSetProcessHistories>,
    @InjectModel(ModelNames.ORDER_SALE_SET_SUB_PROCESSES)
    private readonly orderSaleSetSubProcessModel: mongoose.Model<OrderSaleSetSubProcesses>,
    @InjectModel(ModelNames.ORDER_SALE_SET_SUB_PROCESS_HISTORIES)
    private readonly orderSaleSetSubProcessHistoriesModel: mongoose.Model<OrderSaleSetSubProcessHistories>,
    @InjectModel(ModelNames.ORDER_SALE_HISTORIES)
    private readonly orderSaleHistoriesModel: mongoose.Model<OrderSaleHistories>,

    @InjectModel(ModelNames.ORDER_SALES)
    private readonly orderSaleModel: mongoose.Model<OrderSales>,
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

      var arrayProcessIds = [];
      var arrayOrdersaleIds = [];
      dto.array.map((mapItem) => {
        arrayOrdersaleIds.push(mapItem.orderSaleId);

        mapItem.arrayProcess.map((mapItem1) => {
          arrayProcessIds.push(mapItem1.processId);
        });
      });

      var resultSubProcess = await this.subProcessModel.find(
        { _processMasterId: { $in: arrayProcessIds }, _status: 1 },
        { _processMasterId: 1, _id: 1 },
      );

      dto.array.map((mapItem) => {
        mapItem.arrayProcess.map((mapItem1, index) => {
          var processId = new mongoose.Types.ObjectId();
          var isLastItem = 0;

          if (dto.array.length - 1 == index) {
            isLastItem = 1;
          }

          arrayToSetProcess.push({
            _id: processId,
            _orderSaleId: mapItem.orderSaleId,
            _isLastItem: isLastItem,
            _userId: null,
            _description: mapItem1.description,
            _orderStatus: 0,
            _processId: mapItem1.processId,
            _status: 1,
          });
          arrayToSetProcessHistories.push({
            _orderSaleId: mapItem.orderSaleId,
            _userId: _userId_,
            _orderStatus: -1,
            _type: 0,
            _processId: null,
            _workingUserId: null,
            _status: 1,
          });
          arrayToSetSubProcessHistories.push({
            _orderSaleSetProcessId: processId,
            _userId: _userId_,
            _orderStatus: -1,
            _subProcessId: null,
            _type: 0,
            _status: 1,
          });

          var arraySubProcessIndexes =
            new IndexUtils().multipleIndexSetSubProcess(
              resultSubProcess,
              mapItem1,
            );
          arraySubProcessIndexes.map((mapItem2) => {
            arrayToSetSubProcess.push({
              _orderSaleSetProcessId: processId,
              _userId: null,
              _description: '',
              _orderStatus: 0,
              _subProcessId: resultSubProcess[mapItem2]._id,
              _status: 1,
            });
          });
        });
      });

      var result1 = await this.orderSaleSetProcessModel.insertMany(
        arrayToSetProcess,
        {
          session: transactionSession,
        },
      );
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

      await this.orderSaleModel.updateMany(
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

      var arrayToOrderSaleHistory = [];

      dto.array.map((mapItem) => {
        arrayToOrderSaleHistory.push({
          _orderSaleId: mapItem.orderSaleId,
          _workStatus: 3,
          _rootCauseId: null,
          _rootCause: '',
          _status: 1,
        });
      });

      await this.orderSaleHistoriesModel.insertMany(arrayToOrderSaleHistory, {
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
            _userId: dto.userId,
            _orderStatus: dto.orderStatus,
            _description: dto.descriptionId,
          },
        },
        { new: true, session: transactionSession },
      );

      var objDefaultProcessHistory = {
        _orderSaleId: result._orderSaleId,
        _userId: _userId_,
        _orderStatus: -1,
        _type: dto.setProcessHistoryType,
        _workingUserId: null,
        _processId: null,
        _status: 1,
      };
      switch (dto.setProcessHistoryType) {
        /*
          0 - created  process
          1 - process work assigned
          2 - process work started
          3 - finished process work
          4 - process work on holding
          5 - process work on reassign request
          6 - process description editted
        */
        case 1:
          objDefaultProcessHistory._workingUserId = dto.userId;
          break;
        case 2:
          objDefaultProcessHistory._workingUserId = dto.userId;
          objDefaultProcessHistory._processId = result._processId;
          break;
        case 3:
          objDefaultProcessHistory._workingUserId = dto.userId;
          objDefaultProcessHistory._processId = result._processId;
          break;
        case 4:
          objDefaultProcessHistory._workingUserId = dto.userId;
          objDefaultProcessHistory._processId = result._processId;
          break;
        case 5:
          objDefaultProcessHistory._workingUserId = dto.userId;
          objDefaultProcessHistory._processId = result._processId;
          break;
        case 6:
          objDefaultProcessHistory._workingUserId = dto.userId;
          objDefaultProcessHistory._processId = result._processId;
          break;
      }

      const orderSaleSetProcessHistory =
        new this.orderSaleSetProcessHistoriesModel(objDefaultProcessHistory);
      await orderSaleSetProcessHistory.save({
        session: transactionSession,
      });

      if (dto.addSubProcessHistory == 1) {
        var objSubProcessHistory = {
          _orderSaleSetProcessId: dto.orderSaleSetProcessId,
          _userId: _userId_,
          _orderStatus: -1,
          _subProcessId: null,
          _type: -1,
          _status: 1,
        };
        if (dto.orderStatus == 2) {
          //started work
          objSubProcessHistory._type = 1;
        } else if (dto.orderStatus == 3) {
          //finished work
          objSubProcessHistory._type = 3;
        }

        const orderSaleSubProcessHistory =
          new this.orderSaleSetSubProcessHistoriesModel(objSubProcessHistory);
        await orderSaleSubProcessHistory.save({
          session: transactionSession,
        });
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
            _description: dto.descriptionId,
          },
        },
        { new: true, session: transactionSession },
      );

      const orderSaleSetProcessHistory =
        new this.orderSaleSetProcessHistoriesModel({
          _orderSaleId: result._orderSaleId,
          _userId: _userId_,
          _orderStatus: -1,
          _type: 6,
          _workingUserId: _userId_,
          _processId: result._processId,
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
            _description: dto.descriptionId,
          },
        },
        { new: true, session: transactionSession },
      );

      const orderSaleHistory = new this.orderSaleSetSubProcessHistoriesModel({
        _orderSaleSetProcessId: result._orderSaleSetProcessId,
        _userId: result._userId,
        _orderStatus: -1,
        _type: 2, //this api only calling for sub task completed time, no more operation now
        _subProcessId: result._subProcessId,
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
}
