import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderSaleSetSubProcessesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
 
  _orderSaleSetProcessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALE_SET_PROCESSES,
    default: null,
  },
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _orderStatus: { type: Number, required: true, default: -1 },
  _subProcessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUB_PROCESS_MASTER,
    default: null,
  },
  
  _description: { type: String, default: "" },
  _status: { type: Number, required: true, default: -1 },
}); 

export interface OrderSaleSetSubProcesses {
  _id: String;
  _orderSaleSetProcessId:String;
  _userId: String;
  _orderStatus:number;
  _description:string;
  _subProcessId:String;
  _status: Number;
}

OrderSaleSetSubProcessesSchema.index({ _description: 1 });
OrderSaleSetSubProcessesSchema.index({ _orderSaleSetProcessId: 1 });
OrderSaleSetSubProcessesSchema.index({ _userId: 1 });
OrderSaleSetSubProcessesSchema.index({ _orderStatus: 1 });
OrderSaleSetSubProcessesSchema.index({ _subProcessId: 1 });
OrderSaleSetSubProcessesSchema.index({ _status: 1 });

/*
_orderStatus:{
  0 - pending
  1 - assigned
  2 - onworking
  3 - completed
  4 - on holding
  5 - resigned to reassign
}
*/