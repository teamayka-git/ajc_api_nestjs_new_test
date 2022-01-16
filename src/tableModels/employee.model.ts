import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const EmployeeSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _name: { type: String, required: true, default: "nil" },
    _gender: { type: Number, required: true, default: -1 },
    _email: { type: String, required: true, default: "nil" },
    _password: { type: String, required: true, default: "nil" },
    _uid: { type: String, required: true, default: "nil" },
    _lastLogin: { type: Number, required: true, default: -1 },
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
    _uid: String;
    _lastLogin:Number;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

EmployeeSchema.index({_email: 1});
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
        next(new Error('Email already existing'));
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