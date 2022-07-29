import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const EmployeeSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _prefix: { type: String, default: '' },
  _uid: { type: String, required: true, default: 'nil' },
  _lastLogin: { type: Number, required: true, default: -1 },
  _departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.DEPARTMENT,
    default: null,
  },
  _processMasterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PROCESS_MASTER,
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

export interface Employee {
  _id: String;
  _userId: string;
  _uid: String;
  _departmentId: String;
  _prefix: String;
  _processMasterId: String;
  _lastLogin: Number;
  _dataGuard: Object;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

EmployeeSchema.index({ _departmentId: 1 });
EmployeeSchema.index({ _processMasterId: 1 });
EmployeeSchema.index({ _status: 1 });
EmployeeSchema.index({ _uid: 1, _id: 1 });
EmployeeSchema.index({ _userId: 1, _id: 1 });
EmployeeSchema.index({ _prefix: 1, _id: 1 });

EmployeeSchema.index({ _uid: 1 }, { unique: true });

EmployeeSchema.index(
  { _userId: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
EmployeeSchema.index(
  { _prefix: 1 },
  {
    unique: true,
    partialFilterExpression: { _status: { $lt: 2 }, _prefix: { $ne: '' } },
  },
);
EmployeeSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
EmployeeSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
EmployeeSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
EmployeeSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
EmployeeSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('User or Uid already existing'));
  } else {
    next();
  }
}

/*

*/
