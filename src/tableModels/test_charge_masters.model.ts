import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const TestChargersMastersSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  
  _name: { type: String, required: true, default: 'nil' },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface TestChargersMasters {
    _id: String;
    _name: String;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

TestChargersMastersSchema.index({_status: 1});
TestChargersMastersSchema.index({_name: 1});



/*
*/