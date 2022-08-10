import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const DeliverySchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _uid: { type: String, required: true, default: 'nil' },
  _type: { type: Number, required: true, default: -1 },
  _employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
    _receivedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
    _verifiedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  }, 
  _hubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.DELIVERY_HUBS,
    default: null,
  },
  _shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SHOPS,
    default: null,
  },
  _workStatus: { type: Number, required: true, default: -1 },
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

export interface Delivery {
  _id: String;
  _uid: string;
  _type: Number;
  _workStatus: number;
  _employeeId: String;
  _receivedUserId: String;
  _verifiedUserId: String;
  _hubId: String;
  _shopId: string;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

DeliverySchema.index({ _receivedUserId: 1 });
DeliverySchema.index({ _verifiedUserId: 1 });
DeliverySchema.index({ _shopId: 1 });
DeliverySchema.index({ _uid: 1 });
DeliverySchema.index({ _status: 1 });
DeliverySchema.index({ _type: 1 });
DeliverySchema.index({ _workStatus: 1 });
DeliverySchema.index({ _employeeId: 1 });
DeliverySchema.index({ _hubId: 1 });
DeliverySchema.index({ _createdUserId: 1 });

/*
_type:{
    0 - delivery to shop
    1 - hub transfer
}

_workStatus:{
    0 - intransit,
    1 - delivery pending,
    2 - delivery completed
}
*/
