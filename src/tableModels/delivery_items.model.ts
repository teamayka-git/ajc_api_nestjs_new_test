import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const DeliveryItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _deliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.DELIVERY,
    default: null,
  },
  _orderSaleItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_ITEMS,
    default: null,
  },
  _invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.INVOICES,
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

export interface DeliveryItems {
  _id: String;
  _orderSaleItemId: String;
  _orderId: String;
  _invoiceId: string;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

DeliveryItemsSchema.index({ _orderSaleItemId: 1 });
DeliveryItemsSchema.index({ _orderId: 1 });
DeliveryItemsSchema.index({ _invoiceId: 1 });
DeliveryItemsSchema.index({ _createdUserId: 1 });
DeliveryItemsSchema.index({ _status: 1 });


/*

*/
