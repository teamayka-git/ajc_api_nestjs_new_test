import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const PurchaseBookingSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.INVOICES,
    default: null,
  },
  _totalMetalWeight: { type: Number, required: true, default: -1 },
  _confirmationStatus: { type: Number, required: true, default: -1 },
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

export interface PurchaseBooking {
  _id: String;
  _invoiceId: String;
  _totalMetalWeight: Number;
  _confirmationStatus: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

PurchaseBookingSchema.index({ _invoiceId: 1 });
PurchaseBookingSchema.index({ _confirmationStatus: 1 });
PurchaseBookingSchema.index({ _createdUserId: 1 });
PurchaseBookingSchema.index({ _status: 1 });

/*
_confirmationStatus:{
  0 - not confirmed
  1 - confirmed
}
 */
