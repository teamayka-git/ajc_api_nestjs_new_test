import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const DeliveryChallansSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _uid: { type: String, required: true, default: 'nil' },

  _deliveryMode: { type: Number, required: true, default: -1 },
  _deliveryProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.DELIVERY_PROVIDER,
    default: null,
  },
  _deliveryExicutiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _referenceUrl: { type: String, default: 'nil' },
  _type: { type: Number, required: true, default: -1 },
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _description: { type: String, default: 'nil' },
  _saleType: { type: Number, required: true, default: -1 },
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

export interface DeliveryChallans {
  _id: String;
  _userId: String;
  _uid: String;
  _deliveryMode: number;
  _deliveryProviderId: String;
  _deliveryExicutiveId: String;
  _rootCauseId: string;
  _description: string;
  _referenceUrl: String;
  _type: number;
  _saleType: number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

DeliveryChallansSchema.index({ _rootCauseId: 1 });
DeliveryChallansSchema.index({ _description: 1 });
DeliveryChallansSchema.index({ _userId: 1 });
DeliveryChallansSchema.index({ _uid: 1, _id: 1 });
DeliveryChallansSchema.index({ _deliveryMode: 1 });
DeliveryChallansSchema.index({ _deliveryProviderId: 1 });
DeliveryChallansSchema.index({ _deliveryExicutiveId: 1 });
DeliveryChallansSchema.index({ _referenceUrl: 1 });
DeliveryChallansSchema.index({ _type: 1 });
DeliveryChallansSchema.index({ _saleType: 1 });
DeliveryChallansSchema.index({ _createdUserId: 1 });
DeliveryChallansSchema.index({ _status: 1 });
DeliveryChallansSchema.index(
  { _uid: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
DeliveryChallansSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
DeliveryChallansSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
DeliveryChallansSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
DeliveryChallansSchema.post(
  'findOneAndUpdate',
  async function (error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
  },
);
DeliveryChallansSchema.post('updateMany', async function (error, doc, next) {
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
_deliveryMode:{
    0 - executive
    1 - courier
    2 - third party
}
_type:{
    0 - halmark
    1 - hub transfer
}
_saleType:{
    0 - order sale
    1 - stock sale
    2 - job work
}

 */
