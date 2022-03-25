import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const SubProcessMasterSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _name: { type: String, required: true, default: "nil" },
    _code:  { type: Number, required: true, default: -1 },
    _maxHours:{ type: Number, required: true, default: -1 },
    _processMasterId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.PROCESS_MASTER, default: null },
    _isAutomatic:{ type: Number, required: true, default: -1 },
    _priority: { type: Number, required: true, default: -1 },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface SubProcessMaster {
    _id: String;
    _name: String;
    _code: Number;
    _isAutomatic: Number;
    _maxHours:Number;
    _processMasterId:String;
    _priority:String;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

SubProcessMasterSchema.index({_isAutomatic: 1});
SubProcessMasterSchema.index({_status: 1});
SubProcessMasterSchema.index({_name: 1,_id:1});
SubProcessMasterSchema.index({_code: 1,_id:1});
SubProcessMasterSchema.index({_code: 1,_processMasterId:1}, {unique: true,});
SubProcessMasterSchema.index({_name: 1,_processMasterId:1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
SubProcessMasterSchema.index({_priority: 1,_processMasterId:1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
SubProcessMasterSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
SubProcessMasterSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
SubProcessMasterSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
SubProcessMasterSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
SubProcessMasterSchema.post('updateMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
    if(error.code==11000){
        next(new Error('Priority or Code or Name already existing'));
   }else{
    next();
   }
}


/*
*/