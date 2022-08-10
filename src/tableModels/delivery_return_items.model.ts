import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const DeliveryReturnItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _deliveryReturnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.DELIVERY_RETURN,
    default: null,
  },
  _deliveryRejectPendingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.DELIVERY_REJECTED_PENDINGS,
    default: null,
  },
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

export interface DeliveryReturnItems {
  _id: String;
  _deliveryReturnId: String;
  _deliveryRejectPendingId: string;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

DeliveryReturnItemsSchema.index({ _deliveryReturnId: 1 });
DeliveryReturnItemsSchema.index({ _deliveryRejectPendingId: 1 });
DeliveryReturnItemsSchema.index({ _createdUserId: 1 });
DeliveryReturnItemsSchema.index({ _status: 1 });


/*

*/
