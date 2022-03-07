import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { SetProcessCreateDto } from './order_sale_set_process.dto';
import * as mongoose from 'mongoose';
import { OrderSaleSetProcesses } from 'src/tableModels/order_sale_set_processes.model';
import { OrderSaleSetProcessHistories } from 'src/tableModels/order_sale_set_process_histories.model';
import { OrderSaleSetSubProcesses } from 'src/tableModels/order_sale_set_sub_processes.model';
import { OrderSaleSetSubProcessHistories } from 'src/tableModels/order_sale_set_sub_process_histories.model';
import { SubProcessMaster } from 'src/tableModels/subProcessMaster.model';
import { IndexUtils } from 'src/utils/IndexUtils';

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
      var arrayToSetSubProcess = [];

      var arrayProcessIds = [];
      dto.array.map((mapItem) => {
        arrayProcessIds.push(mapItem.initialProcessId);

        arrayProcessIds.push(...mapItem.processIds);
      });

      var resultSubProcess = await this.subProcessModel.find(
        { _processMasterId: { $in: arrayProcessIds }, _status: 1 },
        { _processMasterId: 1, _id: 1 },
      );

      dto.array.map((mapItem) => {
        var initialDataProcessId = new mongoose.Types.ObjectId();
        arrayToSetProcess.push({
          _id: initialDataProcessId,
          _orderSaleId: mapItem.orderSaleId,
          _userId: mapItem.initialUserId,
          _orderStatus: 0,
          _processId: mapItem.initialProcessId,
          _status: 1,
        });

        var arrayInitialData = new IndexUtils().multipleIndexSetSubProcess(
          resultSubProcess,
          mapItem.initialProcessId,
        );
        arrayInitialData.map((mapItem2) => {
          arrayToSetSubProcess.push({
            _orderSaleSetProcessId: initialDataProcessId,
            _userId: null,
            _orderStatus: 0,
            _subProcessId: resultSubProcess[mapItem2]._id,
            _status: 1,
          });
        });

        mapItem.processIds.map((mapItem1) => {
          var processId = new mongoose.Types.ObjectId();
          arrayToSetProcess.push({
            _id: processId,
            _orderSaleId: mapItem.orderSaleId,
            _userId: null,
            _orderStatus: 0,
            _processId: mapItem1,
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
      await this.orderSaleSetSubProcessModel.insertMany(
        arrayToSetSubProcess,
        {
          session: transactionSession,
        },
      );


      await this.orderSaleSetProcessHistoriesModel.insertMany(
        arrayToSetProcess,
        {
          session: transactionSession,
        },
      );
      await this.orderSaleSetSubProcessHistoriesModel.insertMany(
        arrayToSetSubProcess,
        {
          session: transactionSession,
        },
      );


      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: 'success', data: { list: result1 } };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }
}
