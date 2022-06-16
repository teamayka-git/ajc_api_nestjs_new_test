import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const CustomersSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _uid: { type: String, required: true, default: 'nil' },
  _field1: { type: String,  default: 'nil' },
  _field2: { type: String,  default: 'nil' },
  _field3: { type: String,  default: 'nil' },
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

export interface Customers {
  _id: String;
  _uid: String;
  _field1: String;
  _field2: String;
  _field3: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

CustomersSchema.index({ _status: 1 });
CustomersSchema.index({ _uid: 1, _id: 1 });
CustomersSchema.index({ _cityId: 1 });
CustomersSchema.index({ _userId: 1, _id: 1 });
CustomersSchema.index(
  { _userId: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);

CustomersSchema.index({ _uid: 1 }, { unique: true });
CustomersSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
CustomersSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
CustomersSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
CustomersSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
CustomersSchema.post('updateMany', async function (error, doc, next) {
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
