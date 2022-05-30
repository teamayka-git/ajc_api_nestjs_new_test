import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const GoldTestRequestsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _uid: { type: String, required: true, default: 'nil' },
  _testCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.TEST_CENTER_MASTERS,
    default: null,
  },
  _workStatus: { type: Number, required: true, default: -1 },
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },
  _description: { type: String, default: 'nil' },
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

export interface GoldTestRequests {
  _id: String;
  _testCenterId: String;
  _uid: String;
  _workStatus: Number;
  _rootCauseId: string;
  _description: string;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

GoldTestRequestsSchema.index({ _status: 1 });
GoldTestRequestsSchema.index({ _testCenterId: 1 });
GoldTestRequestsSchema.index({ _uid: 1, _id: 1 });
GoldTestRequestsSchema.index({ _workStatus: 1 });
GoldTestRequestsSchema.index({ _rootCauseId: 1 });
GoldTestRequestsSchema.index({ _description: 1 });
GoldTestRequestsSchema.index({ _createdUserId: 1 });


GoldTestRequestsSchema.index({ _uid: 1 }, { unique: true });
GoldTestRequestsSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GoldTestRequestsSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GoldTestRequestsSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GoldTestRequestsSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GoldTestRequestsSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('Uid already existing'));
  } else {
    next();
  }
}

/*

_workStatus:{
    0 - created and pending at manufacture
    1 - Test out from manufacture
    2 - In scan in test center
    3 - completed in test center
    4 - test in at manufacture
    5 - verification done at manufacture
    6 - verification completed at manufacture(this one have little doubt why v done like)
    7 - rejected from test center
}
*/
