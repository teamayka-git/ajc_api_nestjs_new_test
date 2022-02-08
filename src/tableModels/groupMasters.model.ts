import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const GroupMastersSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _name: { type: String, required: true, default: "nil" },
    _rawMaterialStatus:  { type: Number, required: true, default: -1 },
    _hsnCode: { type: String, required: true, default: "nil" },
    _descriptionArray: { type: Object, required: true, default: [] },
    _meltingPurity:  { type: Number, required: true, default: -1 },
    _taxPercentage:  { type: Number, required: true, default: -1 },
    _purity:  { type: Number, required: true, default: -1 },
    _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface GroupMasters {
    _id: String;
    _name:String;
    _rawMaterialStatus:Number;
    _hsnCode:String;
    _descriptionArray:Object;
    _meltingPurity:Number;
    _taxPercentage:Number;
    _purity:Number;
    _dataGuard:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

GroupMastersSchema.index({_status: 1});
GroupMastersSchema.index({_hsnCode: 1});
GroupMastersSchema.index({_name: 1,_id:1});
GroupMastersSchema.index({_rawMaterialStatus: 1});
GroupMastersSchema.index({_meltingPurity: 1});
GroupMastersSchema.index({_taxPercentage: 1});
GroupMastersSchema.index({_purity: 1});
GroupMastersSchema.index({_name: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
GroupMastersSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GroupMastersSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GroupMastersSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GroupMastersSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GroupMastersSchema.post('updateMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
    console.log("errorGroup   "+JSON.stringify(error));
    if(error.code==11000){
        next(new Error('Name already existing'));
   }else{
    next();
   }
}


/*
*/