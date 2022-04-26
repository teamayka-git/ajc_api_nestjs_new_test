import { SsmTargetAccount } from 'aws-sdk/clients/ssmincidents';
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
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SHOPS,
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

export interface OrderSaleHistories {
  _id: String;
  _orderSaleId: String;
  _shopId: string;
  _userId: String;
  _type: number;
  _description: String;
  _createdUserId: string;
  _createdAt: number;
  _status: Number;
}

OrderSaleHistoriesSchema.index({ _shopId: 1 });
OrderSaleHistoriesSchema.index({ _orderSaleId: 1 });
OrderSaleHistoriesSchema.index({ _userId: 1 });
OrderSaleHistoriesSchema.index({ _description: 1 });
OrderSaleHistoriesSchema.index({ _type: 1 });
OrderSaleHistoriesSchema.index({ _createdUserId: 1 });
OrderSaleHistoriesSchema.index({ _createdAt: 1 });
OrderSaleHistoriesSchema.index({ _status: 1 });

/*
_type:{
  0 - order created for pending
  1 - order accept
  2 - order reject
  3 - set process done
  4 - finished goods
  5 - product generate request
  6 - product generated 
  7 - deliverychalan generated
  8 - halmark issuence requested
  9 - halmark issuence bypassed
  10 - send to halmark issuence
  11 - halmarking issued
  12 - halmark request cancelled
  13 - halmark request rejected
  14 - halmark error occured
  15 - send to reissuence 
  16 - invoice generated
  17 - delivery invoice generated
  18 - delivery boy otp verification requested
  19 - delivery boy otp verification accepted
  20 - hub tranfer
  21 - delivery otp to Shop requested
  22 - delivery otp to Shop verified
  23 - delivery rejected by Shop
  24 - delivery reshedule requested
  25 - delivery reshedule rejected
  26 - delivery reshedule accepted
  27 - delivery return to hub
  28 - sale return collected otp requested
  29 - sale return collected otp accepted
  30 - sale return collected otp rejected
  31 - order completed
  32 - order cancelled,
  100 - order editted
  101- sales order actived
  102- sales order disabled
  103- sales order deleted
  104- sales order general remark editted
}
*/
