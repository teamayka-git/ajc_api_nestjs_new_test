import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const AccountLedgerSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _code: { type: String, required: true, default: "nil" },
    _name: { type: String, required: true, default: "nil" },
    _underId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.ACCOUNT_SUBGROUP, required: true, default: null },
    _address: { type: String, required: false, default: "nil" },
    _phone: { type: String, required: false, default: "nil" },
    _email: { type: String, required: false, default: "nil" },
    _city: { type: String, required: false, default: "nil" },
    _state: { type: String, required: false, default: "nil" },
    _country: { type: String, required: false, default: "nil" },
    _pin: { type: String, required: false, default: "nil" },
    _remarks: { type: String, required: false, default: "nil" },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface AccountLedger {
    _id: String;
    _code: String;
    _name: String;
    _underId: String;
    _address: String;
    _phone: String;
    _email: String;
    _city: String;
    _state: String;
    _country: String;
    _pin: String;
    _remarks: String;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

AccountLedgerSchema.index({_status: 1});
AccountLedgerSchema.index({_code: 1});
AccountLedgerSchema.index({_name: 1,_id:1});
AccountLedgerSchema.index({_name: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
AccountLedgerSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountLedgerSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountLedgerSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountLedgerSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountLedgerSchema.post('updateMany', async function(error, doc, next) {
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