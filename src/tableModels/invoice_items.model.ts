import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const InvoiceItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.INVOICES,
    default: null,
  },
  _orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES,
    default: null,
  },
  _orderUid: { type: String, required: true, default: 'nil' },
  _categoryName: { type: String, required: true, default: 'nil' },
  _subCategoryName: { type: String, required: true, default: 'nil' },
  _productName: { type: String, required: true, default: 'nil' },
  _purity: { type: Number, required: true, default: -1 },
  _hsnCode: { type: String, required: true, default: 'nil' },
  _huid: { type: String, required: true, default: 'nil' },
  _grossWeight: { type: Number, required: true, default: -1 },
  _stoneWeight: { type: Number, required: true, default: -1 },
  _netWeight: { type: Number, required: true, default: -1 },
  _tought: { type: Number, required: true, default: -1 },
  _pureWeight: { type: Number, required: true, default: -1 },
  _pureWeightHundredPercentage: { type: Number, required: true, default: -1 },
  _unitRate: { type: Number, required: true, default: -1 },
  _amount: { type: Number, required: true, default: -1 },
  _stoneAmount: { type: Number, required: true, default: -1 },
  _totalValue: { type: Number, required: true, default: -1 },
  _cgst: { type: Number, required: true, default: -1 },
  _sgst: { type: Number, required: true, default: -1 },
  _igst: { type: Number, required: true, default: -1 },
  _metalAmountGst: { type: Number, required: true, default: -1 },
  _stoneAmountGst: { type: Number, required: true, default: -1 },
  _makingChargeWeightHundredPercentage: {
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

export interface InvoiceItems {
  _id: String;
  _invoiceId: String;
  _orderId: String;
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
  _cgst: number;
  _sgst: number;
  _igst: number;
  _metalAmountGst: number;
  _stoneAmountGst: number;
  _makingChargeWeightHundredPercentage: number;
  _makingChargeAmount: number;
  _productBarcode: String;
  _productId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

InvoiceItemsSchema.index({ _orderUid: 1 });
InvoiceItemsSchema.index({ _status: 1 });
InvoiceItemsSchema.index({ _invoiceId: 1 });
InvoiceItemsSchema.index({ _orderId: 1 });
InvoiceItemsSchema.index({ _categoryName: 1 });
InvoiceItemsSchema.index({ _subCategoryName: 1 });
InvoiceItemsSchema.index({ _productName: 1 });
InvoiceItemsSchema.index({ _purity: 1 });
InvoiceItemsSchema.index({ _hsnCode: 1 });
InvoiceItemsSchema.index({ _huid: 1 });
InvoiceItemsSchema.index({ _grossWeight: 1 });
InvoiceItemsSchema.index({ _stoneWeight: 1 });
InvoiceItemsSchema.index({ _netWeight: 1 });
InvoiceItemsSchema.index({ _tought: 1 });
InvoiceItemsSchema.index({ _pureWeight: 1 });
InvoiceItemsSchema.index({ _pureWeightHundredPercentage: 1 });
InvoiceItemsSchema.index({ _unitRate: 1 });
InvoiceItemsSchema.index({ _amount: 1 });
InvoiceItemsSchema.index({ _stoneAmount: 1 });
InvoiceItemsSchema.index({ _totalValue: 1 });
InvoiceItemsSchema.index({ _cgst: 1 });
InvoiceItemsSchema.index({ _sgst: 1 });
InvoiceItemsSchema.index({ _igst: 1 });
InvoiceItemsSchema.index({ _metalAmountGst: 1 });
InvoiceItemsSchema.index({ _stoneAmountGst: 1 });
InvoiceItemsSchema.index({ _makingChargeWeightHundredPercentage: 1 });
InvoiceItemsSchema.index({ _makingChargeAmount: 1 });
InvoiceItemsSchema.index({ _productBarcode: 1 });
InvoiceItemsSchema.index({ _productId: 1 });
InvoiceItemsSchema.index({ _createdUserId: 1 });

/*
 */
