import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const HalmarkOrderMainSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _hmBundleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.HALMARK_BUNDLES,
    default: null,
  },
  _orderUid: { type: String, required: false, default: '' },
  _orderSaleMainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_MAIN,
    default: null,
  },
  _workStatus: { type: Number, required: true, default: -1 },
  _type: { type: Number, required: true, default: -1 },
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

export interface HalmarkOrderMain {
  _id: String;
  _hmBundleId: String;
  _orderUid: String;
  _orderSaleMainId: String;
  _workStatus: Number;
  _type: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

HalmarkOrderMainSchema.index({ _hmBundleId: 1 });
HalmarkOrderMainSchema.index({ _orderUid: 1 });
HalmarkOrderMainSchema.index({ _orderSaleMainId: 1 });
HalmarkOrderMainSchema.index({ _workStatus: 1 });
HalmarkOrderMainSchema.index({ _type: 1 });
HalmarkOrderMainSchema.index({ _createdUserId: 1 });
HalmarkOrderMainSchema.index({ _status: 1 });

/*
_type:{
  0 - order
  1 - test
}
_workStatus:{
  0 - bundle not assigned
  1 - bundle assigned
  2 - bundle not created
  3 - bypassed
}
 */
 