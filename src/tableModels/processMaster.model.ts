import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const ProcessMasterSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _name: { type: String, required: true, default: "nil" },
    _code:  { type: Number, required: true, default: -1 },
    _isAutomatic:{ type: Number, required: true, default: -1 },
    _maxHours:{ type: Number, required: true, default: -1 },
    _parentId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.PROCESS_MASTER, default: null },
    _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface ProcessMaster {
    _id: string;
    _name: String;
    _code: Number;
    _isAutomatic: Number;
    _maxHours: Number;
    _parentId:String;
    _dataGuard:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

ProcessMasterSchema.index({_isAutomatic: 1});
ProcessMasterSchema.index({_status: 1});
ProcessMasterSchema.index({_name: 1,_id:1});
ProcessMasterSchema.index({_code: 1,_id:1});
ProcessMasterSchema.index({_code: 1}, {unique: true,});
ProcessMasterSchema.index({_name: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
ProcessMasterSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
ProcessMasterSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
ProcessMasterSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
ProcessMasterSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
ProcessMasterSchema.post('updateMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
    if(error.code==11000){
        next(new Error('Code or Name already existing'));
   }else{
    next();
   }
}


/*
_code:{
    1000-Master Design
}
*/