import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const InvoicesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _uid: { type: String, required: true, default: 'nil' },
  _saleType: { type: Number, required: true, default: -1 },

  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _description: { type: String, default: 'nil' },
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

export interface Invoices {
  _id: String;
  _userId: String;
  _uid: String;
  _saleType: number;
  _rootCauseId: string;
  _description: string;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

InvoicesSchema.index({ _rootCauseId: 1 });
InvoicesSchema.index({ _description: 1 });
InvoicesSchema.index({ _userId: 1 });
InvoicesSchema.index({ _uid: 1, _id: 1 });
InvoicesSchema.index({ _saleType: 1 });
InvoicesSchema.index({ _createdUserId: 1 });
InvoicesSchema.index({ _status: 1 });
InvoicesSchema.index(
  { _uid: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
InvoicesSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
InvoicesSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
InvoicesSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
InvoicesSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
InvoicesSchema.post('updateMany', async function (error, doc, next) {
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
_deliveryMode:{
    0 - executive
    1 - courier
    2 - third party
}
_type:{
    0 - halmark
    1 - hub transfer
}
_saleType:{
    0 - order sale
    1 - stock sale
    2 - job work
}

 */
