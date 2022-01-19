import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const TestChargersMastersStoneSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _groupId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.GROUP_MASTERS, default: null },
    _charge:  { type: Number, required: true, default: -1 },
    _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface TestChargersMasters {
    _id: String;
    _groupId: String;
    _charge: Number;
    _dataGuard:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

TestChargersMastersStoneSchema.index({_status: 1});
TestChargersMastersStoneSchema.index({_name: 1});



/*
*/