import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const ShopsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _uid: { type: String, required: true, default: 'nil' },
  _name: { type: String, required: true, default: 'nil' },
  _displayName: { type: String, required: true, default: 'nil' },
  _freezedDescription: { type: String, required: false, default: '' },
  _orderSaleRate: { type: Number, required: true, default: -1 },
  _freezedRootCause: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.ROOT_CAUSES,
    default: null,
  },
  _isFreezed: { type: Number, required: true, default: -1 },
  _stockSaleRate: { type: Number, required: true, default: -1 },
  _shopType: { type: Number, required: true, default: -1 },
  _globalGalleryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GLOBAL_GALLERIES,
    default: null,
  },
  _branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.BRANCHES,
    default: null,
  }, 
  _orderHeadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _relationshipManagerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _isSupplier: { type: Number, required: true, default: -1 },
  _panCardNumber: { type: String, required: true, default: 'nil' },
  _address: { type: String, required: true, default: 'nil' },
  _billingModeSale: { type: Number, required: true, default: -1 },
  _billingModePurchase: { type: Number, required: true, default: -1 },
  _hallmarkingMandatoryStatus: { type: Number, required: true, default: -1 },
  _rateCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.RATE_CARDS,
    default: null,
  },
  _gstNumber: { type: String, required: true, default: 'nil' },
  _cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.CITIES,
    default: null,
  },
  
  _tdsTcsStatus: { type: Number, required: true, default: -1 },
  _tdsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.TDS_MASTERS,
    default: null,
  },
  _tcsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.TCS_MASTERS,
    default: null,
  },
  _creditAmount: { type: Number, required: true, default: -1 },
  _creditDays: { type: Number, required: true, default: -1 },
  _rateBaseMasterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.RATE_BASE_MASTERS,
    default: null,
  },
  _stonePricing: { type: Number, required: true, default: -1 },
  _isTaxIgstEnabled: { type: Number, required: true, default: -1 },
  _chatPermissions: { type: Object, required: true, default: [] },
  _agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _agentCommision: { type: Number, required: true, default: -1 },
  _commisionType: { type: Number, required: true, default: -1 },
  _location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    }, 
    coordinates: {
      type: [Number], 
      default: [0, 0],
    },
  },
  _dataGuard: { type: Object, required: true, default: [] },
  _themeStore: { type:Object, required: false, default:null },
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

export interface Shops {
  _id: String;
  _cityId: String;
  _uid: String;
  _name: string;
  _displayName:string;
  _orderSaleRate: Number;
  _stockSaleRate: Number;
  _shopType: Number;
  _branchId: String;
  _orderHeadId: String;
  _themeStore:Object;
  _address: String;
  _relationshipManagerId: String;
  _isSupplier: number;
  _isFreezed: number;
  _freezedDescription: String;
  _freezedRootCause: String;
  _globalGalleryId: String;
  _panCardNumber: String;
  _billingModeSale: Number;
  _isTaxIgstEnabled:number;
  _tdsTcsStatus:Number;
  _billingModePurchase: Number;
  _hallmarkingMandatoryStatus: Number;
  _rateCardId: String;
  _gstNumber: String;
  _tdsId: String;
  _tcsId: String;
  _creditAmount: Number;
  _creditDays: Number;
  _rateBaseMasterId: String;
  _stonePricing: Number;
  _chatPermissions: Object;
  _agentId: String;
  _agentCommision: Number;
  _commisionType: number;
  _location: object;
  _dataGuard: Object;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

ShopsSchema.index({ _location: '2dsphere' });
ShopsSchema.index({ _name: 1 });
ShopsSchema.index({ _displayName: 1 });
ShopsSchema.index({ _tdsTcsStatus: 1 });
ShopsSchema.index({ _address: 1 });
ShopsSchema.index({ _themeStore: 1 });
ShopsSchema.index({ _isTaxIgstEnabled: 1 });
ShopsSchema.index({ _isFreezed: 1 });
ShopsSchema.index({ _freezedDescription: 1 });
ShopsSchema.index({ _freezedRootCause: 1 });

ShopsSchema.index({ _commisionType: 1 });
ShopsSchema.index({ _rateCardId: 1 });
ShopsSchema.index({ _agentCommision: 1 });
ShopsSchema.index({ _agentId: 1 });
ShopsSchema.index({ _chatPermissions: 1 });
ShopsSchema.index({ _stonePricing: 1 });
ShopsSchema.index({ _rateBaseMasterId: 1 });
ShopsSchema.index({ _creditDays: 1 });
ShopsSchema.index({ _creditAmount: 1 });
ShopsSchema.index({ _tcsId: 1 });
ShopsSchema.index({ _tdsId: 1 });
ShopsSchema.index({ _districtId: 1 });
ShopsSchema.index({ _stateId: 1 });
ShopsSchema.index({ _gstNumber: 1 });
ShopsSchema.index({ _hallmarkingMandatoryStatus: 1 });
ShopsSchema.index({ _billingModePurchase: 1 });
ShopsSchema.index({ _billingModeSale: 1 });
ShopsSchema.index({ _panCardNumber: 1 });
ShopsSchema.index({ _isSupplier: 1 });
ShopsSchema.index({ _relationshipManagerId: 1 });
ShopsSchema.index({ _orderHeadId: 1 });
ShopsSchema.index({ _branchId: 1 });
ShopsSchema.index({ _shopType: 1 });
ShopsSchema.index({ _stockSaleRate: 1 });
ShopsSchema.index({ _orderSaleRate: 1 });
ShopsSchema.index({ _status: 1 });
ShopsSchema.index({ _uid: 1, _id: 1 });

ShopsSchema.index({ _uid: 1 }, { unique: true });

ShopsSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ShopsSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ShopsSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ShopsSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ShopsSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('User or Uid already existing'));
  } else {
    next();
  }
}

/*
_commisionType:{
  0 - amount
  1 - percentage
}
_orderSaleRate:{
    0 - unfix
    1 - fix
}
_stockSaleRate:{
    0 - unfix
    1 - fix
}
_shopType:{
    0-buisiness
    1-Shop
}
_billingModeSale:{
    0-pure weight 
    1-net weight
    2-job work
}
_billingModePurchase:{
    0-pure weight
    1-net weight
    2-job work
}
_hallmarkingMandatoryStatus:{
0-no,
1-yes
}
_stonePricing:{
    0-automatic
    1-manual
}
_chatPermissions:{
    0-allow voice message,
    1-document uploading
}
_tdsTcsStatus:{
  0-tds
  1-tcs
}
*/
