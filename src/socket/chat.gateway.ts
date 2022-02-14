import { Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { ModelNames } from 'src/common/model_names';
import { SocketChatEvents } from 'src/common/SocketChatEvents';
import { GlobalConfig } from 'src/config/global_config';
import * as mongoose from 'mongoose';
import { ChatPendingMessages } from 'src/tableModels/chatPendingMessager.model';
import { ChatPersonalChatMessages } from 'src/tableModels/chatPersonalChatMessages.model';
import { ChatPersonalChats } from 'src/tableModels/chatPersonalChats.model';
import { User } from 'src/tableModels/user.model';

import { IndexUtils } from '../utils/IndexUtils';

@WebSocketGateway(GlobalConfig().PORT_CHAT_SOCKET, { cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @InjectModel(ModelNames.CHAT_PENDING_MESSAGES)
    private readonly chatPendingMessagesModel: Model<ChatPendingMessages>,
    @InjectModel(ModelNames.CHAT_PERSONAL_CHATS)
    private readonly chatPersonalChatsModel: Model<ChatPersonalChats>,
    @InjectModel(ModelNames.CHAT_PERSONAL_CHAT_MESSAGES)
    private readonly chatPersonalChatMessagesModel: Model<ChatPersonalChatMessages>,
    @InjectModel(ModelNames.USER) private readonly userModel: mongoose.Model<User>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  private connectedUsers = new Array();

  // private logger:Logger =new Logger("ChatGateway");
  // @WebSocketServer() wss:Server;//if emit with this then to all users message will send

  afterInit(server: Server) {
    //when server start socket.io
    console.log('chat socket started');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('client connected   ' + JSON.stringify(args));
    // console.log("______ client connected   "+client.handshake.query.token);
    this.connectedUsers.push({
      userId: client.handshake.query.userId,
      socket: client.handshake.query.client,
      deviceId: client.handshake.query.deviceId,
      appType: client.handshake.query.appType,
    });
    console.log('client connected   ' + this.connectedUsers.length);
  }
  handleDisconnect(client: Socket) {
    var indexClient = this.connectedUsers.findIndex((i) => i.socket === client);
    this.connectedUsers.splice(indexClient, 1);
    console.log('client disconnected    ' + this.connectedUsers.length);
  }

  @SubscribeMessage(SocketChatEvents.EVENT_PERSONAL_MESSAGE_SEND)
  async handleMessagePersonalMessageSend(client: Socket, payload: string) {
    var dateTime = new Date().getTime();
   
      var dataJson = JSON.parse(payload);
      var indexClient = this.connectedUsers.findIndex(
        (i) => i.socket === client,
      );

      var userId = this.connectedUsers[indexClient].userId;
      var recipientId = dataJson.data.recipientId;
      var groupUid = dataJson.data.groupUid;
      var type = dataJson.data.type;
      var value = dataJson.data.value;
      var messageUid = dataJson.data.messageUid;

      if (typeof recipientId == 'undefined' || typeof recipientId != 'string') {
        client.disconnect();
        return;
      }
      if (typeof groupUid == 'undefined' || typeof groupUid != 'string') {
        client.disconnect();
        return;
      }
      if (typeof type == 'undefined' || typeof type != 'number') {
        client.disconnect();
        return;
      }
      if (typeof value == 'undefined' || typeof value != 'object') {
        client.disconnect();
        return;
      }
      if (typeof messageUid == 'undefined' || typeof messageUid != 'string') {
        client.disconnect();
        return;
      }

      var personalChatId = '';

      //finding personal chat id

      var resultGroupUid = await this.chatPersonalChatsModel.find({
        _groupUid: groupUid,
        _status: 1,
      });
      if (resultGroupUid.length != 0) {
        personalChatId = resultGroupUid[0]._id;
      } else {
        const personalChat = new this.chatPersonalChatsModel({
          _personalIdOne: userId,
          _personalIdTwo: recipientId,
          _groupUid: groupUid,
          _status: 1,
        });
        var resultChat = await personalChat.save();
        personalChatId = resultChat._id;
      }


      client.emit(SocketChatEvents.EVENT_PERSONAL_MESSAGE_UPLOADED,"OK" ,{ "data": { personalChatId: personalChatId, groupUid: groupUid, messageUid: messageUid, recipientId: recipientId, senderId: userId } }, async (ack1) => {
        if (ack1 == "OK") {
          const transactionSession = await this.connection.startSession();
          transactionSession.startTransaction();
          try {
       

      const personalMessage = new this.chatPersonalChatMessagesModel({
        _personalChatId:personalChatId,
        _senderId:userId,
        _createdTime:dateTime,
        _messageUid:messageUid,
        _type:type,
        _value:value,
        _status:1
      });
      var resultChatpersonalMessage = await personalMessage.save({
        session: transactionSession,
      });

      const personalPendingMessage = new this.chatPersonalChatMessagesModel({
        _userId:recipientId,
        _createdUserId:userId,
        _type:0,
        _deliveredSeen:-1,
        _personalChatId:personalChatId,
        _personalMessageId:resultChatpersonalMessage._id,
        _status:1,
      });
      var resultChatPendingMessage = await personalPendingMessage.save({
        session: transactionSession,
      });



var resultSender=await this.userModel.find({_id:userId},{ _type:1,_id:1});


     var jsonString = {
        "_personalChatId": personalChatId,
        "messageId": resultChatpersonalMessage._id,
        "value": value,
        "type": type,
        "groupUid": groupUid,
        "recipientId": recipientId,
        "messageUid":messageUid,
        "sender": resultSender[0],
        "time": dateTime

    }

    var onlineUsers=new IndexUtils().multipleIndex(this.connectedUsers,recipientId);

for(var i=0;i<onlineUsers.length;i++){


  var onlineSocket = this.connectedUsers[onlineUsers[i]].socket;

  onlineSocket.emit(SocketChatEvents.EVENT_PERSONAL_MESSAGE_RECEIVED, resultChatPendingMessage._id, {
    data: {
        list: [jsonString],
        isWantToShowNotification: true
    }
}, (ack) => {

    // TableChatPendingData.updateOne({ _id: ack }, { $set: { "_status": 0 } }).then(result => {
    // }).catch(error => {
    // });
})
}


await transactionSession.commitTransaction();
await transactionSession.endSession();
} catch (error) {
await transactionSession.abortTransaction();
await transactionSession.endSession();
console.log('Socket chat error ' + JSON.stringify(error));
}

}})


  











  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): string {
    client.emit('message', 'KUNDI', (ack) => {
      console.log('acknowledgement');
    });
    // const globalGallery = new this.chatPersonalChatsModel({
    // _personalIdOne:null,
    // _personalIdTwo:null,
    // _groupUid:"aaa",
    // _status: 1,
    // });
    // var resultGlobalGallery=   globalGallery.save({
    // });

    console.log('message received   ' + payload);

    return 'Hello world!';
  }
}
