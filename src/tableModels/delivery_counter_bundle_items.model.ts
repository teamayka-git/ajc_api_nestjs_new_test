import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const DeliveryCounterBundleItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _bundleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.DELIVERY_COUNTER_BUNDLES,
    default: null,
  },
  _orderSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_MAIN,
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

export interface DeliveryCounterBundleItems {
  _id: String;
  _bundleId: String;
  _orderSaleId: string;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

DeliveryCounterBundleItemsSchema.index({ _bundleId: 1 });
DeliveryCounterBundleItemsSchema.index({ _orderSaleId: 1 });
DeliveryCounterBundleItemsSchema.index({ _createdUserId: 1 });
DeliveryCounterBundleItemsSchema.index({ _status: 1 });


/*

*/
