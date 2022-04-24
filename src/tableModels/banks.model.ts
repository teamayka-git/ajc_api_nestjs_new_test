import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const BankSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _acNo: { type: String, required: true, default: 'nil' },
  _ifsc: { type: String, required: true, default: 'nil' },
  _acHolderName: { type: String, required: true, default: 'nil' },
  _branchName: { type: String, required: true, default: 'nil' },
  _type: { type: Number, required: true, default: -1 },
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
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

export interface Bank {
  _id: String;
  _acNo: String;
  _ifsc: String;
  _acHolderName: String;
  _branchName: String;
  _type: Number;
  _userId: String;
  _dataGuard: Object;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

BankSchema.index({ _status: 1 });
BankSchema.index({ _type: 1 });
BankSchema.index({ _acNo: 1, _id: 1 });
BankSchema.index(
  { _acNo: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
BankSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
BankSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
BankSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
BankSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
BankSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('Account already existing'));
  } else {
    next();
  }
}

/*
_type:{
    0 - Employee,
    1 - Shop,
    2 - Supplier,
    3 - Organisation,
    4 - Company
}
*/
