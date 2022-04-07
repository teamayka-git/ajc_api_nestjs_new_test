import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderSaleSetProcessHistoriesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,

  _orderSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES,
    default: null,
  },
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _processId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PROCESS_MASTER,
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

export interface OrderSaleSetProcessHistories {
  _id: String;
  _orderSaleId: String;
  _userId: String;
  _processId: String;
  _type: number;
  _description: string;
  _createdUserId: string;
  _createdAt: number;
  _status: Number;
}

OrderSaleSetProcessHistoriesSchema.index({ _type: 1 });
OrderSaleSetProcessHistoriesSchema.index({ _processId: 1 });
OrderSaleSetProcessHistoriesSchema.index({ _orderSaleId: 1 });
OrderSaleSetProcessHistoriesSchema.index({ _userId: 1 });
OrderSaleSetProcessHistoriesSchema.index({ _createdUserId: 1 });
OrderSaleSetProcessHistoriesSchema.index({ _description: 1 });
OrderSaleSetProcessHistoriesSchema.index({ _createdAt: 1 });
OrderSaleSetProcessHistoriesSchema.index({ _status: 1 });

/*
_type:{
  0 - created  process
  1 - process work assigned
  2 - process work started
  3 - finished process work
  4 - process work on holding
  5 - process work on reassign request
  6 - process description editted
}
*/
