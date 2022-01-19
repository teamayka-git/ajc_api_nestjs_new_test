import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const GoldRateTimelinesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _ratePerGram: { type: Number, required: true, default: -1 },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface GoldRateTimelines {
    _id: String;
    _ratePerGram:Number;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

GoldRateTimelinesSchema.index({_status: 1});
GoldRateTimelinesSchema.index({_ratePerGram: 1});
GoldRateTimelinesSchema.index({_createdAt: 1});



/*
*/