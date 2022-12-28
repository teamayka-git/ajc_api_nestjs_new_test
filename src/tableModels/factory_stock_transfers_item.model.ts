import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const FactoryStockTransferItemSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _factoryStockTransferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.FACTORY_STOCK_TRANSFERS,
    default: null,
  },
  _description: { type: String, required: false, default: '' },
  _reminingGrossWeight: { type: Number, required: true, default: -1 },
  _grossWeight: { type: Number, required: true, default: -1 },
  _stoneWeight: { type: Number, required: true, default: -1 },
  _netWeight: { type: Number, required: true, default: -1 },
  _purity: { type: Number, required: true, default: -1 },
  _weight_hundred_percentage: { type: Number, required: true, default: -1 },
  _groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GROUP_MASTERS,
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

export interface FactoryStockTransferItem {
  _id: String;
  _factoryStockTransferId: String;
  _grossWeight: Number;
  _stoneWeight: Number;
  _netWeight: Number;
  _purity: Number;
  _reminingGrossWeight:Number;
  _weight_hundred_percentage: Number;
  _description: String;
  _groupId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

FactoryStockTransferItemSchema.index({ _reminingGrossWeight: 1 });
FactoryStockTransferItemSchema.index({ _factoryStockTransferId: 1 });
FactoryStockTransferItemSchema.index({ _grossWeight: 1 });
FactoryStockTransferItemSchema.index({ _stoneWeight: 1 });
FactoryStockTransferItemSchema.index({ _netWeight: 1 });
FactoryStockTransferItemSchema.index({ _purity: 1 });
FactoryStockTransferItemSchema.index({ _weight_hundred_percentage: 1 });
FactoryStockTransferItemSchema.index({ _groupId: 1 });
FactoryStockTransferItemSchema.index({ _description: 1 });
FactoryStockTransferItemSchema.index({ _purity: 1 });
FactoryStockTransferItemSchema.index({ _createdUserId: 1 });
FactoryStockTransferItemSchema.index({ _status: 1 });

/*
 */
