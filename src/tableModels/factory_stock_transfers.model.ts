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
  _uid: { type: String, required: true, default: 'nil' },
  _barcode: { type: String, required: true, default: 'nil' },
  _groupType: { type: Number, required: true, default: -1 },
  _type: { type: Number, required: true, default: -1 },
  _reminingGrossWeight: { type: Number, required: true, default: -1 },
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
  _uid: String;
  _type: Number;
  _groupType: Number;
  _reminingGrossWeight: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

FactoryStockTransfersSchema.index({ _uid: 1, _id: 1 });
FactoryStockTransfersSchema.index({ _reminingGrossWeight: 1 });
FactoryStockTransfersSchema.index({ _factoryId: 1 });
FactoryStockTransfersSchema.index({ _barcode: 1 });
FactoryStockTransfersSchema.index({ _type: 1 });
FactoryStockTransfersSchema.index({ _groupType: 1 });
FactoryStockTransfersSchema.index({ _createdUserId: 1 });
FactoryStockTransfersSchema.index({ _status: 1 });
FactoryStockTransfersSchema.index(
  { _uid: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
FactoryStockTransfersSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
FactoryStockTransfersSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
FactoryStockTransfersSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
FactoryStockTransfersSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
FactoryStockTransfersSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('UID already existing'));
  } else {
    next();
  }
} 
/*
_type:{
  0 - out wards
  1 - in wards
}
_groupType:{
  0 - non raw material
  1 - raw material
}
 */
 