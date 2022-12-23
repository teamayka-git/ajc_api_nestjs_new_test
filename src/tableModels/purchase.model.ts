import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const PurchasesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _uid: { type: String, required: true, default: 'nil' },
  _supplierUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUPPLIERS, 
    default: null,
  },
  _purchaseOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PURCHASE_ORDERS,
    default: null,
  },
  _supplierPurchaseDate: { type: Number, required: true, default: -1 },
  _manufacturePurchaseDate: { type: Number, required: true, default: -1 },
  _supplierRef: { type: String, required: false, default: '' },
  _otherRemark: { type: String, required: false, default: '' },
  _groupName: { type: String, required: true, default: 'nil' },
  _estimatedQty: { type: Number, required: true, default: -1 },
  _allowedLimitPurchaseAdjustment: { type: Number, required: true, default: -1 },
  _actualQty: { type: Number, required: true, default: -1 },
  _unitPrice: { type: Number, required: true, default: -1 },
  _amount: { type: Number, required: true, default: -1 },
  _sgst: { type: Number, required: true, default: -1 },
  _igst: { type: Number, required: true, default: -1 },
  _cgst: { type: Number, required: true, default: -1 },
  _grossAmount: { type: Number, required: true, default: -1 },
  _actualAmount: { type: Number, required: true, default: -1 },
  _bookingAmount: { type: Number, required: true, default: -1 },
  _difference: { type: Number, required: true, default: -1 },
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

export interface Purchases {
  _id: String;
  _uid:String,
  _supplierUserId:String,
  _purchaseOrderId:String,
  _supplierPurchaseDate:Number,
  _manufacturePurchaseDate:Number,
  _supplierRef:String,
  _otherRemark:String,
  _groupName:String,
  _estimatedQty:Number,
  _allowedLimitPurchaseAdjustment:Number,
  _actualQty:Number,
  _unitPrice:Number,
  _amount:Number,
  _sgst:Number,
  _igst:Number,
  _cgst:Number,
  _grossAmount:Number,
  _actualAmount:Number,
  _bookingAmount:Number,
  _difference:Number,
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

PurchasesSchema.index({ _supplierUserId: 1 });
PurchasesSchema.index({ _purchaseOrderId: 1 });
PurchasesSchema.index({ _supplierPurchaseDate: 1 });
PurchasesSchema.index({ _manufacturePurchaseDate: 1 });
PurchasesSchema.index({ _supplierRef: 1 });
PurchasesSchema.index({ _otherRemark: 1 });
PurchasesSchema.index({ _groupName: 1 });
PurchasesSchema.index({ _estimatedQty: 1 });
PurchasesSchema.index({ _allowedLimitPurchaseAdjustment: 1 });
PurchasesSchema.index({ _actualQty: 1 });
PurchasesSchema.index({ _unitPrice: 1 });
PurchasesSchema.index({ _amount: 1 });
PurchasesSchema.index({ _sgst: 1 });
PurchasesSchema.index({ _igst: 1 });
PurchasesSchema.index({ _cgst: 1 });
PurchasesSchema.index({ _grossAmount: 1 });
PurchasesSchema.index({ _actualAmount: 1 });
PurchasesSchema.index({ _bookingAmount: 1 });
PurchasesSchema.index({ _difference: 1 });
PurchasesSchema.index({ _createdUserId: 1 });
PurchasesSchema.index({ _createdAt: 1 });
PurchasesSchema.index({ _status: 1 });
PurchasesSchema.index(
  { _uid: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
PurchasesSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchasesSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchasesSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchasesSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchasesSchema.post('updateMany', async function (error, doc, next) {
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
 */
