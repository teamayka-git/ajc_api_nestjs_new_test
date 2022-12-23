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
  _uid: { type: String, required: true, default: 'nil' },
  _purchaseStatus: { type: Number, required: true, default: -1 },
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
  _uid: String;
  _purchaseStatus: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

PurchaseOrderSchema.index({ _uid: 1, _id: 1 });
PurchaseOrderSchema.index({ _purchaseStatus: 1 });
PurchaseOrderSchema.index({ _supplierId: 1 });
PurchaseOrderSchema.index({ _createdUserId: 1 });
PurchaseOrderSchema.index({ _status: 1 });
PurchaseOrderSchema.index(
  { _uid: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
PurchaseOrderSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchaseOrderSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchaseOrderSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchaseOrderSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
PurchaseOrderSchema.post('updateMany', async function (error, doc, next) {
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
_purchaseStatus:{
  -1-pending
  0-rejected
  1-accepted
  
}
 */
