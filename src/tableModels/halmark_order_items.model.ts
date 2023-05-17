import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const HalmarkOrderItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _orderSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_MAIN,
    default: null,
  },
  _hmMainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.HALMARK_ORDER_MAIN,
    default: null,
  },
  _orderSaleItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_ITEMS,
    default: null,
  },
  _subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUB_CATEGORIES,
    default: null,
  },
  _huid: { type: String, required: false, default: '' },
  _weight: { type: Number, required: true, default: -1 },
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

export interface HalmarkOrderItems {
  _id: String;
  _orderSaleId: String;
  _hmMainId: String;
  _orderSaleItemId: String;
  _subCategoryId: String;
  _huid: String;
  _weight: Number;
  _type: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

HalmarkOrderItemsSchema.index({ _orderSaleId: 1 });
HalmarkOrderItemsSchema.index({ _hmMainId: 1 });
HalmarkOrderItemsSchema.index({ _orderSaleItemId: 1 });
HalmarkOrderItemsSchema.index({ _subCategoryId: 1 });
HalmarkOrderItemsSchema.index({ _huid: 1 });
HalmarkOrderItemsSchema.index({ _weight: 1 });
HalmarkOrderItemsSchema.index({ _type: 1 });
HalmarkOrderItemsSchema.index({ _createdUserId: 1 });
HalmarkOrderItemsSchema.index({ _status: 1 });

/*

_type:{
  0 - order
  1 - test
}
 */
