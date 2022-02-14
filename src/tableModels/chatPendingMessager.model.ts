import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const ChatPendingMessagesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _createdUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _type: { type: Number, required: true, default: -1 },
  _deliveredSeen:  { type: Number, required: true, default: -1 },
  _personalChatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.CHAT_PERSONAL_CHATS,
    default: null,
  },
  _personalMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.CHAT_PERSONAL_CHAT_MESSAGES,
    default: null,
  },
  _status: { type: Number, required: true, default: -1 },
});

export interface ChatPendingMessages {
  _id: String;
  _userId: String;
  _createdUserId: String;
  _type: Number;
  _deliveredSeen: String;
  _personalChatId: Number;
  _personalMessageId: Object;
  _status: Number;
}

ChatPendingMessagesSchema.index({ _userId: 1 });
ChatPendingMessagesSchema.index({ _createdUserId: 1 });
ChatPendingMessagesSchema.index({ _type: 1 });
ChatPendingMessagesSchema.index({ _deliveredSeen: 1 });
ChatPendingMessagesSchema.index({ _personalChatId: 1 });
ChatPendingMessagesSchema.index({ _personalMessageId: 1 });
ChatPendingMessagesSchema.index({ _status: 1 });


/*
_type:{
0-message send
}

*/
