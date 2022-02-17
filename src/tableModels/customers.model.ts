import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const CustomersSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId, 
    _name: { type: String, required: true, default: "nil" }, 
    _gender: { type: Number, required: true, default: -1 },
    _email: { type: String, required: true, default: "nil" },
    _password: { type: String, required: true, default: "nil" },
    _mobile: { type: String, required: true, default: "nil" },
    _uid: { type: String, required: true, default: "nil" },
    _globalGalleryId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.GLOBAL_GALLERIES, default: null },

    _orderSaleRate: { type: Number, required: true, default: -1 },
    _stockSaleRate: { type: Number, required: true, default: -1 },
    _customerType: { type: Number, required: true, default: -1 },
    _branchId:{ type: mongoose.Schema.Types.ObjectId, ref: ModelNames.BRANCHES, default: null },
    _orderHeadId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _relationshipManagerId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _supplierId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _panCardNumber: { type: String, required: true, default: "nil" },
    _billingModeSale: { type: Number, required: true, default: -1 },
    _billingModePurchase: { type: Number, required: true, default: -1 },
    _hallmarkingMandatoryStatus: { type: Number, required: true, default: -1 },
    _rateCardId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.RATE_CARDS, default: null },
    _gstNumber: { type: String, required: true, default: "nil" },
    _stateId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.STATES, default: null },
    _districtId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.DISTRICTS, default: null },
    _tdsId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.TDS_MASTERS, default: null },
    _tcsId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.TCS_MASTERS, default: null },
    _creditAmount: { type: Number, required: true, default: -1 },
    _creditDays: { type: Number, required: true, default: -1 },
    _rateBaseMasterId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.RATE_BASE_MASTERS, default: null },
    _stonePricing: { type: Number, required: true, default: -1 },
    _chatPermissions:{ type:Object, required: true, default: [] },
    _agentId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _agentCommision: { type: Number, required: true, default: -1 },


    _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface Customers {
    _id: String;
    _name: String;
    _gender: Number;
    _email:  String;
    _password: String;
    _mobile:String;
    _cityId:String;
    _uid: String;
    _globalGalleryId:String;


    _orderSaleRate:Number;
    _stockSaleRate:Number;
    _customerType:Number;
    _branchId:String;
    _orderHeadId:String;
    _relationshipManagerId:String;
    _supplierId:String;
    _panCardNumber:String;
    _billingModeSale:Number;
    _billingModePurchase:Number;
    _hallmarkingMandatoryStatus:Number;
    _rateCardId:String;
    _gstNumber:String;
    _stateId:String;
    _districtId:String;
    _tdsId:String;
    _tcsId:String;
    _creditAmount:Number;
    _creditDays:Number;
    _rateBaseMasterId:String;
    _stonePricing:Number;
    _chatPermissions:Object;
    _agentId:String;
    _agentCommision:Number;




    _dataGuard:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}









CustomersSchema.index({_rateCardId: 1});
CustomersSchema.index({_agentCommision: 1});
CustomersSchema.index({_agentId: 1});
CustomersSchema.index({_chatPermissions: 1});
CustomersSchema.index({_stonePricing: 1});
CustomersSchema.index({_rateBaseMasterId: 1});
CustomersSchema.index({_creditDays: 1});
CustomersSchema.index({_creditAmount: 1});
CustomersSchema.index({_tcsId: 1});
CustomersSchema.index({_tdsId: 1});
CustomersSchema.index({_districtId: 1});
CustomersSchema.index({_stateId: 1});
CustomersSchema.index({_gstNumber: 1});
CustomersSchema.index({_hallmarkingMandatoryStatus: 1});
CustomersSchema.index({_billingModePurchase: 1});
CustomersSchema.index({_billingModeSale: 1});
CustomersSchema.index({_panCardNumber: 1});
CustomersSchema.index({_supplierId: 1});
CustomersSchema.index({_relationshipManagerId: 1});
CustomersSchema.index({_orderHeadId: 1});
CustomersSchema.index({_branchId: 1});
CustomersSchema.index({_customerType: 1});
CustomersSchema.index({_stockSaleRate: 1});
CustomersSchema.index({_orderSaleRate: 1});
CustomersSchema.index({_status: 1});
CustomersSchema.index({_name: 1});
CustomersSchema.index({_gender: 1});
CustomersSchema.index({_mobile: 1});
CustomersSchema.index({_uid: 1});
CustomersSchema.index({_email: 1,_id:1});
CustomersSchema.index({_email: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
CustomersSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
CustomersSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
CustomersSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
CustomersSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
CustomersSchema.post('updateMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
    if(error.code==11000){
        next(new Error('Email already existing'));
   }else{
    next();
   }
}


/*
_gender:{
  0-male
  1-female
  2-other
}
_orderSaleRate:{
    0 - unfix
    1 - fix
}
_stockSaleRate:{
    0 - unfix
    1 - fix
}
_customerType:{
    0-buisiness
    1-customer
}
_billingModeSale:{
    0-pure weight
    1-net weight
    2-job work
}
_billingModePurchase:{
    0-pure weight
    1-net weight
    2-job work
}
_hallmarkingMandatoryStatus:{
0-no,
1-yes
}
_stonePricing:{
    0-automatic
    1-manual
}
_chatPermissions:{
    0-allow voice message,
    1-document uploading
}
*/