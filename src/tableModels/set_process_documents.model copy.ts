import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const OrderSaleSetProcessDocumentsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _setProcessId:{ type: mongoose.Schema.Types.ObjectId, ref: ModelNames.ORDER_SALE_SET_PROCESSES, default: null },
    _globalGalleryId:{ type: mongoose.Schema.Types.ObjectId, ref: ModelNames.GLOBAL_GALLERIES, default: null },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface OrderSaleSetProcessDocuments {
    _id: String;
    _setProcessId:string,
    _globalGalleryId:string,
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

OrderSaleSetProcessDocumentsSchema.index({_setProcessId: 1});
OrderSaleSetProcessDocumentsSchema.index({_globalGalleryId: 1});
OrderSaleSetProcessDocumentsSchema.index({_status: 1});


