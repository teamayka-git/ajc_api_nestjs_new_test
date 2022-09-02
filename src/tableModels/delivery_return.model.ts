import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const DeliveryReturnSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _uid: { type: String, required: true, default: 'nil' },
  _type: { type: Number, required: true, default: -1 },
  _employeeId: {
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
  
  _receivedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
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

export interface DeliveryReturn {
  _id: String;
  _uid: string;
  _type: Number;
  _workStatus: number; 
  _employeeId: String;
  _hubId: String;
  _shopId: string;
  _receivedUserId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

DeliveryReturnSchema.index({ _receivedUserId: 1 });
DeliveryReturnSchema.index({ _shopId: 1 });
DeliveryReturnSchema.index({ _uid: 1 });
DeliveryReturnSchema.index({ _status: 1 });
DeliveryReturnSchema.index({ _type: 1 });
DeliveryReturnSchema.index({ _workStatus: 1 });
DeliveryReturnSchema.index({ _employeeId: 1 });
DeliveryReturnSchema.index({ _hubId: 1 });
DeliveryReturnSchema.index({ _createdUserId: 1 });

/*
_type:{
    0 - delivery return from 
    1 - hub transfer
}

_workStatus:{
    0 - intransit,
    1 - delivery return completed
}
*/
