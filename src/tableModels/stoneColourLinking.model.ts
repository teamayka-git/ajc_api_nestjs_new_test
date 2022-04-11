import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const StoneColourLinkingSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _stoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.STONE,
    default: null,
  },
  _colourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.COLOUR_MASTERS,
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

export interface StoneColourLinking {
  _id: String;
  _stoneId: String;
  _colourId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

StoneColourLinkingSchema.index({ _stoneId: 1 });
StoneColourLinkingSchema.index({ _colourId: 1 });
StoneColourLinkingSchema.index({ _status: 1 });

/*
 */
