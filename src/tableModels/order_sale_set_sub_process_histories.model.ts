import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderSaleSetSubProcessHistoriesSchema = new mongoose.Schema({
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
  _subProcessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUB_PROCESS_MASTER,
    default: null,
  },

  _type: { type: Number, required: true, default: -1 },

  _description: { type: String, default: 'nil' },
  _createdUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _createdAt: { type: Number, required: true, default: -1 },
  _status: { type: Number, required: true, default: -1 },
});

export interface OrderSaleSetSubProcessHistories {
  _id: String;
  _orderSaleSetProcessId: String;
  _userId: String;
  _subProcessId: String;
  _type: number;
  _description: string;
  _createdUserId: string;
  _createdAt: number;
  _status: Number;
}

OrderSaleSetSubProcessHistoriesSchema.index({ _type: 1 });
OrderSaleSetSubProcessHistoriesSchema.index({ _orderSaleSetProcessId: 1 });
OrderSaleSetSubProcessHistoriesSchema.index({ _userId: 1 });
OrderSaleSetSubProcessHistoriesSchema.index({ _subProcessId: 1 });
OrderSaleSetSubProcessHistoriesSchema.index({ _createdUserId: 1 });
OrderSaleSetSubProcessHistoriesSchema.index({ _description: 1 });
OrderSaleSetSubProcessHistoriesSchema.index({ _createdAt: 1 });
OrderSaleSetSubProcessHistoriesSchema.index({ _status: 1 });

/*
_type:{
  0 - created all sub processed
  1 - process work started
  2 - finished sub process
  3 - finished process work
}
*/
