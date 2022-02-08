import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';



export const CountersSchema = new mongoose.Schema({
   // _id: mongoose.Schema.Types.ObjectId,
    _tableName: { type: String, required: true, default: "nil" },
    _count: { type: Number, required: true, default: -1 },
    
    _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});

export interface Counters {
    _id: String;
    _tableName: String;
    _count: number;
    _dataGuard:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}




CountersSchema.index({_status: 1});
CountersSchema.index({_tableName: 1,_id:1});
CountersSchema.index({_tableName: 1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 } }});
CountersSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
CountersSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
CountersSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
CountersSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
CountersSchema.post('updateMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
    if(error.code==11000){
        next(new Error('Table Name already existing'));
   }else{
    next();
   }
}

/*


*/