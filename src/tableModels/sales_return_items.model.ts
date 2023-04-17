import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const SalesReturnItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _salesReturnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SALES_RETURNS,
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
  
  _grossAmount: { type: Number, required: true, default: -1 },
  _orderUid: { type: String, required: true, default: 'nil' },
  _categoryName: { type: String, required: true, default: 'nil' },
  _subCategoryName: { type: String, required: true, default: 'nil' },
  _productName: { type: String, required: true, default: 'nil' },
  _purity: { type: Number, required: true, default: -1 },
  _hsnCode: { type: String, required: true, default: 'nil' },
  _huid: { type: Object, required: true, default: 'nil' },
  _grossWeight: { type: Number, required: true, default: -1 },
  _stoneWeight: { type: Number, required: true, default: -1 },
  _netWeight: { type: Number, required: true, default: -1 },
  _touch: { type: Number, required: true, default: -1 },
  _pureWeight: { type: Number, required: true, default: -1 },
  _pureWeightHundredPercentage: { type: Number, required: true, default: -1 },
  _unitRate: { type: Number, required: true, default: -1 },
  _amount: { type: Number, required: true, default: -1 },
  _stoneAmount: { type: Number, required: true, default: -1 },
  _totalValue: { type: Number, required: true, default: -1 },
  _makingChargeGst: { type: Number, required: true, default: -1 },
  _cgst: { type: Number, required: true, default: -1 },
  _sgst: { type: Number, required: true, default: -1 },
  _igst: { type: Number, required: true, default: -1 },
  _metalAmountGst: { type: Number, required: true, default: -1 },
  _stoneAmountGst: { type: Number, required: true, default: -1 },
  _makingChargeWithHundredPercentage: {
    type: Number,
    required: true,
    default: -1,
  },
  _makingChargeAmount: { type: Number, required: true, default: -1 },
  _productBarcode: { type: String, default: 'nil' },
  _productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PRODUCTS,
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

export interface SalesReturnItems {
  _id: String;
  _salesReturnId: String;
  _subCategoryId: String;
  _orderSaleItemId: String;
  _grossAmount: number;
  _orderUid:string;
  _categoryName: String;
  _subCategoryName: String;
  _productName: String;
  _purity: number;
  _hsnCode: String;
  _huid: String;
  _grossWeight: number;
  _stoneWeight: number;
  _netWeight: number;
  _tought: number;
  _pureWeight: number;
  _pureWeightHundredPercentage: number;
  _unitRate: number;
  _amount: number;
  _stoneAmount: number;
  _totalValue: number;
  _makingChargeGst: number;
  _cgst: number;
  _sgst: number;
  _igst: number;
  _metalAmountGst: number;
  _stoneAmountGst: number;
  _makingChargeWithHundredPercentage: number;
  _makingChargeAmount: number;
  _productBarcode: String;
  _productId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

SalesReturnItemsSchema.index({ _grossAmount: 1 });
SalesReturnItemsSchema.index({ _subCategoryId: 1 });
SalesReturnItemsSchema.index({ _makingChargeGst: 1 });
SalesReturnItemsSchema.index({ _orderUid: 1 });
SalesReturnItemsSchema.index({ _status: 1 });
SalesReturnItemsSchema.index({ _invoiceId: 1 });
SalesReturnItemsSchema.index({ _orderSaleItemId: 1 });
SalesReturnItemsSchema.index({ _categoryName: 1 });
SalesReturnItemsSchema.index({ _subCategoryName: 1 });
SalesReturnItemsSchema.index({ _productName: 1 });
SalesReturnItemsSchema.index({ _purity: 1 });
SalesReturnItemsSchema.index({ _hsnCode: 1 });
SalesReturnItemsSchema.index({ _huid: 1 });
SalesReturnItemsSchema.index({ _grossWeight: 1 });
SalesReturnItemsSchema.index({ _stoneWeight: 1 });
SalesReturnItemsSchema.index({ _netWeight: 1 });
SalesReturnItemsSchema.index({ _tought: 1 });
SalesReturnItemsSchema.index({ _pureWeight: 1 });
SalesReturnItemsSchema.index({ _pureWeightHundredPercentage: 1 });
SalesReturnItemsSchema.index({ _unitRate: 1 });
SalesReturnItemsSchema.index({ _amount: 1 });
SalesReturnItemsSchema.index({ _stoneAmount: 1 });
SalesReturnItemsSchema.index({ _totalValue: 1 });
SalesReturnItemsSchema.index({ _cgst: 1 });
SalesReturnItemsSchema.index({ _sgst: 1 });
SalesReturnItemsSchema.index({ _igst: 1 });
SalesReturnItemsSchema.index({ _metalAmountGst: 1 });
SalesReturnItemsSchema.index({ _stoneAmountGst: 1 });
SalesReturnItemsSchema.index({ _makingChargeWithHundredPercentage: 1 });
SalesReturnItemsSchema.index({ _makingChargeAmount: 1 });
SalesReturnItemsSchema.index({ _productBarcode: 1 });
SalesReturnItemsSchema.index({ _productId: 1 });
SalesReturnItemsSchema.index({ _createdUserId: 1 });

/*
 */
