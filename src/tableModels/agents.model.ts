import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const AgentsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _uid: { type: String, required: true, default: 'nil' },
  _cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.CITIES,
    default: null,
  },
  _lastLogin: { type: Number, required: true, default: -1 },
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

export interface Agents {
  _id: String;
  _cityId: String;
  _uid: String;
  _lastLogin: Number;
  _dataGuard: Object;
  _userId: string;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

AgentsSchema.index({ _status: 1 });
AgentsSchema.index({ _uid: 1, _id: 1 });
AgentsSchema.index({ _cityId: 1 });
AgentsSchema.index({ _userId: 1, _id: 1 });
AgentsSchema.index(
  { _userId: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);

AgentsSchema.index({ _uid: 1 }, { unique: true });
AgentsSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
AgentsSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
AgentsSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
AgentsSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
AgentsSchema.post('updateMany', async function (error, doc, next) {
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
