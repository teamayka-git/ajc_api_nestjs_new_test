import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const SubCategoriesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, required: true, default: 'nil' },
  _code: { type: Number, required: true, default: -1 },
  _description: { type: String,  default: '' },
  _categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.CATEGORIES,
    default: null,
  },
  _hmSealing: { type: Number, required: true, default: -1 },
  _defaultValueAdditionPercentage: { type: Number, required: true, default: -1 },
  _globalGalleryId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.GLOBAL_GALLERIES, default: null },
  _rewardPoint: { type: Number, required: true, default: -1 },
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

export interface SubCategories {
  _id: String;
  _name: String;
  _code: Number;
  _description: String;
  _categoryId: String;
  _hmSealing: Number;
  _defaultValueAdditionPercentage: Number;
  _rewardPoint: Number;
  _globalGalleryId:String;
  _dataGuard:Object;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

SubCategoriesSchema.index({_rewardPoint: 1});
SubCategoriesSchema.index({_status: 1});
SubCategoriesSchema.index({ _description: 1 });
SubCategoriesSchema.index({ _categoryId: 1 });
SubCategoriesSchema.index({ _code: 1,_id:1 });
SubCategoriesSchema.index({ _name: 1,_id:1 });
SubCategoriesSchema.index(
  { _code: 1 },
  { unique: true,  },
);
SubCategoriesSchema.index(
  { _name: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
SubCategoriesSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
SubCategoriesSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
SubCategoriesSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
SubCategoriesSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
SubCategoriesSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('Code or Name already existing'));
  } else {
    next();
  }
}

/*
_hmSealing:{
  0-No,
  1-Yes
}
 */
