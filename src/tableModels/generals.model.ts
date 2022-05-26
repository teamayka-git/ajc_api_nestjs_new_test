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
  _number: String;
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
    1000 - currency denominator text, 
    1001 - currency denominator symbol, 
    1002 - product floating digit weight, 
    1003 - product purity, 
    1004 - Shop credit amount limit percentage, 
    1005 - Shop credit days limit, 
    1006 - tax gold manufacturing tax rate %, 
    1007 - tax product CGST %, 
    1008 - tax product SGST %, 
    1009 - tax product IGST %, 
    1010 - tax holemarking tax %, 
    1011 - tax other charge tax %, 
    1012 - tax job work tax %, 
    1013 - order sale new order suffix, 
    1014 - order sale new order prefix, 
    1015 - order sale new order suffix status, 
    1016 - order sale new order prefix status, 
    1017 - order headname prefix
    1018 - photo min respond time
    1019 - invoice template
    1020 - Halmarking charge
    1021 - General tax

}
_type:{
    0 - tax
    1 - Shop
    2 - currency
    3 - product
    4 - order
    5 - invoice
    6 - others
}
_vlaueType:{
  0-number
  1-string
  2-json
}
*/



/*
_code -> 1019, json value {"item":[full of below]}
1 -  sn	
2 -  orderId	
3 -  cat_name	
4 -  sub_cat	
5 -  product_name	
6 -  purity(group_master)	
7 -  HSN(group_master)	
8 -  HUID	
9 -  Gross weight	
10-  Stone weight	
11-  net weight	
12-  touch	
13-  pure_weight(100%)	
14-  pure_weight(rate_base from customer table)	
15-  unit_rate	
16-  Amount	
17-  stone_amount	
18-  total value	"
19-  CGST"	
20-  SGST	
21-  IGST		
22-  Gross Amount
*/
