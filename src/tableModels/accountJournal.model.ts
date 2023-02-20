import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const AccountJournalSchema = new mongoose.Schema({

  _branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ACCOUNT_BRANCH,
    default: null,
  },

  _remarks: { type: String, required: true, default: 'nil' },
  _voucherNo: { type: String, required: true, default: 'nil' },
  _voucherDate: { type: Number, required: true, default: -1 },
  _postingDate: { type: Number, required: true, default: -1 },
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

export interface AccountJournal {
  _id: String;
  _branchId: String;
  _remarks: String;
  _voucherNo: String;
  _voucherDate: number;
  _postingDate: number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

AccountJournalSchema.index({ _branchId: 1 });
AccountJournalSchema.index({ _voucherNo: 1 });
AccountJournalSchema.index({ _createdUserId: 1 });
AccountJournalSchema.index({ _status: 1 });