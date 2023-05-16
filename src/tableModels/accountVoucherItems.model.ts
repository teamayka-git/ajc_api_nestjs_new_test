import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const AccountVoucherItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ACCOUNT_JOURNAL,
    default: null,
  }, 
  _ledgerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ACCOUNT_LEDGER,
    default: null,
  },
  _description: { type: String, required: true, default: 'nil' },
  _currencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ACCOUNT_CURRENCY,
    default: null,
  }, 

  _exRate: { type: Number, required: true, default: 1 },
  _crdr: { type: Number, required: true, default: 1 },  
  _amount: { type: Number, required: true, default: 0 },
  _total: { type: Number, required: true, default: 0 },
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

export interface AccountVoucherItems {
  _id: String;
  _voucherId: String;
  _ledgerId: String;
  _description: String;
  _currencyId: String;
  _exRate: number;
  _crdr:number;
  _amount: number;
  _total: number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}


AccountVoucherItemsSchema.index({ _voucherId: 1 });
AccountVoucherItemsSchema.index({ _ledgerId: 1 });
AccountVoucherItemsSchema.index({ _currencyId: 1 });
AccountVoucherItemsSchema.index({ _amount: 1 });
AccountVoucherItemsSchema.index({ _total: 1 });
AccountVoucherItemsSchema.index({ _createdUserId: 1 });

/*
 */
