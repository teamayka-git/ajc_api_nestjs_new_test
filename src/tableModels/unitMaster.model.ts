import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const UnitMasterSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _name: { type: String, required: true, default: "nil" },
    _value:  { type: String, required: true, default: "nil" },
    _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface UnitMaster {
    _id: String;
    _name: String;
    _value: String;
    _dataGuard:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

UnitMasterSchema.index({_status: 1});
UnitMasterSchema.index({_name: 1});
UnitMasterSchema.index({_name: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
UnitMasterSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
UnitMasterSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
UnitMasterSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
UnitMasterSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
UnitMasterSchema.post('updateMany', async function(error, doc, next) {
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