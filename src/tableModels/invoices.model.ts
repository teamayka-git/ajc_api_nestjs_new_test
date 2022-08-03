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
  _shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SHOPS,
    default: null,
  },
  _uid: { type: String, required: true, default: 'nil' },
  _billMode: { type: Number, required: true, default: -1 },
  _halmarkingCharge: { type: Number, required: true, default: -1 },
  _otherCharge: { type: Number, required: true, default: -1 },
  _roundOff: { type: Number, required: true, default: -1 },
  _netTotal: { type: Number, required: true, default: -1 },
  _tdsReceivable: { type: Number, required: true, default: -1 },
  _tdsPayable: { type: Number, required: true, default: -1 },
  _netReceivableAmount: { type: Number, required: true, default: -1 },
  _cgstHalmarkCharge: { type: Number, required: true, default: -1 },
  _cgstOtherCharge: { type: Number, required: true, default: -1 },
  _sgstHalmarkCharge: { type: Number, required: true, default: -1 },
  _sgstOtherCharge: { type: Number, required: true, default: -1 },
  _igstHalmarkCharge: { type: Number, required: true, default: -1 },
  _igstOtherCharge: { type: Number, required: true, default: -1 },
  _isDelivered: { type: Number, required: true, default: -1 },

  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _description: { type: String, default: 'nil' },
  _localId: { type: String, default: 'nil' },
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
  _shopId: String;
  _uid: String;
  _billMode: number;
  _halmarkingCharge: number;
  _otherCharge: number;
  _roundOff: number;
  _netTotal: number;
  _tdsReceivable: number;
  _tdsPayable: number;
  _netReceivableAmount: number;
  _isDelivered:number;
  _cgstHalmarkCharge: number;
  _cgstOtherCharge: number;
  _sgstHalmarkCharge: number;
  _sgstOtherCharge: number;
  _igstHalmarkCharge: number;
  _igstOtherCharge: number;
  _rootCauseId: string;
  _description: string;
  _localId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

InvoicesSchema.index({ _localId: 1 });
InvoicesSchema.index({ _isDelivered: 1 });
InvoicesSchema.index({ _halmarkingCharge: 1 });
InvoicesSchema.index({ _otherCharge: 1 });
InvoicesSchema.index({ _roundOff: 1 });
InvoicesSchema.index({ _netTotal: 1 });
InvoicesSchema.index({ _tdsReceivable: 1 });
InvoicesSchema.index({ _tdsPayable: 1 });
InvoicesSchema.index({ _netReceivableAmount: 1 });
InvoicesSchema.index({ _cgstHalmarkCharge: 1 });
InvoicesSchema.index({ _cgstOtherCharge: 1 });
InvoicesSchema.index({ _sgstHalmarkCharge: 1 });
InvoicesSchema.index({ _sgstOtherCharge: 1 });
InvoicesSchema.index({ _igstHalmarkCharge: 1 });
InvoicesSchema.index({ _igstOtherCharge: 1 });
InvoicesSchema.index({ _rootCauseId: 1 });
InvoicesSchema.index({ _description: 1 });
InvoicesSchema.index({ _userId: 1 });
InvoicesSchema.index({ _uid: 1, _id: 1 });
InvoicesSchema.index({ _billMode: 1 });
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
_billMode:{
    0 - PureWeight
    1 - net weight
    2 - job work
}

 */
