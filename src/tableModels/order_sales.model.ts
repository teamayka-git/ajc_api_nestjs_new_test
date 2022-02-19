import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderSalesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUB_CATEGORIES,
    default: null,
  },
  _quantity: { type: Number, required: true, default: -1 },
  _size: { type: Number, required: true, default: -1 },
  _weight: { type: Number, required: true, default: -1 },
  _stoneColour: { type: String, required: true, default: 'nil' },
  _dueDate: { type: Number, required: true, default: -1 },
  _salesPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _description: { type: String, required: true, default: 'nil' },
  _isRhodium: { type: Number, required: true, default: -1 },
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

export interface OrderSales {
  _id: String;
  _subCategoryId: string;
  _quantity: number;
  _size: number;
  _weight: number;
  _stoneColour: string;
  _dueDate: number;
  _salesPersonId: string;
  _description: string;
  _isRhodium: number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

OrderSalesSchema.index({ _subCategoryId: 1 });
OrderSalesSchema.index({ _quantity: 1 });
OrderSalesSchema.index({ _stoneColour: 1 });
OrderSalesSchema.index({ _dueDate: 1 });
OrderSalesSchema.index({ _salesPerson: 1 });
OrderSalesSchema.index({ _description: 1 });
OrderSalesSchema.index({ _isRhodium: 1 });
OrderSalesSchema.index({ _status: 1 });
