import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const EmployeeStockInHandsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _approvedStatus: { type: Number, required: true, default: -1 },
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

export interface EmployeeStockInHands {
  _id: String;
  _userId: String;
  _approvedStatus: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

EmployeeStockInHandsSchema.index({ _userId: 1 });
EmployeeStockInHandsSchema.index({ _approvedStatus: 1 });
EmployeeStockInHandsSchema.index({ _createdUserId: 1 });
EmployeeStockInHandsSchema.index({ _status: 1 });

/*
_approvedStatus:{
  -1 - pending
  0 - rejected
  1 - approved
}
 */
