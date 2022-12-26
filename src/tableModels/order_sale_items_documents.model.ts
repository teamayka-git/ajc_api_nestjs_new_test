import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const OrderSaleItemsDocumentsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _orderSaleItemId:{ type: mongoose.Schema.Types.ObjectId, ref: ModelNames.ORDER_SALES_ITEMS, default: null },
    _globalGalleryId:{ type: mongoose.Schema.Types.ObjectId, ref: ModelNames.GLOBAL_GALLERIES, default: null },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface OrderSaleItemsDocuments {
    _id: String;
    _orderSaleItemId:string,
    _globalGalleryId:string,
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number; 
    _status: Number;
}

OrderSaleItemsDocumentsSchema.index({_orderSaleItemId: 1});
OrderSaleItemsDocumentsSchema.index({_globalGalleryId: 1});
OrderSaleItemsDocumentsSchema.index({_status: 1});


