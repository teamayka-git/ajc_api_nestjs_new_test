import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const ProductTempStoneLinkingsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _productTempId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PRODUCT_TEMPS,
    default: null,
  },
  _stoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.STONE,
    default: null,
  },
  _stoneColourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.COLOUR_MASTERS,
    default: null,
  },
  _stoneWeight: { type: Number, required: true, default: -1 },
  _stoneAmount: { type: Number, required: true, default: -1 },
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

export interface ProductTempStoneLinkings {
  _id: String;
  _productTempId: String;
  _stoneId: String;
  _stoneColourId: string;
  _stoneWeight: Number;
  _stoneAmount: Number;
  _quantity: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

ProductTempStoneLinkingsSchema.index({ _stoneAmount: 1 });
ProductTempStoneLinkingsSchema.index({ _quantity: 1 });
ProductTempStoneLinkingsSchema.index({ _stoneWeight: 1 });
ProductTempStoneLinkingsSchema.index({ _stoneColourId: 1 });
ProductTempStoneLinkingsSchema.index({ _productId: 1 });
ProductTempStoneLinkingsSchema.index({ _stoneId: 1 });
ProductTempStoneLinkingsSchema.index({ _status: 1 });

/*
 */
