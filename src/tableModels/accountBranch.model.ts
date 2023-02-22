import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

//safeer
export const AccountBranchSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _code: { type: String, required: true, default: "nil" },
    _name: { type: String, required: true, default: "nil" },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface AccountBranch {
    _id: String;
    _code: String;
    _name: String;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

AccountBranchSchema.index({_status: 1});
AccountBranchSchema.index({_code: 1});
AccountBranchSchema.index({_name: 1,_id:1});
AccountBranchSchema.index({_name: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
AccountBranchSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountBranchSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountBranchSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountBranchSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
AccountBranchSchema.post('updateMany', async function(error, doc, next) {
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