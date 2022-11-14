import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const TagMatersSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, required: true, default: 'nil' },
  _dataGuard: { type: Object, required: true, default: [] },
  _priority: { type: Number, required: true, default: -1 },
  _isShowEcommerce: { type: Number, required: true, default: -1 },
  _type: { type: Number, required: true, default: -1 },
  _startAt: { type: Number, required: true, default: -1 },
  _endAt: { type: Number, required: true, default: -1 },

  _tagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.TAG_MASTERS,
    default: null,
  },
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

export interface TagMaters {
  _id: String;
  _name: String;
  _dataGuard: Object;
  _priority:Number;
  _startAt:Number;
  _endAt:Number;
  _type:Number;
  _isShowEcommerce:Number;
  _createdUserId: String;
  _tagId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

TagMatersSchema.index({ _startAt: 1 });
TagMatersSchema.index({ _endAt: 1 });
TagMatersSchema.index({ _tagId: 1 });
TagMatersSchema.index({ _type: 1 });
TagMatersSchema.index({ _isShowEcommerce: 1 });
TagMatersSchema.index({ _priority: 1 });
TagMatersSchema.index({ _status: 1 });
TagMatersSchema.index({ _name: 1, _id: 1 });
TagMatersSchema.index(
  { _name: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
TagMatersSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
TagMatersSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
TagMatersSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
TagMatersSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
TagMatersSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('Name already existing'));
  } else {
    next();
  }
}

/*
_type:{
  0 - tag
  1 - sub tag
}
 */
