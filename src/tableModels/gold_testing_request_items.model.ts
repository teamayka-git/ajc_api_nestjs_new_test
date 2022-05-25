import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const GoldTestRequestItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GROUP_MASTERS,
    default: null,
  },
  _weight: { type: Number, required: true, default: -1 },
  _fineWeight: { type: Number, required: true, default: -1 },
  _expectedPurity: { type: Number, required: true, default: -1 },
  _purity: { type: Number, required: true, default: -1 },
  _testedWeight: { type: Number, required: true, default: -1 },
  _receivedWeight: { type: Number, required: true, default: -1 },
  _testedPurity: { type: Number, required: true, default: -1 },
  _actualFineWeight: { type: Number, required: true, default: -1 },
  _weightLoss: { type: Number, required: true, default: -1 },
  _allowedWeightLoss: { type: Number, required: true, default: -1 },
  _testCharge: { type: Number, required: true, default: -1 },
  _total: { type: Number, required: true, default: -1 },
  _cgst: { type: Number, required: true, default: -1 },
  _sgst: { type: Number, required: true, default: -1 },
  _igst: { type: Number, required: true, default: -1 },
  _tcUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _verifiedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
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

export interface GoldTestRequestItems {
  _id: String;
  _groupId: String;
  _weight: Number;
  _fineWeight: Number;
  _expectedPurity: Number;
  _purity: Number;
  _testedWeight: Number;
  _receivedWeight: Number;
  _testedPurity: Number;
  _actualFineWeight: Number;
  _weightLoss: Number;
  _allowedWeightLoss: Number;
  _testCharge: Number;
  _total: Number;
  _cgst: Number;
  _sgst: Number;
  _igst: Number;
  _tcUserId: string;
  _verifiedUserId: string;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

GoldTestRequestItemsSchema.index({ _status: 1 });

/*
 */
