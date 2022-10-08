import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const TagMasterDocumentsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _tagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.TAG_MASTERS,
    default: null,
  },
  _globalGalleryId: {
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
  _updatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _updatedAt: { type: Number, required: true, default: -1 },
  _status: { type: Number, required: true, default: -1 },
});

export interface TagMasterDocuments {
  _id: String;
  _tagId: string;
  _globalGalleryId: string;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

TagMasterDocumentsSchema.index({ _tagId: 1 });
TagMasterDocumentsSchema.index({ _globalGalleryId: 1 });
TagMasterDocumentsSchema.index({ _status: 1 });
