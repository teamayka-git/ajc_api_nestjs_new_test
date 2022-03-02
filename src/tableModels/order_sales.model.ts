import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderSalesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
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
  _rootCause: { type: String, required: true, default: 'nil' },
  _dueDate: { type: Number, required: true, default: -1 },
  _salesPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_ROOT_CAUSES,
    default: null,
  },
  _description: { type: String, required: true, default: 'nil' },
  _isMatFinish: { type: Number, required: true, default: -1 },
  _isRhodium: { type: Number, required: true, default: -1 },
  _workStatus: { type: Number, required: true, default: -1 },
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

export interface OrderSales {
  _id: String;
  _customerId: string;
  _subCategoryId: string;
  _quantity: number;
  _size: number;
  _weight: number;
  _uid:string;
  _stoneColour: string;
  _dueDate: number;
  _workStatus: number;
  _rootCauseId:String;
  _rootCause:String;
  _salesPersonId: string;
  _description: string;
  _isRhodium: number;
  _isMatFinish: number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

OrderSalesSchema.index({ _workStatus: 1 });
OrderSalesSchema.index({ _rootCause: 1 });
OrderSalesSchema.index({ _rootCause: 1 });
OrderSalesSchema.index({ _subCategoryId: 1 });
OrderSalesSchema.index({ _quantity: 1 });
OrderSalesSchema.index({ _stoneColour: 1 });
OrderSalesSchema.index({ _dueDate: 1 });
OrderSalesSchema.index({ _salesPerson: 1 });
OrderSalesSchema.index({ _description: 1 });
OrderSalesSchema.index({ _isRhodium: 1 });
OrderSalesSchema.index({ _status: 1 });
OrderSalesSchema.index({ _uid: 1,_id:1 });

OrderSalesSchema.index({_uid: 1}, {unique: true});
/*
_workStatus:{
  0- pending
  1- accept
  2- reject
}
*/