import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const GeneralsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _code:  { type: Number, required: true, default: -1 },
    _string: { type: String, required: true, default: "nil" },
    _number: { type: Number, required: true, default: -1 },
    _json: { type: Object, required: true, default: {} },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface Generals {
    _id: String;
    _code: Number;
    _string: String;
    _number: String;
    _json: Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

GeneralsSchema.index({_name: 1});
GeneralsSchema.index({_code: 1});
GeneralsSchema.index({_code: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
GeneralsSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GeneralsSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GeneralsSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GeneralsSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GeneralsSchema.post('updateMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
    if(error.code==11000){
        next(new Error('Code already existing'));
   }else{
    next();
   }
}


/*
*/