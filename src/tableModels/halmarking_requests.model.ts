import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const HalmarkingRequestsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _uid: { type: String, required: true, default: 'nil' },
  _orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES,
    default: null,
  },
  _productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PRODUCTS,
    default: null,
  },
  _halmarkCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.HALMARK_CENTERS,
    default: null,
  },
  _halmarkCenterUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _verifyUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _requestStatus: { type: Number, required: true, default: -1 },
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },
  _description: { type: String, default: 'nil' },
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

export interface HalmarkingRequests {
  _id: String;
  _uid: String;
  _orderId: String;
  _productId:string;
  _halmarkCenterId: String;
  _halmarkCenterUserId: String;
  _verifyUserId: String;
  _requestStatus: Number;
  _rootCauseId: String;
  _description: string;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}


HalmarkingRequestsSchema.index({ _productId: 1 });
HalmarkingRequestsSchema.index({ _uid: 1 });
HalmarkingRequestsSchema.index({ _orderId: 1 });
HalmarkingRequestsSchema.index({ _halmarkCenterId: 1 });
HalmarkingRequestsSchema.index({ _halmarkCenterUserId: 1 });
HalmarkingRequestsSchema.index({ _verifyUserId: 1 });
HalmarkingRequestsSchema.index({ _requestStatus: 1 });
HalmarkingRequestsSchema.index({ _rootCauseId: 1 });
HalmarkingRequestsSchema.index({ _description: 1 });
HalmarkingRequestsSchema.index({ _createdUserId: 1 });
HalmarkingRequestsSchema.index({ _status: 1 });

/*
_requestStatus:{
    0 - Pending,
    1 - accept,
    2 - Complete,
    3 - Reject,
    4 - Verification Completed,
}
*/
