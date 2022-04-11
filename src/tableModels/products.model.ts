import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const ProductsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, required: true, default: 'nil' },
  _designerId: { type: String, required: true, default: 'nil' },
  _customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.CUSTOMERS,
    default: null,
  },
  _orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES,
    default: null,
  },

  _grossWeight: { type: Number, required: true, default: -1 },
  _barcode: { type: String, required: true, default: 'nil' },
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
  _purity: { type: Number, required: true, default: -1 },
  _totalStoneWeight: { type: Number, required: true, default: -1 },
  _netWeight: { type: Number, required: true, default: -1 },
  _hmSealingStatus: { type: Number, required: true, default: -1 },
  _huId: { type: String, default: 'nil' },
  _eCommerceStatus: { type: Number, required: true, default: -1 },

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

export interface Products {
  _id: String;
  _name: String;
  _designerId: String;
  _customerId: String;
  _orderId: String;
  _grossWeight: number;
  _barcode: String;
  _categoryId: String;
  _subCategoryId: String;
  _groupId: String;
  _type: Number;
  _purity: Number;
  _hmSealingStatus: Number;
  _totalStoneWeight: Number;
  _netWeight: Number;
  _huId: String;
  _eCommerceStatus: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

ProductsSchema.index({ _name: 1 });
ProductsSchema.index({ _designerId: 1, _id: 1 });
ProductsSchema.index({ _customerId: 1 });
ProductsSchema.index({ _orderId: 1 });
ProductsSchema.index({ _grossWeight: 1 });
ProductsSchema.index({ _barcode: 1 });
ProductsSchema.index({ _categoryId: 1 });
ProductsSchema.index({ _subCategoryId: 1 });
ProductsSchema.index({ _groupId: 1 });
ProductsSchema.index({ _type: 1 });
ProductsSchema.index({ _purity: 1 });
ProductsSchema.index({ _hmSealingStatus: 1 });
ProductsSchema.index({ _totalStoneWeight: 1 });
ProductsSchema.index({ _netWeight: 1 });
ProductsSchema.index({ _huId: 1 });
ProductsSchema.index({ _eCommerceStatus: 1 });
ProductsSchema.index({ _status: 1 });

ProductsSchema.index(
  { _designerId: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
ProductsSchema.index(
  { _orderId: 1 },
  { unique: true, partialFilterExpression: { _orderId: { $ne: null } } },
);
ProductsSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ProductsSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ProductsSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ProductsSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ProductsSchema.post('updateMany', async function (error, doc, next) {
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
    1 - from stock sale
}
 */
