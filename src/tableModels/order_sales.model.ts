import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderSalesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SHOPS,
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
  _rootCause: { type: String, default: 'nil' },
  _dueDate: { type: Number, required: true, default: -1 },
  _salesPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },
  _description: { type: String, default: '' },
  _generalRemark: { type: String, default: '' },
  _isReWork: { type: Number, required: true, default: -1 },
  _isMatFinish: { type: Number, required: true, default: -1 },
  _type: { type: Number, required: true, default: -1 },
  _isRhodium: { type: Number, required: true, default: -1 },
  _workStatus: { type: Number, required: true, default: -1 },
  _productData: { type: Object, required: true, default: {} },
  _uid: { type: String, required: true, default: 'nil' },
  _isInvoiceGenerated: { type: Number, required: true, default: -1 },
  _isProductGenerated: { type: Number, required: true, default: -1 },
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
  _shopId: string;
  _subCategoryId: string;
  _quantity: number;
  _size: number;
  _weight: number;
  _uid: string;
  _stoneColour: string;
  _dueDate: number;
  _workStatus: number;
  _isInvoiceGenerated:number;
  _isProductGenerated:number;
  _productData: object;
  _rootCauseId: String;
  _type: number;
  _isReWork:number;
  _rootCause: String;
  _salesPersonId: string;
  _description: string;
  _generalRemark: string;
  _isRhodium: number;
  _isMatFinish: number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

OrderSalesSchema.index({ _isReWork: 1 });
OrderSalesSchema.index({ _isProductGenerated: 1 });
OrderSalesSchema.index({ _isInvoiceGenerated: 1 });
OrderSalesSchema.index({ _type: 1 });
OrderSalesSchema.index({ _workStatus: 1 });
OrderSalesSchema.index({ _rootCause: 1 });
OrderSalesSchema.index({ _rootCauseId: 1 });
OrderSalesSchema.index({ _subCategoryId: 1 });
OrderSalesSchema.index({ _quantity: 1 });
OrderSalesSchema.index({ _stoneColour: 1 });
OrderSalesSchema.index({ _dueDate: 1 });
OrderSalesSchema.index({ _salesPerson: 1 });
OrderSalesSchema.index({ _description: 1 });
OrderSalesSchema.index({ _generalRemark: 1 });
OrderSalesSchema.index({ _isRhodium: 1 });
OrderSalesSchema.index({ _status: 1 });
OrderSalesSchema.index({ _uid: 1, _id: 1 });

OrderSalesSchema.index({ _uid: 1 }, { unique: true });
/*
_workStatus:{ 
  0 - order pending
  1 - order accept
  2 - order reject
  3 - set process done
  4 - finished goods
  5 - product generate request
  6 - product generated 
  7 - deliverychalan generated//need to discuss
  8 - halmark issuence requested
  9 - halmark issuence bypassed
  10 - send to halmark issuence
  11 - halmarking issued
  12 - halmark request cancelled
  13 - halmark request rejected
  14 - halmark error occured
  15 - send to reissuence 
  16 - invoice pending
  17 - invoice generated
  18 - outof delivery pending
  19 - hub transfer pending
  20 - delivery job assigned
  21 - delivery in transit
  22 - delivered to customer          
  23 - delivey accepted
  24 - order declined collection pending || descrption, erorr type*(Int) ,rework status(Int)
  25 - order declined collected
  26 - order declined inscan
  27 - order cancelled
  28 - delivery reshedule requested(shop closed -> ajc inscan)

  29 - hub tranfer pending
  30 - hub assigned
  31 - hub tranfer intransit
  32 - hub transfer delivered
  33 - hub transfer accepted(invoice pending)
  
  
}
_type:{
  0 - order sale
  1 - stock sale
}
*/
