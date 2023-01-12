import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const ChatPersonalChatsSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _personalIdOne: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _personalIdTwo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _groupUid: { type: String, required: true, default:"nil" },
  _status: { type: Number, required: true, default: -1 },
});

export interface ChatPersonalChats {
  _id: string;
  _personalIdOne: String;
  _personalIdTwo: Number;
  _groupUid: String;
  _status: Number;
}

ChatPersonalChatsSchema.index({ _personalIdOne: 1 });
ChatPersonalChatsSchema.index({ _personalIdTwo: 1 });
ChatPersonalChatsSchema.index({ _groupUid: 1,_id:1 });
ChatPersonalChatsSchema.index({ _status: 1 });
ChatPersonalChatsSchema.index(
  { _groupUid: 1 },
  { unique: true },
);
ChatPersonalChatsSchema.post('save', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ChatPersonalChatsSchema.post('insertMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ChatPersonalChatsSchema.post('updateOne', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ChatPersonalChatsSchema.post('findOneAndUpdate', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
ChatPersonalChatsSchema.post('updateMany', async function (error, doc, next) {
  schemaPostFunctionForDuplicate(error, doc, next);
});
function schemaPostFunctionForDuplicate(error, doc, next) {
  if (error.code == 11000) {
    next(new Error('UID already existing'));
  } else {
    next();
  }
}

/*


*/
