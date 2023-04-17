import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const SalesReturnsSchema = new mongoose.Schema({
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
  _isAccountPosted: { type: Number, required: true, default: -1 },
  _saleType: { type: Number, required: true, default: -1 },
  _isFix: { type: Number, required: true, default: -1 },

  _price1: { type: Number, required: true, default: -1 },
  _price2: { type: Number, required: true, default: -1 },
  _metalAmountGst: { type: Number, required: true, default: -1 },
  _stoneAmount: { type: Number, required: true, default: -1 },
  _stoneAmountGst: { type: Number, required: true, default: -1 },
  _pureWeightHundredPercentage: { type: Number, required: true, default: -1 },
  _pureWeight: { type: Number, required: true, default: -1 },
  _cgst: { type: Number, required: true, default: -1 },
  _sgst: { type: Number, required: true, default: -1 },
  _igst: { type: Number, required: true, default: -1 },

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

export interface SalesReturns {
  _id: String;
  _userId: String;
  _shopId: String;
  _uid: String;
  _billMode: number;
  _saleType: number;
  _isFix: number;
  _halmarkingCharge: number;
  _otherCharge: number;
  _roundOff: number;
  _netTotal: number;
  _tdsReceivable: number;
  _tdsPayable: number;
  _netReceivableAmount: number;
  _isDelivered: number;
  _isAccountPosted: number;
  _cgstHalmarkCharge: number;
  _cgstOtherCharge: number;
  _sgstHalmarkCharge: number;
  _sgstOtherCharge: number;
  _igstHalmarkCharge: number;
  _igstOtherCharge: number;
  _rootCauseId: string;
  _description: string;
  _localId: String;

  _price1: Number;
  _price2: Number;
  _metalAmountGst: Number;
  _stoneAmount: Number;
  _stoneAmountGst: Number;
  _pureWeightHundredPercentage: Number;
  _pureWeight: Number;
  _cgst: Number;
  _sgst: Number;
  _igst: Number;

  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

SalesReturnsSchema.index({ _price1: 1 });
SalesReturnsSchema.index({ _price2: 1 });
SalesReturnsSchema.index({ _metalAmountGst: 1 });
SalesReturnsSchema.index({ _stoneAmount: 1 });
SalesReturnsSchema.index({ _stoneAmountGst: 1 });
SalesReturnsSchema.index({ _pureWeightHundredPercentage: 1 });
SalesReturnsSchema.index({ _pureWeight: 1 });
SalesReturnsSchema.index({ _cgst: 1 });
SalesReturnsSchema.index({ _sgst: 1 });
SalesReturnsSchema.index({ _igst: 1 });
SalesReturnsSchema.index({ _saleType: 1 });
SalesReturnsSchema.index({ _isFix: 1 });
SalesReturnsSchema.index({ _isAccountPosted: 1 });
SalesReturnsSchema.index({ _localId: 1 });
SalesReturnsSchema.index({ _isDelivered: 1 });
SalesReturnsSchema.index({ _halmarkingCharge: 1 });
SalesReturnsSchema.index({ _otherCharge: 1 });
SalesReturnsSchema.index({ _roundOff: 1 });
SalesReturnsSchema.index({ _netTotal: 1 });
SalesReturnsSchema.index({ _tdsReceivable: 1 });
SalesReturnsSchema.index({ _tdsPayable: 1 });
SalesReturnsSchema.index({ _netReceivableAmount: 1 });
SalesReturnsSchema.index({ _cgstHalmarkCharge: 1 });
SalesReturnsSchema.index({ _cgstOtherCharge: 1 });
SalesReturnsSchema.index({ _sgstHalmarkCharge: 1 });
SalesReturnsSchema.index({ _sgstOtherCharge: 1 });
SalesReturnsSchema.index({ _igstHalmarkCharge: 1 });
SalesReturnsSchema.index({ _igstOtherCharge: 1 });
SalesReturnsSchema.index({ _rootCauseId: 1 });
SalesReturnsSchema.index({ _description: 1 });
SalesReturnsSchema.index({ _userId: 1 });
SalesReturnsSchema.index({ _uid: 1, _id: 1 });
SalesReturnsSchema.index({ _billMode: 1 });
SalesReturnsSchema.index({ _createdUserId: 1 });
SalesReturnsSchema.index({ _status: 1 });
SalesReturnsSchema.index(
  { _uid: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
SalesReturnsSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
SalesReturnsSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
SalesReturnsSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
SalesReturnsSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
SalesReturnsSchema.post('updateMany', async function (error, doc, next) {
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
