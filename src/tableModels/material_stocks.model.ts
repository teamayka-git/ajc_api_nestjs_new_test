import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const MterialStocksSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  
  _voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.MATERIAL_RECEIPT_HEADS,
    default: null,
  },
  _voucherDetailedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.MATERIAL_RECEIPT_ITEMS,
    default: null,
  },
  _voucherType: { type: Number, required: true, default: -1 },
  _transactionDate: { type: Number, required: true, default: -1 },
  _transactionRemark: { type: String, required: false, default: '' },
  _uidForeign : { type: String, required: true, default: 'nil' },
  
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.MATERIAL_RECEIPT_ITEMS,
    default: null,
  },
  _transactionSign : { type: Number, required: true, default: -1 },
  _pureWeightRB : { type: Number, required: true, default: -1 },
  _pureWeightHundred : { type: Number, required: true, default: -1 },
  _unitRate : { type: Number, required: true, default: -1 },
  
  _accountBranchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ACCOUNT_BRANCH,
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

export interface MterialStocks {
  _id: String;
  _voucherId: String;
  _voucherDetailedId: String;
  _voucherType: Number;
  _transactionDate: Number;
  _transactionRemark: String;
  _uidForeign: String;
  _userId: String;
  _transactionSign: Number;
  _pureWeightRB: Number;
  _pureWeightHundred: Number;
  _unitRate: Number;
  _accountBranchId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

MterialStocksSchema.index({ _voucherId: 1 });
MterialStocksSchema.index({ _voucherDetailedId: 1 });
MterialStocksSchema.index({ _voucherType: 1 });
MterialStocksSchema.index({ _transactionDate: 1 });
MterialStocksSchema.index({ _transactionRemark: 1 });
MterialStocksSchema.index({ _uidForeign: 1 });
MterialStocksSchema.index({ _userId: 1 });
MterialStocksSchema.index({ _transactionSign: 1 });
MterialStocksSchema.index({ _pureWeightRB: 1 });
MterialStocksSchema.index({ _pureWeightHundred: 1 });
MterialStocksSchema.index({ _unitRate: 1 });
MterialStocksSchema.index({ _accountBranchId: 1 });
MterialStocksSchema.index({ _createdUserId: 1 });
MterialStocksSchema.index({ _updatedUserId: 1 });
MterialStocksSchema.index({ _createdAt: 1 });
MterialStocksSchema.index({ _status: 1 });



/*
_voucherType:{
  1-Sales, 
  2-Sales On Approval, 
  3-HM, 
  4-Purchase, 
  5-Delivery, 
  6- Gold Test, 
  7-Delivery Counter, 
  8-Material receipt
}
_transactionSign:{
  -1 StockOut,
   1 StockIn
}
*/
