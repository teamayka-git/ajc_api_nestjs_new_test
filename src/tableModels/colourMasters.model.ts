import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const ColoursSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, required: true, default: 'nil' },
  _hexCode: { type: String, required: true, default: 'nil' },
  _hexCodeSecond: { type: String, default: 'nil' },
  _type: { type: Number, required: true, default: -1 },
  _dataGuard: { type: Object, required: true, default: [] },
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

export interface Colours {
  _id: String;
  _name: String;
  _hexCode: String;
  _hexCodeSecond: string;
  _type: number;
  _dataGuard: Object;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

ColoursSchema.index({ _status: 1 });
ColoursSchema.index({ _createdUserId: 1 });
ColoursSchema.index({ _type: 1 });
ColoursSchema.index({ _hexCodeSecond: 1 });
ColoursSchema.index({ _name: 1, _id: 1 });
ColoursSchema.index({ _hexCode: 1, _id: 1 });
ColoursSchema.index(
  { _hexCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      _hexCodeSecond: { $ne: '' },
      _status: { $lt: 2 },
    },
  },
);
ColoursSchema.index(
  { _name: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
ColoursSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ColoursSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ColoursSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ColoursSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ColoursSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('Name or hexcode already existing'));
  } else {
    next();
  }
}

/*
_type:{
    0 - solid colour
    1 - gradient
}
 */
