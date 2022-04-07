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
  _customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES,
    default: null,
  },
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES,
    default: null,
  },
  _actionUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES,
    default: null,
  },
  _type: { type: Number, required: true, default: -1 },
  _description: { type: String, default: 'nil' },
  _status: { type: Number, required: true, default: -1 },
});

export interface OrderSaleHistories {
  _id: String;
  _orderSaleId: String;
  _customerId: String;
  _userId: String;
  _actionUserId: String;
  _type: number;
  _description: String;
  _status: Number;
}

OrderSaleHistoriesSchema.index({ _orderSaleId: 1 });
OrderSaleHistoriesSchema.index({ _customerId: 1 });
OrderSaleHistoriesSchema.index({ _userId: 1 });
OrderSaleHistoriesSchema.index({ _actionUserId: 1 });
OrderSaleHistoriesSchema.index({ _type: 1 });
OrderSaleHistoriesSchema.index({ _status: 1 });

/*
_type:{
  0 - order pending
  1 - order accept
  2 - order reject
  3 - set process done
  4 - finished goods
  4 - product generate request
  4 - product generated 
  5 - deliverychalan generated
  6 - halmark issuence requested
  7 - halmark issuence bypassed
  8 - send to halmark issuence
  9 - halmarking issued
  10 - halmark request cancelled
  11 - halmark request rejected
  12 - halmark error occured
  13 - send to reissuence 
  14 - invoice generated
  15 - delivery invoice generated
  16 - delivery boy otp verification requested
  17 - delivery boy otp verification accepted
  18 - hub tranfer
  19 - delivery otp to customer requested
  20 - delivery otp to customer verified
  21 - delivery rejected by customer
  22 - delivery reshedule requested
  23 - delivery reshedule rejected
  24 - delivery reshedule accepted
  25 - delivery return to hub
  26 - sale return collected otp requested
  27 - sale return collected otp accepted
  28 - sale return collected otp rejected
  29 - order completed
  30 - order cancelled
}
*/
