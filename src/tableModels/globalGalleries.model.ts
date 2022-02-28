import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const GlobalGalleriesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, 
    default: 'nil' },
  _globalGalleryCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GLOBAL_GALLERY_CATEGORIES,
    default: null,
  },
  _docType: { type: Number, required: true, default: -1 },
  _uid: { type: Number, required: true, default: -1 },
  _type: { type: Number, required: true, default: -1 },
  _url: { type: String, required: true, default: 'nil' },
  _thumbUrl: { type: String, required: true, default: 'nil' },
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

export interface GlobalGalleries {
  _id: String;
  _name: String;
  _globalGalleryCategoryId: String;
  _docType: Number;
  _type: Number;
  _uid: Number;
  _url: String;
  _thumbUrl: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

GlobalGalleriesSchema.index({_status: 1});
GlobalGalleriesSchema.index({ _name: 1,_id:1 });
GlobalGalleriesSchema.index({ _type: 1 ,_id:1});
GlobalGalleriesSchema.index({ _uid: 1 ,_id:1});
GlobalGalleriesSchema.index({ _docType: 1 });
GlobalGalleriesSchema.index({ _globalGalleryCategoryId: 1,_id:1 });

GlobalGalleriesSchema.index({_uid: 1}, {unique: true});

/*GlobalGalleriesSchema.index({_name: 1,_globalGalleryCategoryId:1}, {unique: true,partialFilterExpression: { _status: { $lt: 2 },_globalGalleryCategoryId:{$ne:null} }});
GlobalGalleriesSchema.post('save', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GlobalGalleriesSchema.post('insertMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GlobalGalleriesSchema.post('updateOne', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GlobalGalleriesSchema.post('findOneAndUpdate', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
GlobalGalleriesSchema.post('updateMany', async function(error, doc, next) {
    schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
    if(error.code==11000){
        next(new Error('Name already existing'));
   }else{
    next();
   }
}
*/

/*
_docType:{ 
    0 - image
    1 - video
    2 - pdf
    3 - audio
    4 - document
}
_type:{
-1-other 

    0-category
    1-sub category
    2-stone
    3-agent
    4-branch
    5-employee
    6-supplier
    7-customer
}
*/
