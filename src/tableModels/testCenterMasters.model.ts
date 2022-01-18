import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const TestCenterMastersSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, required: true, default: 'nil' },
  _code: { type: Number, required: true, default: -1 },
  _place: { type: String, required: true, default: 'nil' },
  _allowerWastage: { type: Number, required: true, default: -1 },
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

export interface TestCenterMasters {
  _id: String;
  _name: String;
  _code: Number;
  _place: String;
  _allowerWastage: Number;
  _dataGuard: Object;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

TestCenterMastersSchema.index({ _place: 1 });
TestCenterMastersSchema.index({ _code: 1 });
TestCenterMastersSchema.index(
  { _code: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
TestCenterMastersSchema.index({ _name: 1 });
TestCenterMastersSchema.index(
  { _name: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
TestCenterMastersSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
TestCenterMastersSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
TestCenterMastersSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
TestCenterMastersSchema.post(
  'findOneAndUpdate',
  async function (error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
  },
);
TestCenterMastersSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('Name or Code already existing'));
  } else {
    next();
  }
}

/*
 */
