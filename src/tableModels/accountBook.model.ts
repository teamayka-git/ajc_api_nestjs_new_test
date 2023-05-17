import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

//safeer
export const AccountBookSchema = new mongoose.Schema({

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
  _description: { type: String, required: false, default: '' },
  _docNo: { type: String, required: false, default: '' },
  _docDate: { type: Number, required: false, default: -1 },
  _crdr: { type: Number, required: true, default: 1 },
  _amount: { type: Number, required: true, default: 0 },
  _total: { type: Number, required: true, default: 0 },
  _createdUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _status: { type: Number, required: true, default: -1 },
});

export interface AccountBook {
  _id: String;
  _transactionDate: number;
  _voucherId: String;
  _voucherNo: String;
  _voucherType: number;
  _ledgerId: String;  
  _branchId: String;
  _description: String;
  _currencyId: String;
  _exRate: number;
  _crdr: number;
  _amount: number;  
  _total: number;
  _createdUserId: String;
  _status: Number;
}



AccountBookSchema.index({ _branchId: 1 });
AccountBookSchema.index({ _voucherNo: 1 });
AccountBookSchema.index({ _createdUserId: 1 });
AccountBookSchema.index({ _status: 1 });