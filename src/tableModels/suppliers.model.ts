import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const SuppliersSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _name: { type: String, required: true, default: "nil" },
    _gender: { type: Number, required: true, default: -1 },
    _email: { type: String, required: true, default: "nil" },
    _password: { type: String, required: true, default: "nil" },
    _mobile: { type: String, required: true, default: "nil" },
    _uid: { type: String, required: true, default: "nil" },
    _cityId:  { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.CITIES, default: null },
    _lastLogin: { type: Number, required: true, default: -1 },
    _address: { type: String, required: true, default: "nil" },
    _globalGalleryId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.GLOBAL_GALLERIES, default: null },
    _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface Suppliers {
    _id: String;
    _name: String;
    _gender: Number;
    _email:  String;
    _password: String; 
    _cityId:String;
    _uid: String;
    _mobile:String;
    _lastLogin:Number;
    _globalGalleryId:String;
    _address:String;
    _dataGuard:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
} 


SuppliersSchema.index({_status: 1});
SuppliersSchema.index({_name: 1});
SuppliersSchema.index({_gender: 1});
SuppliersSchema.index({_mobile: 1});
SuppliersSchema.index({_uid: 1});
SuppliersSchema.index({_cityId: 1});
SuppliersSchema.index({_email: 1,_id:1});
SuppliersSchema.index({_email: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
SuppliersSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
SuppliersSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
SuppliersSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
SuppliersSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
SuppliersSchema.post('updateMany', async function(error, doc, next) {
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