import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';

export const UserSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _name: { type: String, required: true, default: 'nil' },
  _gender: { type: Number, required: true, default: -1 },
  _email: { type: String, required: true, default: 'nil' },
  _password: { type: String, required: true, default: 'nil' },
  _mobile: { type: String, required: true, default: 'nil' },
  _globalGalleryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GLOBAL_GALLERIES,
    default: null,
  },
  _employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.EMPLOYEES,
    default: null,
  },
  _agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.AGENTS,
    default: null,
  },
  _supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SUPPLIERS,
    default: null,
  },
  _shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.SHOPS,
    default: null,
  },
  _halmarkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.HALMARK_CENTERS,
    default: null,
  },
  _deliveryHubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.DELIVERY_HUBS,
    default: null,
  },
  _customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.CUSTOMERS,
    default: null,
  },
  _testCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.TEST_CENTER_MASTERS,
    default: null,
  },
  _fcmId: { type: String, default: '' },
  _deviceUniqueId: { type: String, default: '' },
  _permissions: { type: Object, required: true, default: [] },
  _userRole: { type: Number, required: true, default: -1 },
  _customType: { type: Number, required: true, default: -1 },
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

export interface User {
  _id: String;
  _name: String;
  _gender: Number;
  _email: String;
  _password: String;
  _mobile: String;
  _globalGalleryId: String;
  _customType: number;
  _employeeId: String;
  _agentId: String;
  _supplierId: String;
  _testCenterId:string;
  _shopId: String;
  _halmarkId: string;
  _customerId: string;
  _fcmId: String;
  _deliveryHubId: string;
  _deviceUniqueId: String;
  _permissions: Object;
  _userRole: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

UserSchema.index({ _testCenterId: 1 });
UserSchema.index({ _deliveryHubId: 1 });
UserSchema.index({ _halmarkId: 1 });
UserSchema.index({ _userRole: 1 });
UserSchema.index({ _customType: 1 });
UserSchema.index({ _status: 1 });
UserSchema.index({ _customerId: 1 });
UserSchema.index({ _employeeId: 1 });
UserSchema.index({ _shopId: 1 });
UserSchema.index({ _agentId: 1 });
UserSchema.index({ _supplierId: 1 });
UserSchema.index({ _name: 1 });
UserSchema.index({ _gender: 1 });
UserSchema.index({ _mobile: 1, _id: 1 });
UserSchema.index({ _email: 1, _id: 1 });
UserSchema.index(
  { _mobile: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
UserSchema.index(
  { _email: 1 },
  { unique: true, partialFilterExpression: { _status: { $lt: 2 } } },
);
UserSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
UserSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
UserSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
UserSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
UserSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('Email or Mobile already existing'));
  } else {
    next();
  }
}
/*
_userRole:{
    0 - super_admin
    1 - agent
    2 - supplier
    3 - employee
    4 - Shop
}

_permissions:[
    0 - SUPER ADMIN
]
_gender:{
  0-male
  1-female
  2-other
}

_customType:{
0 - nil
1 - Shop admin
2 - Shop sales man
3 - Shop casher
4 - halmark staff
5 - shop user
6 - delivery hub
7 - halmark center
8 - Shop Customer
9 - Test center user
}








old and deleted
// _type:{
//     0 - employee
//     1 - agent
//     2 - supplier
//     3 - Shop
// }
*/
