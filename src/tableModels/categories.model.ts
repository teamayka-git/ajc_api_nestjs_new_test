import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const CategoriesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, required: true, default: 'nil' },
  _code: { type: Number, required: true, default: -1 },
  _description: { type: String, required: true, default: 'nil' },
  _groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GROUP_MASTERS,
    default: null,
  },
  _dataGuard: { type:Object, required: true, default: [] },
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

export interface Categories {
  _id: String;
  _name: String;
  _code: Number;
  _description: String;
  _groupId: String;
  _dataGuard:Object;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

CategoriesSchema.index({_status: 1});
CategoriesSchema.index({ _description: 1 });
CategoriesSchema.index({ _groupId: 1 });
CategoriesSchema.index({ _code: 1 });
CategoriesSchema.index({ _name: 1 });
CategoriesSchema.index(
  { _code: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
CategoriesSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
CategoriesSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
CategoriesSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
CategoriesSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
CategoriesSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('Code already existing'));
  } else {
    next();
  }
}

/*
 */
