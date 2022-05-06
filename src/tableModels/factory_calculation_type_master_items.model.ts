import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const FactoryCalculationTypeMasterItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUB_CATEGORIES,
    default: null,
  },
  _factoryCalculationMasterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUB_CATEGORIES,
    default: null,
  },
  _labourCharge: { type: Number, required: true, default: -1 },
  _type: { type: Number, required: true, default: -1 },
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

export interface FactoryCalculationTypeMasterItems {
  _id: String;
  _subCategoryId: String;
  _factoryCalculationMasterId: string;
  _labourCharge: Number;
  _type: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

FactoryCalculationTypeMasterItemsSchema.index({ _status: 1 });
FactoryCalculationTypeMasterItemsSchema.index({
  _factoryCalculationMasterId: 1,
});
FactoryCalculationTypeMasterItemsSchema.index({ _subCategoryId: 1 });
FactoryCalculationTypeMasterItemsSchema.index({ _labourCharge: 1 });
FactoryCalculationTypeMasterItemsSchema.index({ _type: 1 });
FactoryCalculationTypeMasterItemsSchema.index({ _createdUserId: 1 });

/*
_type:{
  0 - percentage
  1 - amount
}
 */
