import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const RateCardPercentagesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _rateCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.RATE_CARDS,
    default: null,
  },
  _subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUB_CATEGORIES,
    default: null,
  },
  _percentage: { type: Number, required: true, default: -1 },
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

export interface RateCardPercentages {
  _id: String;
  _rateCardId: String;
  _subCategoryId: String;
  _percentage: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

RateCardPercentagesSchema.index({ _rateCardId: 1 });
RateCardPercentagesSchema.index({ _subCategoryId: 1 });
RateCardPercentagesSchema.index({ _status: 1 });

/*
 */
