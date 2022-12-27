import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const ProductTempsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, required: true, default: 'nil' },
  _designUid: { type: String, required: false, default: '' },
  _factoryTransferItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.FACTORY_STOCK_TRANSFER_ITEMS,
    default: null,
  },
  _designerId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PRODUCTS,
    default: null,
  },
  _shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SHOPS,
    default: null,
  }, 
  _orderItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_ITEMS,
    default: null,
  },

  _grossWeight: { type: Number, required: true, default: -1 },
  _barcode: { type: String, required: false, default: '' },
  _categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.CATEGORIES,
    default: null,
  },
  _subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUB_CATEGORIES,
    default: null,
  },
  _groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GROUP_MASTERS,
    default: null,
  },
  _type: { type: Number, required: true, default: -1 },
  _productType: { type: Number, required: true, default: -1 },
  _purity: { type: Number, required: true, default: -1 },
  _totalStoneWeight: { type: Number, required: true, default: -1 },
  _totalStoneAmount: { type: Number, required: true, default: -1 },
  _netWeight: { type: Number, required: true, default: -1 },
  _hmSealingStatus: { type: Number, required: true, default: -1 },
  _huId: { type: Object, required: true, default: [] },
  _eCommerceStatus: { type: Number, required: true, default: -1 },
  _moldNumber: { type: Object, required: true, default: [] },
  _isStone: { type: Number, required: true, default: -1 },

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

export interface ProductTemps {
  _id: String; 
  _name: String;
  _designUid:String;
  _designerId: String;
  _shopId: String;
  _orderItemId: String;
  _factoryTransferItemId:String;
  _grossWeight: number;
  _barcode: String;
  _categoryId: String;
  _subCategoryId: String;
  _groupId: String;
  _type: Number;
  _productType: Number;
  _purity: Number;
  _hmSealingStatus: Number;
  _totalStoneWeight: Number;
  _totalStoneAmount: Number;
  _netWeight: Number;
  _huId: Object;
  _eCommerceStatus: Number;
  _moldNumber: Object;
  _isStone: Number; 
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

ProductTempsSchema.index({ _factoryTransferItemId: 1 });
ProductTempsSchema.index({ _totalStoneAmount: 1 });
ProductTempsSchema.index({ _designUid: 1 });
ProductTempsSchema.index({ _productType: 1 });
ProductTempsSchema.index({ _isStone: 1 });
ProductTempsSchema.index({ _moldNumber: 1 });
ProductTempsSchema.index({ _name: 1 });
ProductTempsSchema.index({ _designerId: 1, _id: 1 });
ProductTempsSchema.index({ _shopId: 1 });
ProductTempsSchema.index({ _orderItemId: 1 });
ProductTempsSchema.index({ _grossWeight: 1 });
ProductTempsSchema.index({ _barcode: 1 });
ProductTempsSchema.index({ _categoryId: 1 });
ProductTempsSchema.index({ _subCategoryId: 1 });
ProductTempsSchema.index({ _groupId: 1 });
ProductTempsSchema.index({ _type: 1 });
ProductTempsSchema.index({ _purity: 1 });
ProductTempsSchema.index({ _hmSealingStatus: 1 });
ProductTempsSchema.index({ _totalStoneWeight: 1 });
ProductTempsSchema.index({ _netWeight: 1 });
ProductTempsSchema.index({ _huId: 1 });
ProductTempsSchema.index({ _eCommerceStatus: 1 });
ProductTempsSchema.index({ _status: 1 });

ProductTempsSchema.index(
  { _designerId: 1 },
  { unique: true, partialFilterExpression: { _designerId: { $ne: null } } },
);
ProductTempsSchema.index(
  { _orderId: 1 },
  { unique: true, partialFilterExpression: { _orderId: { $ne: null } } },
);
ProductTempsSchema.index(
  { _designUid: 1 },
  { unique: true, partialFilterExpression: { _designUid: { $ne: "" } } },
);
ProductTempsSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ProductTempsSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ProductTempsSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ProductTempsSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ProductTempsSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('designid or orderId already existing'));
  } else {
    next();
  }
}

/*
_type:{
    0 - from order sale
    1 - from stock order
    2 - stock sale
    3 - design
}
 */
