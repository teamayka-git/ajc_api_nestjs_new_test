import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const RateCardsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _subCategoryId:  { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.SUB_CATEGORIES, default: null },
  _percentage: { type: Number, required: true, default: -1 },
  _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface RateCards {
    _id: String;
    _subCategoryId: Number;
    _percentage: Number;
    _dataGuard:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}



RateCardsSchema.index({_subCategoryId: 1});
RateCardsSchema.index({_status: 1});



/*
*/