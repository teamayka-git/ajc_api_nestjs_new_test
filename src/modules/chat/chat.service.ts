import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { ModelNames } from 'src/common/model_names';
import { ChatPendingMessages } from 'src/tableModels/chatPendingMessager.model';
import { ChatPersonalChatMessages } from 'src/tableModels/chatPersonalChatMessages.model';
import { ChatPersonalChats, ChatPersonalChatsSchema } from 'src/tableModels/chatPersonalChats.model';

@Injectable()
export class ChatService {

    constructor(
        @InjectModel(ModelNames.CHAT_PENDING_MESSAGES) private readonly chatPendingMessagesModel: Model<ChatPendingMessages>,
        @InjectModel(ModelNames.CHAT_PERSONAL_CHATS) private readonly chatPersonalChatsModel: Model<ChatPersonalChats>,
        @InjectModel(ModelNames.CHAT_PERSONAL_CHAT_MESSAGES) private readonly chatPersonalChatMessagesModel: Model<ChatPersonalChatMessages>,
    
    ){}






public  aaa(params:Socket) {
    
}








}
