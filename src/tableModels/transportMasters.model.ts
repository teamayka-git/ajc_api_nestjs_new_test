import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const TransportMastersSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _name: { type: String, required: true, default: "nil" },
    _type:  { type: Number, required: true, default: -1 },
    _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface TransportMasters {
    _id: String;
    _name: String;
    _type: Number;
    _dataGuard:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

TransportMastersSchema.index({_status: 1});
TransportMastersSchema.index({_name: 1});
TransportMastersSchema.index({_name: 1});
TransportMastersSchema.index({_name: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
TransportMastersSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
TransportMastersSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
TransportMastersSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
TransportMastersSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
TransportMastersSchema.post('updateMany', async function(error, doc, next) {
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
_type:{
    0-Courier
    1-By Hand
}
*/