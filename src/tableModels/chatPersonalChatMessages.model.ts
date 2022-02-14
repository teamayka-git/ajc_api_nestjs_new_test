import * as mongoose from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalConfig } from 'src/config/global_config';

export const ChatPersonalChatMessagesSchema = new mongoose.Schema({
  //  _id: mongoose.Schema.Types.ObjectId,
  _personalChatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.CHAT_PERSONAL_CHATS,
    default: null,
  },
  _senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ModelNames.USER,
    default: null,
  },
  _createdTime: { type: Number, required: true, default: -1 },
  _messageUid: { type:String, required: true, default:"nil" },
  _type: { type: Number, required: true, default: -1 },
  _value: { type:Object, required: true, default:{} },
  _status: { type: Number, required: true, default: -1 },
});

export interface ChatPersonalChatMessages {
  _id: String;
  _personalChatId: String;
  _senderId: String;
  _createdTime: Number;
  _messageUid: String;
  _type: Number;
  _value: Object;
  _status: Number;
}

ChatPersonalChatMessagesSchema.index({ _personalChatId: 1 });
ChatPersonalChatMessagesSchema.index({ _senderId: 1 });
ChatPersonalChatMessagesSchema.index({ _createdTime: 1 });
ChatPersonalChatMessagesSchema.index({ _messageUid: 1 });
ChatPersonalChatMessagesSchema.index({ _type: 1 });
ChatPersonalChatMessagesSchema.index({ _status: 1 });


/*
_type:{
0-text,
1-image,
2-video,
3-audio,
4-document
}

*/
