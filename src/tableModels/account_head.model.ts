import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const AccountHeadSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _code: { type: String, required: true, default: "nil" },
    _name: { type: String, required: true, default: "nil" },
    _crdr: { type: Number, required: true, default: 1 },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface AccountHead {
    _id: String;
    _code: String;
    _name: String;
    _crdr: Number;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

AccountHeadSchema.index({_status: 1});
AccountHeadSchema.index({_code: 1});
AccountHeadSchema.index({_name: 1,_id:1});
AccountHeadSchema.index({_name: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
AccountHeadSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountHeadSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountHeadSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountHeadSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountHeadSchema.post('updateMany', async function(error, doc, next) {
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