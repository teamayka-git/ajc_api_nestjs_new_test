import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderCancelRejectReportsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_MAIN,
    default: null,
  },
  _shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SHOPS,
    default: null,
  },
  _oh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _type: { type: Number, required: true, default: -1 },
  _orderCreatedDate: { type: Number, required: true, default: -1 },
  _orderDueDate: { type: Number, required: true, default: -1 },
  _orderUid: { type: String, required: true, default: 'nil' },
  _rootcause: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },
  _description: { type: String, required: false, default: '' },

  _createdUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _createdAt: { type: Number, required: true, default: -1 },
  _updatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _updatedAt: { type: Number, required: true, default: -1 },
  _status: { type: Number, required: true, default: -1 },
});

export interface OrderCancelRejectReports {
  _id: String;
  _orderId: String;
  _shop: String;
  _oh: String;
  _rootcause: String;
  _type: Number;
  _description: String;
  _orderCreatedDate: Number;
  _orderDueDate: Number;
  _orderUid: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

OrderCancelRejectReportsSchema.index({ _orderUid: 1 });
OrderCancelRejectReportsSchema.index({ _orderDueDate: 1 });
OrderCancelRejectReportsSchema.index({ _orderCreatedDate: 1 });
OrderCancelRejectReportsSchema.index({ _orderId: 1 });
OrderCancelRejectReportsSchema.index({ _shop: 1 });
OrderCancelRejectReportsSchema.index({ _oh: 1 });
OrderCancelRejectReportsSchema.index({ _rootcause: 1 });
OrderCancelRejectReportsSchema.index({ _type: 1 });
OrderCancelRejectReportsSchema.index({ _description: 1 });
OrderCancelRejectReportsSchema.index({ _createdUserId: 1 });
OrderCancelRejectReportsSchema.index({ _createdAt: 1 });
OrderCancelRejectReportsSchema.index({ _status: 1 });

/*
_type:{
  0 - customer rejected
  1 - customer cancel
  2 - admin rejected
}
*/
