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
  _bookingWeight: { type: Number, required: true, default: -1 },
  _bookingRate: { type: Number, required: true, default: -1 },
  _bookingAmount: { type: Number, required: true, default: -1 },
  _groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GROUP_MASTERS,
    default: null,
  },
  _uid: { type: String, required: true, default: 'nil' },
  _ref: { type: String, required: false, default: '' },
  _supplierUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SHOPS,
    default: null,
  },
  _bookingThrough: { type: Number, required: true, default: -1 },
  _isPurchaseOrderGenerated: { type: Number, required: true, default: -1 },

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
  _bookingWeight: Number;
  _bookingRate: Number;
  _bookingAmount: Number;
  _groupId: String;
  _uid: String;
  _supplierUserId: String;
  _shopId: String;
  _bookingThrough: Number;
  _isPurchaseOrderGenerated: Number;
  _ref:String;

  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

PurchaseBookingSchema.index({ _ref: 1 });
PurchaseBookingSchema.index({ _invoiceId: 1 });
PurchaseBookingSchema.index({ _bookingWeight: 1 });
PurchaseBookingSchema.index({ _bookingRate: 1 });
PurchaseBookingSchema.index({ _bookingAmount: 1 });
PurchaseBookingSchema.index({ _groupId: 1 });
PurchaseBookingSchema.index({ _uid: 1 , _id: 1});
PurchaseBookingSchema.index({ _supplierUserId: 1 });
PurchaseBookingSchema.index({ _shopId: 1 });
PurchaseBookingSchema.index({ _bookingThrough: 1 });
PurchaseBookingSchema.index({ _isPurchaseOrderGenerated: 1 });
PurchaseBookingSchema.index({ _createdUserId: 1 });
PurchaseBookingSchema.index({ _status: 1 });
PurchaseBookingSchema.index(
  { _uid: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
PurchaseBookingSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchaseBookingSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchaseBookingSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchaseBookingSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchaseBookingSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('UID already existing'));
  } else {
    next();
  }
}
/*
_bookingThrough:{
  0 - automatimatic booking through inv generated
  1 - manual booking
}
 */
