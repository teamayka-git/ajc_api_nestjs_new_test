import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const EmployeeSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _name: { type: String, required: true, default: "nil" },
    _gender: { type: Number, required: true, default: -1 },
    _email: { type: String, required: true, default: "nil" },
    _password: { type: String, required: true, default: "nil" },
    _mobile: { type: String,  default: "nil" },
    _uid: { type: String, required: true, default: "nil" },
    _lastLogin: { type: Number, required: true, default: -1 },
    _globalGalleryId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.GLOBAL_GALLERIES, default: null },
    _departmentId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.DEPARTMENT, default: null },
    _processMasterId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.PROCESS_MASTER, default: null },
    _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface Employee {
    _id: String;
    _name: String;
    _gender: Number;
    _email:  String;
    _password: String;
    _mobile:String;
    _uid: String;
    _departmentId: String;
    _processMasterId: String;
    _lastLogin:Number;
    _globalGalleryId:String;
    _dataGuard:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

EmployeeSchema.index({_departmentId: 1});
EmployeeSchema.index({_processMasterId: 1});
EmployeeSchema.index({_status: 1});
EmployeeSchema.index({_name: 1}); 
EmployeeSchema.index({_gender: 1});
EmployeeSchema.index({_mobile: 1,_id:1});
EmployeeSchema.index({_uid: 1,_id:1});
EmployeeSchema.index({_email: 1,_id:1});

EmployeeSchema.index({_uid: 1}, {unique: true});
EmployeeSchema.index({_mobile: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
EmployeeSchema.index({_email: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
EmployeeSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
EmployeeSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
EmployeeSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
EmployeeSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
EmployeeSchema.post('updateMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
    if(error.code==11000){
        next(new Error('Email or Mobile already existing'));
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
*/