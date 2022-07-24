import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const OrderSalesDocumentsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _orderSaleId:{ type: mongoose.Schema.Types.ObjectId, ref: ModelNames.ORDER_SALES_MAIN, default: null },
    _globalGalleryId:{ type: mongoose.Schema.Types.ObjectId, ref: ModelNames.GLOBAL_GALLERIES, default: null },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface OrderSalesDocuments {
    _id: String;
    _orderSaleId:string,
    _globalGalleryId:string,
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

OrderSalesDocumentsSchema.index({_orderSaleId: 1});
OrderSalesDocumentsSchema.index({_globalGalleryId: 1});
OrderSalesDocumentsSchema.index({_status: 1});


