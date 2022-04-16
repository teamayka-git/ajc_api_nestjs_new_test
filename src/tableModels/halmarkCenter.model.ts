import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const HalmarkCenterSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, required: true, default: 'nil' },
  _uid: { type: String, required: true, default: 'nil' },
  _cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.CITIES,
    default: null,
  },
  _address: { type: String, required: true, default: 'nil' },
  _mobile: { type: String, required: true, default: 'nil' },
  _ahcNo: { type: String, required: true, default: 'nil' },
  _location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
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

export interface HalmarkCenter {
  _id: String;
  _name: String;
  _uid: string;
  _cityId: string;
  _address: string;
  _mobile: string;
  _ahcNo: string;
  _location: object;
  _dataGuard: Object;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

HalmarkCenterSchema.index({ _location: '2dsphere' });
HalmarkCenterSchema.index({ _uid: 1 });
HalmarkCenterSchema.index({ _ahcNo: 1 });
HalmarkCenterSchema.index({ _mobile: 1 });
HalmarkCenterSchema.index({ _address: 1 });
HalmarkCenterSchema.index({ _cityId: 1, _id: 1 });
HalmarkCenterSchema.index({ _status: 1 });
HalmarkCenterSchema.index({ _name: 1, _id: 1 });
HalmarkCenterSchema.index(
  { _name: 1, _cityId: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
HalmarkCenterSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
HalmarkCenterSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
HalmarkCenterSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
HalmarkCenterSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
HalmarkCenterSchema.post('updateMany', async function (error, doc, next) {
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

 */
