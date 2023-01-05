import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const StorePromotionsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _type: { type: Number, required: true, default: -1 },
  _priority: { type: Number, required: true, default: -1 },
  _group: { type: Number, required: true, default: -1 },
  _globalGalleryMobileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GLOBAL_GALLERIES,
    default: null,
  },
  _globalGalleryDeskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GLOBAL_GALLERIES,
    default: null,
  },
  _createdUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _createdAt: { type: Number, required: true, default: -1 },
  _status: { type: Number, required: true, default: -1 },
});

export interface StorePromotions {
  _id: String;
  _type: Number;
  _priority: Number;
  _group: Number;
  _globalGalleryMobileId: String;
  _globalGalleryDeskId: String;
  _createdAt: Number;
  _createdUserId: String;
  _status: Number;
}

StorePromotionsSchema.index({ _globalGalleryMobileId: 1 });
StorePromotionsSchema.index({ _globalGalleryDeskId: 1 });
StorePromotionsSchema.index({ _createdUserId: 1 });
StorePromotionsSchema.index({ _type: 1 });
StorePromotionsSchema.index({ _priority: 1 });
StorePromotionsSchema.index({ _group: 1 });
StorePromotionsSchema.index({ _status: 1 });
StorePromotionsSchema.index({ _createdAt: 1 });

/*
_type:{
    0 - main images
    1 - slide images
}
*/
