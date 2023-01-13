import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const GeneralsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, default: 'nil' },
  _code: { type: Number, required: true, default: -1 },
  _string: { type: String, default: 'nil' },
  _number: { type: Number, required: true, default: -1 },
  _json: { type: Object, required: true, default: {} },
  _type: { type: Number, required: true, default: -1 },
  _vlaueType: { type: Number, required: true, default: -1 },
  _dataGuard: { type: Object, required: true, default: [] },
  _createdUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _createdAt: { type: Number, required: true, default: -1 },
  _updatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _updatedAt: { type: Number, required: true, default: -1 },
  _status: { type: Number, required: true, default: -1 },
});

export interface Generals {
  _id: String;
  _name: String;
  _code: Number;
  _string: String;
  _number: Number;
  _json: Object;
  _type: Number;
  _vlaueType: Number;
  _dataGuard: Object;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

GeneralsSchema.index({ _name: 1 });
GeneralsSchema.index({ _status: 1 });
GeneralsSchema.index({ _name: 1 });
GeneralsSchema.index({ _code: 1, _id: 1 });
GeneralsSchema.index({ _code: 1 }, { unique: true });
GeneralsSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GeneralsSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GeneralsSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GeneralsSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GeneralsSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('Code already existing'));
  } else {
    next();
  }
}

/*
_code:{
    100  - Mobile Employee major update application Build number
    101  - Mobile Customer major update application Build number
    102  - Mobile Employee minor update application Build number
    103  - Mobile Customer minor update application Build number
    1000 - currency denominator text, 
    1001 - currency denominator symbol, 
    1002 - product floating digit weight, 
    1003 - product purity, 
    1004 - Shop credit amount limit percentage, 
    1005 - Shop credit days limit, 
    1006 - tax gold manufacturing tax rate %, 
    1009 - tax product IGST %, 
    1010 - tax holemarking tax %, 
    1011 - tax other charge tax %, 
    1012 - tax job work tax %, 
    1013 - order sale new order suffix, 
    1014 - order sale new order prefix, 
    1015 - order sale new order suffix status, 
    1016 - order sale new order prefix status, 
    deleted (1017 - order headname prefix)
    1018 - photo min respond time
    1019 - invoice template
    1020 - Halmarking charge
    1021 - General tax
    1022 - Order maximum due date
    1023 - Invoice prefix
    1024 - order head auto assign
    1025 - allowed litit for purchase adjustment
    1026 - Worker dashboard backlog in hours
    1027 - Worker dashboard high risk due date in days
    1028 - maximum amendment count

} 
_type:{
    0 - tax
    1 - Shop
    2 - currency
    3 - product
    4 - order
    5 - invoice
    6 - others
    7 - Software settings
    8 - Purchase
    9 - Dashboard
}
_vlaueType:{
  0-number
  1-string
  2-json
}
*/

