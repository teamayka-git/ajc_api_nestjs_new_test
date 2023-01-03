import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const EmployeeStockInHandsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _uid: { type: String, required: true, default: 'nil' },
  _approvedStatus: { type: Number, required: true, default: -1 },
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

export interface EmployeeStockInHands {
  _id: String;
  _userId: String;
  _approvedStatus: Number;
  _uid: String;
  _createdUserId: String;

  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

EmployeeStockInHandsSchema.index({ _userId: 1 });
EmployeeStockInHandsSchema.index({ _approvedStatus: 1 });
EmployeeStockInHandsSchema.index({ _createdUserId: 1 });
EmployeeStockInHandsSchema.index({ _status: 1 });
EmployeeStockInHandsSchema.index({ _uid: 1, _id: 1 });
EmployeeStockInHandsSchema.index(
  { _uid: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
EmployeeStockInHandsSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
EmployeeStockInHandsSchema.post(
  'insertMany',
  async function (error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
  },
);
EmployeeStockInHandsSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
EmployeeStockInHandsSchema.post(
  'findOneAndUpdate',
  async function (error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
  },
);
EmployeeStockInHandsSchema.post(
  'updateMany',
  async function (error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
  },
);
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('UID already existing'));
  } else {
    next();
  }
}
/*
_approvedStatus:{
  -1 - pending
  0 - rejected
  1 - approved
}
 */
