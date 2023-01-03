import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const EmployeeStockInHandsItemSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _employeeStockInHandsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.EMPLOYEE_STOCK_IN_HANDS,
    default: null,
  },
  _deliveryStatus: { type: Number, required: true, default: -1 },
  _productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.PRODUCTS,
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

export interface EmployeeStockInHandsItem {
  _id: String;
  _employeeStockInHandsId: String;
  _deliveryStatus: Number;
  _productId: String;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

EmployeeStockInHandsItemSchema.index({ _employeeStockInHandsId: 1 });
EmployeeStockInHandsItemSchema.index({ _deliveryStatus: 1 });
EmployeeStockInHandsItemSchema.index({ _productId: 1 });
EmployeeStockInHandsItemSchema.index({ _createdUserId: 1 });
EmployeeStockInHandsItemSchema.index({ _status: 1 });

/*
_deliveryStatus:{
  -1 - pending
  1 - accept
  2 - return to ajc
}
 */
