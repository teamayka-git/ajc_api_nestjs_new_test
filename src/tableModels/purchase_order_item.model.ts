import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const PurchaseOrderItemSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _purchaseOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PURCHASE_ORDERS,
    default: null,
  },
  _purchaseBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PURCHASE_BOOKINGS,
    default: null,
  },
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

export interface PurchaseOrderItem {
  _id: String;
  _purchaseOrderId: String;
  _purchaseBookingId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

PurchaseOrderItemSchema.index({ _purchaseOrderId: 1 });
PurchaseOrderItemSchema.index({ _purchaseBookingId: 1 });
PurchaseOrderItemSchema.index({ _createdUserId: 1 });
PurchaseOrderItemSchema.index({ _status: 1 });

/*
 */ 
 