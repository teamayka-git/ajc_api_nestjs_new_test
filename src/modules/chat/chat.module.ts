import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ModelNames } from 'src/common/model_names';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatPendingMessagesSchema } from 'src/tableModels/chatPendingMessager.model';
import { ChatPersonalChatsSchema } from 'src/tableModels/chatPersonalChats.model';
import { ChatPersonalChatMessagesSchema } from 'src/tableModels/chatPersonalChatMessages.model';

@Module({
  imports:[MongooseModule.forFeature([
    {name:ModelNames.CHAT_PENDING_MESSAGES,schema:ChatPendingMessagesSchema},
    {name:ModelNames.CHAT_PERSONAL_CHATS,schema:ChatPersonalChatsSchema},
    {name:ModelNames.CHAT_PERSONAL_CHAT_MESSAGES,schema:ChatPersonalChatMessagesSchema},


  ])],

  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
