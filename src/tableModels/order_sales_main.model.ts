import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const OrderSalesMainSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SHOPS,
    default: null,
  },
  _deliveryType: { type: Number, required: true, default: -1 },
  _rootCause: { type: String, default: '' },
  _referenceNumber: { type: String, default: '' },
  _dueDate: { type: Number, required: true, default: -1 },
  _orderHeadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _rootCauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },
  
  _parentOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_MAIN,
    default: null,
  },
  
  _isInvoiceGenerated: { type: Number, required: true, default: -1 },
  _isProductGenerated: { type: Number, required: true, default: -1 },
  _description: { type: String, default: '' },
  _generalRemark: { type: String, default: '' },
  _isReWork: { type: Number, required: true, default: -1 },
  _type: { type: Number, required: true, default: -1 },
  _workStatus: { type: Number, required: true, default: -1 },
  _uid: { type: String, required: true, default: '' },
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

export interface OrderSalesMain {
  _id: String;//
  _shopId: string;//
  _uid: string;//
  _dueDate: number;//
  _workStatus: number;//
  _rootCauseId: String;//
  _parentOrderId:String;
  _deliveryType:number;//
  _referenceNumber: String;//
  _type: number;//
  _isReWork:number;//
  _isInvoiceGenerated:number;
  _isProductGenerated:number;
  _rootCause: String;// 
  _orderHeadId: string;//
  _description: string;//
  _generalRemark: string;//
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}


OrderSalesMainSchema.index({ _parentOrderId: 1 });
OrderSalesMainSchema.index({ _isProductGenerated: 1 });
OrderSalesMainSchema.index({ _isInvoiceGenerated: 1 });
OrderSalesMainSchema.index({ _referenceNumber: 1 });
OrderSalesMainSchema.index({ _isReWork: 1 });
OrderSalesMainSchema.index({ _type: 1 });
OrderSalesMainSchema.index({ _workStatus: 1 });
OrderSalesMainSchema.index({ _rootCause: 1 });
OrderSalesMainSchema.index({ _rootCauseId: 1 });
OrderSalesMainSchema.index({ _dueDate: 1 });
OrderSalesMainSchema.index({ _salesPerson: 1 });
OrderSalesMainSchema.index({ _description: 1 });
OrderSalesMainSchema.index({ _generalRemark: 1 });
OrderSalesMainSchema.index({ _isRhodium: 1 });
OrderSalesMainSchema.index({ _status: 1 });
OrderSalesMainSchema.index({ _uid: 1, _id: 1 });

OrderSalesMainSchema.index({ _uid: 1 }, { unique: true });
OrderSalesMainSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
OrderSalesMainSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
OrderSalesMainSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
OrderSalesMainSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
OrderSalesMainSchema.post('updateMany', async function (error, doc, next) {
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

//_productData - For order last process finish time taking data from mobile app, (like : netweight, stoneweight)


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
  20 - delivery job assigned
  21 - delivery in transit        
  24 - order declined collection pending || descrption, erorr type*(Int) ,rework status(Int)
  25 - order declined collected
  26 - order declined received
  27 - order cancelled
  28 - delivery reshedule requested(shop closed -> ajc inscan)

  29 - hub tranfer pending
  30 - hub assigned
  31 - hub tranfer intransit
  32 - hub transfer delivered
  33 - hub transfer accepted(invoice pending)
  34 - order declined inscan
  35 - Order completed 
  36 - delivered to customer, and pending for proof 
  37 - delivered to customer bypass, and pending for proof 
  38 - delivey accepted proof uploaded verification pending
  39 - delivey accepted proof rejected
  40 - order send to rework
  41 - delivery counter intransit
  
}
_type:{
  0 - order sale
  1 - stock sale
}

_deliveryType:{
  0 - bundle delivery,
  1 - get me the ready item first
}
*/
