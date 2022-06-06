import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const DeliveryTempSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _type:  { type: Number, required: true, default: -1 },
    _invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.INVOICES, default: null },
    _employeeId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _hubId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.DELIVERY_HUBS, default: null },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface DeliveryTemp {
    _id: String;
    _type: Number;
    _invoiceId:String;
    _employeeId:String;
    _hubId:String;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

DeliveryTempSchema.index({_status: 1});
DeliveryTempSchema.index({_type: 1});
DeliveryTempSchema.index({_invoiceId: 1});
DeliveryTempSchema.index({_employeeId: 1});
DeliveryTempSchema.index({_hubId: 1});
DeliveryTempSchema.index({_createdUserId: 1});



/*
_type:{
    0 - delivery to shop
    1 - hub transfer
}
*/