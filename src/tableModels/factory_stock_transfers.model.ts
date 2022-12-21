import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const FactoryStockTransfersSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _factoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.FACTORIES,
    default: null,
  },
  _barcode: { type: String, required: true, default: 'nil' },
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

export interface FactoryStockTransfers {
  _id: String;
  _factoryId: String;
  _barcode: String;
  _type: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

FactoryStockTransfersSchema.index({ _factoryId: 1 });
FactoryStockTransfersSchema.index({ _barcode: 1 });
FactoryStockTransfersSchema.index({ _type: 1 });
FactoryStockTransfersSchema.index({ _createdUserId: 1 });
FactoryStockTransfersSchema.index({ _status: 1 });

/*
_type:{
  0 - out wards
  1 - in wards
}
 */
 