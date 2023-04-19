import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const HalmarkBundlesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _hmCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.HALMARK_CENTERS,
    default: null,
  },
  _uid: { type: String, required: true, default: 'nil' },
  _rootCause: { type: String, required: false, default: '' },
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },
  _workStatus: { type: Number, required: true, default: -1 },
  _acceptedAt: { type: Number, required: true, default: -1 },
  _finishedAt: { type: Number, required: true, default: -1 },
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

export interface HalmarkBundles {
  _id: String;
  _hmCenter: String;
  _uid: String;
  _workStatus: Number;
  _acceptedAt: Number;
  _finishedAt: Number;
  _rootCause: String;
  _rootCauseId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

HalmarkBundlesSchema.index({ _rootCause: 1 });
HalmarkBundlesSchema.index({ _rootCauseId: 1 });
HalmarkBundlesSchema.index({ _hmCenter: 1 });
HalmarkBundlesSchema.index({ _uid: 1, _id: 1 });
HalmarkBundlesSchema.index({ _workStatus: 1 });
HalmarkBundlesSchema.index({ _acceptedAt: 1 });
HalmarkBundlesSchema.index({ _finishedAt: 1 });
HalmarkBundlesSchema.index({ _createdUserId: 1 });
HalmarkBundlesSchema.index({ _createdAt: 1 });
HalmarkBundlesSchema.index({ _status: 1 });
HalmarkBundlesSchema.index(
  { _uid: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
HalmarkBundlesSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
HalmarkBundlesSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
HalmarkBundlesSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
HalmarkBundlesSchema.post(
  'findOneAndUpdate',
  async function (error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
  },
);
HalmarkBundlesSchema.post('updateMany', async function (error, doc, next) {
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
_workStatus:{
  0 - pending
  1 - accept
  2 - reject
  3 - completed
  4 - bypassed
  5 - assigned hm center
}
 */
