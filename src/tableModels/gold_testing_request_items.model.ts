import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const GoldTestRequestItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _goldTestRequesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GOLD_TESTING_REQUESTS,
    default: null,
  },  _groupId: {
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
  _tcDoneUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _tcDoneTime: { type: Number, required: true, default: -1 },
  _verifiedManufactureUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _verifiedManufactureTime: { type: Number, required: true, default: -1 },
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
  _goldTestRequesId:string;
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
  _tcDoneUserId: string;
  _verifiedManufactureUserId: string;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

GoldTestRequestItemsSchema.index({ _goldTestRequesId: 1 });
GoldTestRequestItemsSchema.index({ _groupId: 1 });
GoldTestRequestItemsSchema.index({ _weight: 1 });
GoldTestRequestItemsSchema.index({ _fineWeight: 1 });
GoldTestRequestItemsSchema.index({ _expectedPurity: 1 });
GoldTestRequestItemsSchema.index({ _purity: 1 });
GoldTestRequestItemsSchema.index({ _testedWeight: 1 });
GoldTestRequestItemsSchema.index({ _receivedWeight: 1 });
GoldTestRequestItemsSchema.index({ _testedPurity: 1 });
GoldTestRequestItemsSchema.index({ _actualFineWeight: 1 });
GoldTestRequestItemsSchema.index({ _weightLoss: 1 });
GoldTestRequestItemsSchema.index({ _allowedWeightLoss: 1 });
GoldTestRequestItemsSchema.index({ _testCharge: 1 });
GoldTestRequestItemsSchema.index({ _total: 1 });
GoldTestRequestItemsSchema.index({ _cgst: 1 });
GoldTestRequestItemsSchema.index({ _sgst: 1 });
GoldTestRequestItemsSchema.index({ _igst: 1 });
GoldTestRequestItemsSchema.index({ _tcDoneUserId: 1 });
GoldTestRequestItemsSchema.index({ _verifiedManufactureUserId: 1 });
GoldTestRequestItemsSchema.index({ _createdUserId: 1 });
GoldTestRequestItemsSchema.index({ _createdAt: 1 });
GoldTestRequestItemsSchema.index({ _status: 1 });

/*
 */
