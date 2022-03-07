import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderSaleHistoriesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
 
  _orderSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES,
    default: null,
  },
  _workStatus: { type: Number, required: true, default: -1 },
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_ROOT_CAUSES,
    default: null,
  },
  _rootCause: { type: String, required: true, default: 'nil' },
  _status: { type: Number, required: true, default: -1 },
});

export interface OrderSaleHistories {
  _id: String;
  _orderSaleId:String;
  _workStatus: number;
  _rootCauseId:String;
  _rootCause:String;
  _status: Number;
}

OrderSaleHistoriesSchema.index({ _workStatus: 1 });
OrderSaleHistoriesSchema.index({ _rootCauseId: 1 });
OrderSaleHistoriesSchema.index({ _rootCause: 1 });
OrderSaleHistoriesSchema.index({ _status: 1 });

/*

*/