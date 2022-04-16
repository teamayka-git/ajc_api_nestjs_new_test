import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const UserAttendanceSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _startTime: { type: Number, required: true, default: -1 },
  _stopTime: { type: Number, required: true, default: -1 },
  _status: { type: Number, required: true, default: -1 },
});

export interface UserAttendance {
  _id: String;
  _userId: String;
  _startTime: number;
  _stopTime: number;
  _status: Number;
}

UserAttendanceSchema.index({ _userId: 1 });
UserAttendanceSchema.index({ _status: 1 });
UserAttendanceSchema.index({ _startTime: 1 });
UserAttendanceSchema.index({ _stopTime: 1 });

/*
 */
