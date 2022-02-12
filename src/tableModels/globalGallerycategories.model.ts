import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const GlobalGalleryCategoriesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, required: true, default: 'nil' },
  _type: { type: Number, required: true, default: 0 },
  _globalGalleryCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GLOBAL_GALLERY_CATEGORIES,
    default: null,
  },
  _dataGuard: { type:Object, required: true, default: [] },
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

export interface GlobalGalleryCategories {
  _id: String;
  _name: String;
  _globalGalleryCategoryId:String;
  _dataGuard:Object;
  _type:number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}


GlobalGalleryCategoriesSchema.index({_globalGalleryCategoryId: 1});
GlobalGalleryCategoriesSchema.index({_type: 1});
GlobalGalleryCategoriesSchema.index({_status: 1});
GlobalGalleryCategoriesSchema.index({ _name: 1,_id:1 });
GlobalGalleryCategoriesSchema.index(
  { _name: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
GlobalGalleryCategoriesSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GlobalGalleryCategoriesSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GlobalGalleryCategoriesSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GlobalGalleryCategoriesSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
GlobalGalleryCategoriesSchema.post('updateMany', async function (error, doc, next) {
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
_type:{
  1- main category
  2-sub category
}
 */
