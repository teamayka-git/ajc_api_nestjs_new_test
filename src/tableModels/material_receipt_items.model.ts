import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const MterialReceiptItemsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _materialReceiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.MATERIAL_RECEIPT_HEADS,
    default: null,
  },
  _groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.GROUP_MASTERS,
    default: null,
  },
  _grossWeight: { type: Number, required: true, default: -1 },
  _stoneWeight: { type: Number, required: true, default: -1 },
  _netWeight: { type: Number, required: true, default: -1 },
  _tough: { type: Number, required: true, default: -1 },
  _pureWeightRB: { type: Number, required: true, default: -1 },
  _pureWeighthundred: { type: Number, required: true, default: -1 },
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

export interface MterialReceiptItems {
  _id: String;
  _materialReceiptId: String;
  _groupId: string;
  _grossWeight: Number;
  _stoneWeight: Number;
  _netWeight: Number;
  _tough: Number;
  _pureWeightRB: Number;
  _pureWeighthundred: Number;
  _createdUserId: String;
  _createdAt: Number;
  _updatedUserId: String;
  _updatedAt: Number;
  _status: Number;
}

MterialReceiptItemsSchema.index({ _materialReceiptId: 1 });
MterialReceiptItemsSchema.index({ _groupId: 1 });
MterialReceiptItemsSchema.index({ _grossWeight: 1 });
MterialReceiptItemsSchema.index({ _stoneWeight: 1 });
MterialReceiptItemsSchema.index({ _netWeight: 1 });
MterialReceiptItemsSchema.index({ _tough: 1 });
MterialReceiptItemsSchema.index({ _pureWeightRB: 1 });
MterialReceiptItemsSchema.index({ _pureWeighthundred: 1 });
MterialReceiptItemsSchema.index({ _createdUserId: 1 });
MterialReceiptItemsSchema.index({ _status: 1 });


/*


*/
