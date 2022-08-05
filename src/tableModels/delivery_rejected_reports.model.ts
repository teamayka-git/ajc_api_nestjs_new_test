import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const DeliveryRejectedReportsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _salesItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_ITEMS,
    default: null,
  },
  _salesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_MAIN,
    default: null,
  },
  _deliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.DELIVERY,
    default: null,
  },
  _employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },
  _rootCause: { type: String, default: '' },
  _type: { type: Number, required: true, default: -1 },
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

export interface DeliveryRejectedReports {
  _id: String;
  _salesItemId: string;
  _salesId: string;
  _deliveryId: string;
  _employeeId: string;
  _rootCauseId: string;
  _rootCause: string;
  _type: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

DeliveryRejectedReportsSchema.index({ _salesItemId: 1 });
DeliveryRejectedReportsSchema.index({ _salesId: 1 });
DeliveryRejectedReportsSchema.index({ _deliveryId: 1 });
DeliveryRejectedReportsSchema.index({ _employeeId: 1 });
DeliveryRejectedReportsSchema.index({ _rootCauseId: 1 });
DeliveryRejectedReportsSchema.index({ _rootCause: 1 });
DeliveryRejectedReportsSchema.index({ _type: 1 });
DeliveryRejectedReportsSchema.index({ _createdUserId: 1 });
DeliveryRejectedReportsSchema.index({ _status: 1 });

/*
_type:{
    0 - pending
    1 - Assigned employee
    2 - Employee accepted
    3 - Employee rejected
}

*/
