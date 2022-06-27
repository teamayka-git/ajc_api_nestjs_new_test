import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const TestChargePercentagesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _testChargeId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.TEST_CHARGE_MASTERS, default: null },
    _groupId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.GROUP_MASTERS, default: null },
    _percentage:  { type: Number, required: true, default: -1 },
    _dataGuard: { type:Object, required: true, default: [] },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface TestChargePercentages {
    _id: String;
    _testChargeId: String;
    _groupId: String;
    _percentage: Number;
    _dataGuard:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

TestChargePercentagesSchema.index({_testChargeId: 1});
TestChargePercentagesSchema.index({_status: 1});
TestChargePercentagesSchema.index({_percentage: 1});
TestChargePercentagesSchema.index({_name: 1});



/*
*/