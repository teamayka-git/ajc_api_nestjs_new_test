import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OtpSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _type: { type: Number, required: true, default: -1 },
  _otp: { type: String, required: true, default: '' },
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _createdAt: { type: Number, required: true, default: -1 },
  _status: { type: Number, required: true, default: -1 },
});

export interface Otp {
  _id: String;
  _type: Number;
  _otp: String;
  _userId: String;
  _createdAt: Number;
  _status: Number;
}

OtpSchema.index({ _status: 1 });
OtpSchema.index({ _type: 1 });
OtpSchema.index({ _otp: 1 });
OtpSchema.index({ _userId: 1 });
OtpSchema.index({ _createdAt: 1 });

/*
_type:{
    0 - user password
    1 - order delivery bypass
}
*/
