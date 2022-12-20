import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const PurchaseOrderSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUPPLIERS,
    default: null,
  },
  _expectedDeliveryDate: { type: Number, required: true, default: -1 },
  _totalMetalWeight: { type: Number, required: true, default: -1 },
  _deliveryStatus: { type: Number, required: true, default: -1 },
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

export interface PurchaseOrder {
  _id: String;
  _supplierId: String;
  _expectedDeliveryDate: Number;
  _totalMetalWeight: Number;
  _deliveryStatus: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

PurchaseOrderSchema.index({ _expectedDeliveryDate: 1 });
PurchaseOrderSchema.index({ _supplierId: 1 });
PurchaseOrderSchema.index({ _deliveryStatus: 1 });
PurchaseOrderSchema.index({ _createdUserId: 1 });
PurchaseOrderSchema.index({ _status: 1 });

/*
_deliveryStatus:{
  0 - pending
  1 - accepted
  2 - rejected
}
 */ 
