import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const BranchSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _name: { type: String, required: true, default: "nil" },
    _uid: { type: String, required: true, default: "nil" },
    _email: { type: String, required: true, default: "nil" },
    _mobile: { type: String, required: true, default: "nil" },
    _tectCode: { type: String, required: true, default: "nil" },
    _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface Branch {
    _id: String;
    _name: String;
    _uid: String;
    _email:  String;
    _mobile: String;
    _dataGuard:Object;
    _tectCode: String;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

BranchSchema.index({_uid:1});
BranchSchema.index({_name: 1});
BranchSchema.index({_email: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
BranchSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
BranchSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
BranchSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
BranchSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
BranchSchema.post('updateMany', async function(error, doc, next) {
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
_dataGuard:{
    0-edit protection
    1-disable protect
    2-delete protect
}
*/