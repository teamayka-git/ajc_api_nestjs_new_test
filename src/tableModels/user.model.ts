import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';



export const UserSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
    _type: { type: Number, required: true, default: -1 },
    _employeeId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.EMPLOYEES, default: null },
    _fcmId: { type: String ,default:""},
    _deviceUniqueId: { type: String ,default: ""},
    _permissions: { type: Object,required: true, default:[]},
    _createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _createdAt: { type: Number, required: true, default: -1 },
    _updatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.USER, default: null },
    _updatedAt: { type: Number, required: true, default: -1 },
    _status: { type: Number, required: true, default: -1 },
});

 
export interface User {
    _id: String;
    _type: Number;
    _employeeId: String;
    _fcmId: String;
    _deviceUniqueId: String;
    _permissions:Object;
    _createdUserId:String;
    _createdAt:  Number;
    _updatedUserId: String;
    _updatedAt:  Number;
    _status: Number;
} 

UserSchema.index({_employeeId: 1});
/*
_type:{
    0 - employee
}
_permissions:[
    0 - SUPER ADMIN
]

*/