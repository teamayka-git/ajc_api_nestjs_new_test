import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

//safeer
export const AccountOutstandingSchema = new mongoose.Schema({

  _transactionDate: { type: Number, required: true, default: -1 },
  _bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ACCOUNT_BOOK,
    default: null,
  },
  _voucherNo: { type: String, required: true, default: 'nil' },
  _voucherType: { type: Number, required: true, default: 1 },
  _branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ACCOUNT_BRANCH,
    default: null,
  },
  _ledgerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ACCOUNT_LEDGER,
    default: null,
  },
  _outstandingType: { type: Number, required: true, default: 0 },
  _rate: { type: Number, required: true, default: 0 },
  _amountMetal: { type: Number, required: true, default: 0 },
  _amountMetal_Rec: { type: Number, required: true, default: 0 },
  _amountStone: { type: Number, required: true, default: 0 },
  _amountStone_Rec: { type: Number, required: true, default: 0 },
  _pureWeightRB: { type: Number, required: true, default: 0 },
  _pureWeight100: { type: Number, required: true, default: 0 },
  _pureWeight100_Rec: { type: Number, required: true, default: 0 },
  _pureWeight: { type: Number, required: true, default: 0 },
  _pureWeight_Rec: { type: Number, required: true, default: 0 },
  _amountHM: { type: Number, required: true, default: 0 },
  _amountHM_Rec: { type: Number, required: true, default: 0 },
  _amountOTH: { type: Number, required: true, default: 0 },
  _amountOTH_Rec: { type: Number, required: true, default: 0 },
  _amountMC: { type: Number, required: true, default: 0 },
  _amountMC_Rec: { type: Number, required: true, default: 0 },
  _description: { type: String, required: true, default: '' },
  _amountTotal: { type: Number, required: true, default: 0 },
  _amountTotal_Rec: { type: Number, required: true, default: 0 },
  _transactionSign: { type: Number, required: true, default: 0 },
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

export interface AccountOutstanding {
  _id: String;
  _transactionDate: number;
  _bookId: String;  
  _voucherNo: String;
  _voucherType: number;
  _branchId: String;
  _ledgerId: String;
  _outstandingType: number;
  _rate: number;  
  _amountMetal: number;    
  _amountMetal_Rec: number;    
  _amountStone: number;  
  _amountStone_Rec: number;  
  _pureWeightRB: number;  
  _pureWeight100: number;  
  _pureWeight100_Rec: number;  
  _pureWeight: number;  
  _pureWeight_Rec: number;  
  _amountHM: number; 
  _amountHM_Rec: number;   
  _amountOTH: number;  
  _amountOTH_Rec: number;  
  _amountMC: number;  
  _amountMC_Rec: number;  
  _description: String;
  _amountTotal: number;
  _amountTotal_Rec: number;  
  _transactionSign: number;  
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}


AccountOutstandingSchema.index({ _ledgerId: 1 });
AccountOutstandingSchema.index({ _branchId: 1 });
AccountOutstandingSchema.index({ _voucherNo: 1 });
AccountOutstandingSchema.index({ _createdUserId: 1 });
AccountOutstandingSchema.index({ _status: 1 });

