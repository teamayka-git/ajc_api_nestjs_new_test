import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const AccountCurrencySchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _code: { type: String, required: true, default: "nil" },
    _name: { type: String, required: true, default: "nil" },
    _exchangeRate: { type: Number, required: true, default: 1 },
    _symbol: { type: String, required: true, default: "nil" },
    _subUnit: { type: String, required: true, default: "nil" },
    _decLength: { type: Number, required: true, default: 2 },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface AccountCurrency {
    _id: String;
    _code: String;
    _name: String;
    _exchangeRate: Number;
    _symbol: String;
    _subUnit: String;
    _decLength: Number;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

AccountCurrencySchema.index({_status: 1});
AccountCurrencySchema.index({_code: 1});
AccountCurrencySchema.index({_name: 1,_id:1});
AccountCurrencySchema.index({_name: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
AccountCurrencySchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountCurrencySchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountCurrencySchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountCurrencySchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountCurrencySchema.post('updateMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
    if(error.code==11000){
        next(new Error('Name already existing'));
   }else{
    next();
   }
}


/*
*/