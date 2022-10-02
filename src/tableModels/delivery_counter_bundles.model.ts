import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const DeliveryBundlesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _uid: { type: String, required: true, default: 'nil' },
  _employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  }, 
  _deliveryCounterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.DELIVERY_COUNTERS,
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

export interface DeliveryBundles {
  _id: String;
  _uid: string;
  _workStatus: number; 
  _employeeId: String;
  _deliveryCounterId: String;
  _receivedUserId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

DeliveryBundlesSchema.index({ _receivedUserId: 1 });
DeliveryBundlesSchema.index({ _deliveryCounterId: 1 });
DeliveryBundlesSchema.index({ _uid: 1 });
DeliveryBundlesSchema.index({ _status: 1 });
DeliveryBundlesSchema.index({ _workStatus: 1 });
DeliveryBundlesSchema.index({ _employeeId: 1 });
DeliveryBundlesSchema.index({ _createdUserId: 1 });

/*
_workStatus:{
    0 - intransit,
    1 - completed
}
*/
