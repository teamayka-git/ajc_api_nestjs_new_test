import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderSaleSetProcessesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,

  _orderSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_MAIN,
    default: null,
  },
  _userId: {   
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _index: { type: Number, required: true, default: -1 },
  _dueDate: { type: Number, required: true, default: -1 },
  _workAssignedTime: { type: Number, required: true, default: -1 },
  _workCompletedTime: { type: Number, required: true, default: -1 },
  _workStartedTime: { type: Number, required: true, default: -1 },
  _isLastItem: { type: Number, required: true, default: -1 },
  _orderStatus: { type: Number, required: true, default: -1 },
  _processId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: ModelNames.PROCESS_MASTER,
    default: null,
  },
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },

  _processNote: { type: String, default: '' },
  _rootCause: { type: String, default: '' },
  _description: { type: String, default: '' },

  _createdUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _createdAt: { type: Number, required: true, default: -1 },
  _status: { type: Number, required: true, default: -1 },
});

export interface OrderSaleSetProcesses {
  _id: String; 
  _orderSaleId: String;
  _userId: String;
  _orderStatus: number; 
  _workAssignedTime: number; 
  _workStartedTime: number; 
  _workCompletedTime: number; 
  _dueDate: number;//
  _index:number;
  _processNote: String;
  _rootCauseId: String;
  _rootCause: String;
  _description: string;
  _processId: String;
  _isLastItem: number;
  _createdUserId: String;
  _createdAt: Number;
  _status: Number;
}

OrderSaleSetProcessesSchema.index({ _processNote: 1 });
OrderSaleSetProcessesSchema.index({ _dueDate: 1 });
OrderSaleSetProcessesSchema.index({ _rootCauseId: 1 });
OrderSaleSetProcessesSchema.index({ _rootCause: 1 });
OrderSaleSetProcessesSchema.index({ _index: 1 });
OrderSaleSetProcessesSchema.index({ _isLastItem: 1 });
OrderSaleSetProcessesSchema.index({ _description: 1 });
OrderSaleSetProcessesSchema.index({ _processId: 1 });
OrderSaleSetProcessesSchema.index({ _orderSaleId: 1 });
OrderSaleSetProcessesSchema.index({ _userId: 1 });
OrderSaleSetProcessesSchema.index({ _orderStatus: 1 });
OrderSaleSetProcessesSchema.index({ _createdUserId: 1 });
OrderSaleSetProcessesSchema.index({ _status: 1 });

/*
_orderStatus:{
  0 - pending
  1 - assigned 
  2 - onworking
  3 - completed
  4 - on holding
  5 - request to reassign
  6 - reject
  7 - takeback
}
*/
