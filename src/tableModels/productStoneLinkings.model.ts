import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const ProductStoneLinkingsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _stoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _stoneWeight: { type: Number, required: true, default: -1 },
  _quantity: { type: Number, required: true, default: -1 },
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

export interface ProductStoneLinkings {
  _id: String;
  _productId: String;
  _stoneId: String;
  _stoneWeight: Number;
  _quantity: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

ProductStoneLinkingsSchema.index({ _productId: 1 });
ProductStoneLinkingsSchema.index({ _stoneId: 1 });
ProductStoneLinkingsSchema.index({ _status: 1 });

/*
 */
