import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const DeliveryTempSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _type: { type: Number, required: true, default: -1 },
  _invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.INVOICES,
    default: null,
  },
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
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },
  _mistakeType: { type: Number, required: true, default: -1 },
  _reworkStatus: { type: Number, required: true, default: -1 },
  _rootCause: { type: String, default: '' },
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

export interface DeliveryTemp {
  _id: String;
  _type: Number;
  _invoiceId: String;
  _employeeId: String;
  _hubId: String;

  _rootCauseId: String; // it will collect data after delivery reject
  _rootCause: String; // it will collect data after delivery reject
  _reworkStatus: Number; // it will collect data after delivery reject
  _mistakeType: Number; // it will collect data after delivery reject

  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

DeliveryTempSchema.index({ _status: 1 });
DeliveryTempSchema.index({ _type: 1 });
DeliveryTempSchema.index({ _invoiceId: 1 });
DeliveryTempSchema.index({ _employeeId: 1 });
DeliveryTempSchema.index({ _hubId: 1 });
DeliveryTempSchema.index({ _createdUserId: 1 });
DeliveryTempSchema.index({ _rootCauseId: 1 });
DeliveryTempSchema.index({ _rootCause: 1 });
DeliveryTempSchema.index({ _reworkStatus: 1 });
DeliveryTempSchema.index({ _mistakeType: 1 });

/*
_type:{
    -1- not assigned
    0 - delivery to shop
    1 - hub transfer
}
_mistakeType:{
    -1 - nothing,
    0 - mistake by ajc,
    1 - mistake by customer,
}
_reworkStatus:{
    -1 - nothing,
    0 - do cancel,
    1 - do rework,
}
*/
