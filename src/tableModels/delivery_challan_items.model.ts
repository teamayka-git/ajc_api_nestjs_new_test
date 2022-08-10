import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const DeliveryChallanItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _deliveryChallanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.DELIVERY_CHALLANS,
    default: null,
  },
  _orderSaleItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_ITEMS,
    default: null,
  },
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
  _grossAmount: { type: Number, required: true, default: -1 },
  _halmarkingCharge: { type: Number, required: true, default: -1 },
  _otherCharge: { type: Number, required: true, default: -1 },
  _roundOff: { type: Number, required: true, default: -1 },
  _netTotal: { type: Number, required: true, default: -1 },
  _tdsReceivable: { type: Number, required: true, default: -1 },
  _tdsPayable: { type: Number, required: true, default: -1 },
  _netReceivableAmount: { type: Number, required: true, default: -1 },
  _cgstHalmarkCharge: { type: Number, required: true, default: -1 },
  _cgstOtherCharge: { type: Number, required: true, default: -1 },
  _sgstHalmarkCharge: { type: Number, required: true, default: -1 },
  _sgstOtherCharge: { type: Number, required: true, default: -1 },
  _igstHalmarkCharge: { type: Number, required: true, default: -1 },
  _igstOtherCharge: { type: Number, required: true, default: -1 },
  _makingChargeWithtHundredPercentage: {
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

export interface DeliveryChallanItems {
  _id: String;
  _deliveryChallanId: String;
  _orderSaleItemId: String;
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
  _grossAmount: number;
  _halmarkingCharge: number;
  _otherCharge: number;
  _roundOff: number;
  _netTotal: number;
  _tdsReceivable: number;
  _tdsPayable: number;
  _netReceivableAmount: number;
  _cgstHalmarkCharge: number;
  _cgstOtherCharge: number;
  _sgstHalmarkCharge: number;
  _sgstOtherCharge: number;
  _igstHalmarkCharge: number;
  _igstOtherCharge: number;
  _makingChargeWithtHundredPercentage: number;
  _makingChargeAmount: number;
  _productBarcode: String;
  _productId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

DeliveryChallanItemsSchema.index({ _status: 1 });
DeliveryChallanItemsSchema.index({ _deliveryChallanId: 1 });
DeliveryChallanItemsSchema.index({ _orderSaleItemId: 1 });
DeliveryChallanItemsSchema.index({ _categoryName: 1 });
DeliveryChallanItemsSchema.index({ _subCategoryName: 1 });
DeliveryChallanItemsSchema.index({ _productName: 1 });
DeliveryChallanItemsSchema.index({ _purity: 1 });
DeliveryChallanItemsSchema.index({ _hsnCode: 1 });
DeliveryChallanItemsSchema.index({ _huid: 1 });
DeliveryChallanItemsSchema.index({ _grossWeight: 1 });
DeliveryChallanItemsSchema.index({ _stoneWeight: 1 });
DeliveryChallanItemsSchema.index({ _netWeight: 1 });
DeliveryChallanItemsSchema.index({ _tought: 1 });
DeliveryChallanItemsSchema.index({ _pureWeight: 1 });
DeliveryChallanItemsSchema.index({ _pureWeightHundredPercentage: 1 });
DeliveryChallanItemsSchema.index({ _unitRate: 1 });
DeliveryChallanItemsSchema.index({ _amount: 1 });
DeliveryChallanItemsSchema.index({ _stoneAmount: 1 });
DeliveryChallanItemsSchema.index({ _totalValue: 1 });
DeliveryChallanItemsSchema.index({ _cgst: 1 });
DeliveryChallanItemsSchema.index({ _sgst: 1 });
DeliveryChallanItemsSchema.index({ _igst: 1 });
DeliveryChallanItemsSchema.index({ _metalAmountGst: 1 });
DeliveryChallanItemsSchema.index({ _stoneAmountGst: 1 });
DeliveryChallanItemsSchema.index({ _grossAmount: 1 });
DeliveryChallanItemsSchema.index({ _halmarkingCharge: 1 });
DeliveryChallanItemsSchema.index({ _otherCharge: 1 });
DeliveryChallanItemsSchema.index({ _roundOff: 1 });
DeliveryChallanItemsSchema.index({ _netTotal: 1 });
DeliveryChallanItemsSchema.index({ _tdsReceivable: 1 });
DeliveryChallanItemsSchema.index({ _tdsPayable: 1 });
DeliveryChallanItemsSchema.index({ _netReceivableAmount: 1 });
DeliveryChallanItemsSchema.index({ _cgstHalmarkCharge: 1 });
DeliveryChallanItemsSchema.index({ _cgstOtherCharge: 1 });
DeliveryChallanItemsSchema.index({ _sgstHalmarkCharge: 1 });
DeliveryChallanItemsSchema.index({ _sgstOtherCharge: 1 });
DeliveryChallanItemsSchema.index({ _igstHalmarkCharge: 1 });
DeliveryChallanItemsSchema.index({ _igstOtherCharge: 1 });
DeliveryChallanItemsSchema.index({ _makingChargeWithtHundredPercentage: 1 });
DeliveryChallanItemsSchema.index({ _makingChargeAmount: 1 });
DeliveryChallanItemsSchema.index({ _productBarcode: 1 });
DeliveryChallanItemsSchema.index({ _productId: 1 });
DeliveryChallanItemsSchema.index({ _createdUserId: 1 });

/*
 */
