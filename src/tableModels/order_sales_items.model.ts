import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderSalesItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _orderSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_MAIN,
    default: null,
  },
  _subCategoryId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUB_CATEGORIES,
    default: null,
  },
  _quantity: { type: Number, required: true, default: -1 },
  _size: { type: Number, required: true, default: -1 },
  _weight: { type: Number, required: true, default: -1 },
  _stoneColour: { type: String, required: true, default: 'nil' },
  _productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PRODUCTS,
    default: null,
  },
  _designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PRODUCTS,
    default: null,
  },
  _isMatFinish: { type: Number, required: true, default: -1 },
  _isRhodium: { type: Number, required: true, default: -1 },
  _isEnamel: { type: Number, required: true, default: -1 },
  _isDullFinish: { type: Number, required: true, default: -1 },
  _stockStatus: { type: Number, required: true, default: -1 },
  _isDeliveryRejected: { type: Number, required: true, default: -1 },
  _productData: { type: Object, required: true, default: {} },
  _uid: { type: String, required: true, default: 'nil' },
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

export interface OrderSalesItems {
  _id: String;
  _orderSaleId: string;
  _subCategoryId: string;
  _quantity: number;
  _size: number;
  _weight: number;
  _uid: string;
  _stoneColour: string;
  _productData: object;
  _productId: String;
  _designId: String;
  _stockStatus:number;
  _isRhodium: number;
  _isEnamel: number;
  _isDeliveryRejected: number;// if delivery rejected then after reject 
  _isDullFinish: number;
  _isMatFinish: number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

OrderSalesItemsSchema.index({ _isDeliveryRejected: 1 });
OrderSalesItemsSchema.index({ _isEnamel: 1 });
OrderSalesItemsSchema.index({ _isDullFinish: 1 });
OrderSalesItemsSchema.index({ _isMatFinish: 1 });
OrderSalesItemsSchema.index({ _stockStatus: 1 });
OrderSalesItemsSchema.index({ _designId: 1 });
OrderSalesItemsSchema.index({ _productId: 1 });
OrderSalesItemsSchema.index({ _subCategoryId: 1 });
OrderSalesItemsSchema.index({ _quantity: 1 });
OrderSalesItemsSchema.index({ _stoneColour: 1 });
OrderSalesItemsSchema.index({ _orderSaleId: 1 });
OrderSalesItemsSchema.index({ _isRhodium: 1 });
OrderSalesItemsSchema.index({ _status: 1 });
OrderSalesItemsSchema.index({ _uid: 1, _id: 1 });

OrderSalesItemsSchema.index({ _uid: 1 }, { unique: true });
OrderSalesItemsSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
OrderSalesItemsSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
OrderSalesItemsSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
OrderSalesItemsSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
OrderSalesItemsSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('UID already existing'));
  } else {
    next();
  }
}
/*
_stockStatus:{
0 - out of stock,
1 - in stock
}


//_productData - For order last process finish time taking data from mobile app, (like : netweight, stoneweight)

*/
