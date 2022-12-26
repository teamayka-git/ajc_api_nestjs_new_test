import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const OrderSaleChangeRequestDocumentsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _orderSaleChangeRequestId:{ type: mongoose.Schema.Types.ObjectId, ref: ModelNames.ORDER_SALE_CHANGE_REQUESTS, default: null },
    _globalGalleryId:{ type: mongoose.Schema.Types.ObjectId, ref: ModelNames.GLOBAL_GALLERIES, default: null },
    _type: { type: Number, required: true, default: -1 },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface OrderSaleChangeRequestDocuments {
    _id: String;
    _orderSaleChangeRequestId:string,
    _globalGalleryId:string,
    _type:  Number;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number; 
    _status: Number;
}

OrderSaleChangeRequestDocumentsSchema.index({_orderSaleChangeRequestId: 1});
OrderSaleChangeRequestDocumentsSchema.index({_globalGalleryId: 1});
OrderSaleChangeRequestDocumentsSchema.index({_status: 1});

/*
_type:{
  0 - image for delete
  1 - image new image
}
*/
