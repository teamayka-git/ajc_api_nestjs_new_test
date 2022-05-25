import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';


export const ProductsDocumentsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _productId:{ type: mongoose.Schema.Types.ObjectId, ref: ModelNames.PRODUCTS, default: null },
    _globalGalleryId:{ type: mongoose.Schema.Types.ObjectId, ref: ModelNames.GLOBAL_GALLERIES, default: null },
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});
 
export interface ProductsDocuments {
    _id: String;
    _productId:string,
    _globalGalleryId:string,
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
}

ProductsDocumentsSchema.index({_productId: 1});
ProductsDocumentsSchema.index({_globalGalleryId: 1});
ProductsDocumentsSchema.index({_status: 1});


