import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

//safeer
export const AccountVoucherSchema = new mongoose.Schema({

  _voucherNo: { type: String, required: true, default: 'nil' },
  _voucherDate: { type: Number, required: true, default: -1 },
  _voucherType: { type: Number, required: true, default: 1 },
  _ledgerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ACCOUNT_LEDGER,
    default: null,
  },
  _branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ACCOUNT_BRANCH,
    default: null,
  },
  _remarks: { type: String, required: true, default: '' },
  _docNo: { type: String, required: false, default: '' },
  _docDate: { type: Number, required: false, default: -1 },
  _crdr: { type: String, required: true, default: 'Cr' },
  _amount: { type: Number, required: true, default: 0 },
  _postingDate: { type: Number, required: true, default: -1 },
  _allocationRequired: { type: Number, required: true, default: 0 },
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

export interface AccountVoucher {
  _id: String;
  _voucherNo: String;
  _voucherDate: number;
  _voucherType: number;
  _ledgerId: String;  
  _branchId: String;
  _remarks: String;
  _docNo: String;
  _docDate: number;
  _crdr: number;
  _amount: number;  
  _postingDate: number;
  _allocationRequired: number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}


AccountVoucherSchema.index({ _branchId: 1 });
AccountVoucherSchema.index({ _voucherNo: 1 });
AccountVoucherSchema.index({ _createdUserId: 1 });
AccountVoucherSchema.index({ _status: 1 });