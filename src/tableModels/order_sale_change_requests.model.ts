import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderSaleChangeRequestsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _orderSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_MAIN,
    default: null,
  },
  _orderSaleItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_MAIN,
    default: null,
  },
  _rootCause: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },
  _uid: { type: String, required: true, default: 'nil' },
  _description: { type: String, required: false, default: '' },
  _type: { type: Number, required: true, default: -1 },
  _proceedStatus: { type: Number, required: true, default: -1 },
  _workStatus: { type: Number, required: true, default: -1 },
  _isMistakeWithManufactor: { type: Number, required: true, default: -1 },
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

export interface OrderSaleChangeRequests {
  _id: String;
  _orderSaleId: String;
  _orderSaleItemId: String;
  _rootCause: String;
  _uid: String;
  _description: String;
  _type: Number;
  _proceedStatus: Number;
  _isMistakeWithManufactor: Number;
  _workStatus: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

OrderSaleChangeRequestsSchema.index({ _isMistakeWithManufactor: 1 });
OrderSaleChangeRequestsSchema.index({ _orderSaleId: 1 });
OrderSaleChangeRequestsSchema.index({ _orderSaleItemId: 1 });
OrderSaleChangeRequestsSchema.index({ _rootCause: 1 });
OrderSaleChangeRequestsSchema.index({ _description: 1 });
OrderSaleChangeRequestsSchema.index({ _type: 1 });
OrderSaleChangeRequestsSchema.index({ _uid: 1, _id: 1 });
OrderSaleChangeRequestsSchema.index({ _proceedStatus: 1 });
OrderSaleChangeRequestsSchema.index({ _workStatus: 1 });
OrderSaleChangeRequestsSchema.index({ _createdUserId: 1 });
OrderSaleChangeRequestsSchema.index({ _status: 1 });
OrderSaleChangeRequestsSchema.index(
  { _uid: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
OrderSaleChangeRequestsSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
OrderSaleChangeRequestsSchema.post(
  'insertMany',
  async function (error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
  },
);
OrderSaleChangeRequestsSchema.post(
  'updateOne',
  async function (error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
  },
);
OrderSaleChangeRequestsSchema.post(
  'findOneAndUpdate',
  async function (error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
  },
);
OrderSaleChangeRequestsSchema.post(
  'updateMany',
  async function (error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
  },
);
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('UID already existing'));
  } else {
    next();
  }
}
/*
_type:{
  0 - cancel request
  1 - amendment request
}
_workStatus:{
  0 - pending
  1 - accept
  2 - reject
}
_proceedStatus:{
  -1 - nothing
  0 - cancel order if not possible
  1 - cancel order if not possible
}

 */
