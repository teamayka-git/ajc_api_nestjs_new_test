import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const StatesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _name: { type: String, required: true, default: "nil" },
    _code:  { type: Number, required: true, default: -1 },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface States {
    _id: String;
    _name: String;
    _code: Number;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

StatesSchema.index({_name: 1});
StatesSchema.index({_code: 1});
StatesSchema.index({_code: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
StatesSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
StatesSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
StatesSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
StatesSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
StatesSchema.post('updateMany', async function(error, doc, next) {
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
*/