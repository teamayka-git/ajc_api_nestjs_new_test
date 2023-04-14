import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const UserNotificationsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _viewStatus: { type: Number, required: true, default: -1 },
  _title: { type: String, required: true, default: '' },
  _body: { type: String, required: true, default: '' },
  _orderSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ORDER_SALES_MAIN,
    default: null,
  },
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _createdAt: { type: Number, required: true, default: -1 },
  _status: { type: Number, required: true, default: -1 },
});

export interface UserNotifications {
  _id: String;
  _viewStatus: Number;
  _title: String;
  _body: String;
  _orderSaleId: String;
  _userId: String;
  _createdAt: Number;
  _status: Number;
}

UserNotificationsSchema.index({ _viewStatus: 1 });
UserNotificationsSchema.index({ _orderSaleId: 1 });
UserNotificationsSchema.index({ _userId: 1 });
UserNotificationsSchema.index({ _status: 1 });
UserNotificationsSchema.index({ _createdAt: 1 });

/*
_viewStatus:{
    0 - pending
    1 - viewed
}
*/
