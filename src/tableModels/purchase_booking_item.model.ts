import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const PurchaseBookingItemSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _purchaseBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PURCHASE_BOOKINGS,
    default: null,
  },
  _metalWeight: { type: Number, required: true, default: -1 },
  _groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GROUP_MASTERS,
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

export interface PurchaseBookingItem {
  _id: String;
  _purchaseBookingId: String;
  _metalWeight: Number;
  _groupId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

PurchaseBookingItemSchema.index({ _purchaseBookingId: 1 });
PurchaseBookingItemSchema.index({ _groupId: 1 });
PurchaseBookingItemSchema.index({ _createdUserId: 1 });
PurchaseBookingItemSchema.index({ _status: 1 });

/*
 */
 