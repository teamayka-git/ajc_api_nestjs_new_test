import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const DeliveryRejectedPendingsSchema = new mongoose.Schema({
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
  _invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.INVOICES,
    default: null,
  }, 
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },
  _shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SHOPS,
    default: null,
  },
  
  _productedBarcode: { type: String, default: '' },
  _rootCause: { type: String, default: '' },
  _mistakeType: { type: Number, required: true, default: -1 },
  _reworkStatus: { type: Number, required: true, default: -1 },
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

export interface DeliveryRejectedPendings {
  _id: String;
  _salesItemId: string;
  _salesId: string;
  _deliveryId: string; 
  _invoiceId: string;
  _shopId: string; 
  _rootCauseId: string;
  _productedBarcode:string;
  _rootCause: string;
  _reworkStatus: Number;
  _mistakeType: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

DeliveryRejectedPendingsSchema.index({ _productedBarcode: 1 });
DeliveryRejectedPendingsSchema.index({ _shopId: 1 });
DeliveryRejectedPendingsSchema.index({ _reworkStatus: 1 });
DeliveryRejectedPendingsSchema.index({ _mistakeType: 1 });
DeliveryRejectedPendingsSchema.index({ _invoiceId: 1 });
DeliveryRejectedPendingsSchema.index({ _salesItemId: 1 });
DeliveryRejectedPendingsSchema.index({ _salesId: 1 });
DeliveryRejectedPendingsSchema.index({ _deliveryId: 1 });
DeliveryRejectedPendingsSchema.index({ _rootCauseId: 1 });
DeliveryRejectedPendingsSchema.index({ _rootCause: 1 });
DeliveryRejectedPendingsSchema.index({ _createdUserId: 1 });
DeliveryRejectedPendingsSchema.index({ _status: 1 });

/*

_mistakeType:{
    0 - mistake by ajc,
    1 - mistake by customer,
}
_reworkStatus:{
    0 - do cancel,
    1 - do rework,
}

*/
