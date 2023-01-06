import { HttpException, HttpStatus, Logger } from '@nestjs/common';
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
import { ChatDocumentCreateDto } from 'src/app.dto';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { StringUtils } from 'src/utils/string_utils';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';
import { S3BucketUtils } from 'src/utils/s3_bucket_utils';

@WebSocketGateway({ cors: true }) //todo add port from env file
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
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  private connectedUsers = new Array();

  @WebSocketServer()
  server: Server;

  // private logger:Logger =new Logger("ChatGateway");
  // @WebSocketServer() wss:Server;//if emit with this then to all users message will send

  afterInit(server: Server) {
    //when server start socket.io
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('client connected   ' + JSON.stringify(args));
    // console.log("______ client connected   "+client.handshake.query.token);

    var userId = client.handshake.query.userId;
    var deviceId = client.handshake.query.deviceId;
    var appType = client.handshake.query.appType;
    var lastPendingId = client.handshake.query.lastPendingId;

    if (typeof userId == 'undefined' || typeof userId != 'string') {
      client.disconnect();
      return;
    }
    if (typeof deviceId == 'undefined' || typeof deviceId != 'string') {
      client.disconnect();
      return;
    }
    if (typeof appType == 'undefined' || typeof appType != 'string') {
      client.disconnect();
      return;
    }

    if (
      typeof lastPendingId == 'undefined' ||
      typeof lastPendingId != 'string'
    ) {
      client.disconnect();
      return;
    }

    this.connectedUsers.push({
      userId: client.handshake.query.userId,
      socket: client,
      deviceId: client.handshake.query.deviceId,
      appType: client.handshake.query.appType,
    });
    console.log(
      `client connected   ${client.handshake.query.userId} ` +
        this.connectedUsers.length,
    );

    this.sendPendingMessages(client, lastPendingId, userId);
  }
  handleDisconnect(client: Socket) {
    var indexClient = this.connectedUsers.findIndex((i) => i.socket === client);
    this.connectedUsers.splice(indexClient, 1);
    console.log('client disconnected    ' + this.connectedUsers.length);
  }

  @SubscribeMessage(SocketChatEvents.EVENT_PERSONAL_MESSAGE_SEND)
  async handleMessagePersonalMessageSend(client: Socket, payload: Object) {
    var dateTime = new Date().getTime();
    console.log("___personal msg 1");
    const dataJson = payload;

    var indexClient = this.connectedUsers.findIndex((i) => i.socket === client);

    var userId = dataJson['userId'];
    var recipientId = dataJson['recipientId'];
    var groupUid = dataJson['groupUid'];
    var value = dataJson['value'];
    var messageUid = dataJson['messageUid'];
    var time = dataJson['time'];

    if (typeof recipientId == 'undefined' || typeof recipientId != 'string') {
      client.disconnect();
      return;
    }
    if (typeof groupUid == 'undefined' || typeof groupUid != 'string') {
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
    if (typeof time == 'undefined' || typeof time != 'number') {
      client.disconnect();
      return;
    }
    var personalChatId = '';
    console.log("___personal msg 2");
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
    client.emit(
      SocketChatEvents.EVENT_PERSONAL_MESSAGE_UPLOADED,
      'OK',
      {
        data: {
          personalChatId: personalChatId,
          groupUid: groupUid,
          messageUid: messageUid,
          recipientId: recipientId,
          senderId: userId,
        },
      },
      async (ack1) => {
        if (ack1 == 'OK') {
          const transactionSession = await this.connection.startSession();
          transactionSession.startTransaction();
          try {
            const personalMessage = new this.chatPersonalChatMessagesModel({
              _personalChatId: personalChatId,
              _senderId: userId,
              _createdTime: time,
              _messageUid: messageUid,
              _type: 0,
              _value: value,
              _status: 1,
            });
            var resultChatpersonalMessage = await personalMessage.save({
              session: transactionSession,
            });

            const personalPendingMessage = new this.chatPendingMessagesModel({
              _userId: recipientId,
              _createdUserId: userId,
              _type: 0,
              _deliveredSeen: 0,
              _personalChatId: personalChatId,
              _personalMessageId: resultChatpersonalMessage._id,
              _status: 1,
            });
            var resultChatPendingMessage = await personalPendingMessage.save({
              session: transactionSession,
            });

            var resultSender = await this.userModel.aggregate([
              { $match: { _id: new mongoose.Types.ObjectId(userId) } },
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$globalGalleryId'] },
                      },
                    },
                    {
                      $project: {
                        _name: 1,
                        _docType: 1,
                        _type: 1,
                        _uid: 1,
                        _url: 1,
                      },
                    },
                  ],
                  as: 'globalGalleryDetails',
                },
              },
              {
                $unwind: {
                  path: '$globalGalleryDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ]);
            console.log("___personal msg 3");
            var jsonString = {
              _personalChatId: personalChatId,
              messageId: resultChatpersonalMessage._id,
              value: value,
              type: 0,
              groupUid: groupUid,
              recipientId: recipientId,
              messageUid: messageUid,
              sender: resultSender[0],
              time: time,
            };

console.log("jsonString   "+JSON.stringify(jsonString));

            var onlineUsers = new IndexUtils().multipleIndexChat(
              this.connectedUsers,
              recipientId,
            );

            for (var i = 0; i < onlineUsers.length; i++) {
              var onlineSocket = this.connectedUsers[onlineUsers[i]].socket;
              console.log("___personal msg 4");
              onlineSocket.emit(
                SocketChatEvents.EVENT_PERSONAL_MESSAGE_RECEIVED,
                resultChatPendingMessage._id,
                {
                  data: {
                    list: [jsonString],
                    isWantToShowNotification: true,
                  },
                },
                (ack) => {console.log("___personal msg 5");
                  this.chatPendingMessagesModel
                    .updateOne({ _id: ack }, { $set: { _deliveredSeen: 1 } })
                    .then((result) => {})
                    .catch((error) => {});
                },
              );
            }
            await transactionSession.commitTransaction();
            await transactionSession.endSession();
          } catch (error) {
            await transactionSession.abortTransaction();
            await transactionSession.endSession();
          }
        }
      },
    );
  }

  @SubscribeMessage(SocketChatEvents.EVENT_PERSONAL_MESSAGE_DELETE)
  async handleMessagePersonalMessageDelete(client: Socket, payload: string) {
    var dateTime = new Date().getTime();

    var dataJson = JSON.parse(payload);
    var indexClient = this.connectedUsers.findIndex((i) => i.socket === client);

    var userId = this.connectedUsers[indexClient].userId;
    var recipientId = dataJson.data.recipientId;
    var groupUid = dataJson.data.groupUid;
    var messageUids = dataJson.data.messageUids;

    if (typeof recipientId == 'undefined' || typeof recipientId != 'string') {
      client.disconnect();
      return;
    }
    if (typeof groupUid == 'undefined' || typeof groupUid != 'string') {
      client.disconnect();
      return;
    }
    if (typeof messageUids == 'undefined' || typeof messageUids != 'string') {
      client.disconnect();
      return;
    }

    client.emit(
      SocketChatEvents.EVENT_PERSONAL_MESSAGE_UPLOADED,
      'OK',
      {
        data: {
          groupUid: groupUid,
          messageUids: messageUids,
        },
      },
      async (ack1) => {
        if (ack1 == 'OK') {
          const transactionSession = await this.connection.startSession();
          transactionSession.startTransaction();
          try {
            var resultPersonalChatMessages =
              await this.chatPersonalChatMessagesModel.find(
                { _messageUid: messageUids },
                { _id: 1 },
              );
            var arrayMessageIds = [];
            resultPersonalChatMessages.map((mapItem) => {
              arrayMessageIds.push(mapItem._id);
            });

            var resultGroupUid = await this.chatPersonalChatsModel.find({
              _groupUid: groupUid,
              _status: 1,
            });
            if (resultGroupUid.length != 0 && arrayMessageIds.length != 0) {
              await this.chatPersonalChatMessagesModel.updateMany(
                { _id: { $in: arrayMessageIds } },
                { $set: { _status: 2 } },
                { new: true, session: transactionSession },
              );
              await this.chatPendingMessagesModel.updateMany(
                {
                  _createdUserId: userId,
                  _userId: recipientId,
                  _type: 0,
                  _personalChatId: resultPersonalChatMessages[0]._id,
                  _personalMessageId: { $in: arrayMessageIds },
                },
                { $set: { _status: 2 } },
                { new: true, session: transactionSession },
              );

              var arrayToPendingTable = [];
              var arrayToPendingTableIds = [];

              arrayMessageIds.map((mapItem) => {
                var pendingTableId = new mongoose.Types.ObjectId();
                arrayToPendingTableIds.push(pendingTableId);
                arrayToPendingTable.push({
                  _userId: recipientId,
                  _createdUserId: userId,
                  _type: 1,
                  _deliveredSeen: 0,
                  _personalChatId: resultPersonalChatMessages[0]._id,
                  _personalMessageId: mapItem,
                  _status: 1,
                });
              });

              var resultToPendingTable =
                await this.chatPendingMessagesModel.insertMany(
                  arrayToPendingTable,
                  {
                    session: transactionSession,
                  },
                );

              var jsonString = {
                groupUid: groupUid,
                messageUids: messageUids,
              };

              var onlineUsers = new IndexUtils().multipleIndexChat(
                this.connectedUsers,
                recipientId,
              );

              for (var i = 0; i < onlineUsers.length; i++) {
                var onlineSocket = this.connectedUsers[onlineUsers[i]].socket;

                onlineSocket.emit(
                  SocketChatEvents.EVENT_PERSONAL_MESSAGE_DELETE_RECEIVED,
                  'OK',
                  {
                    data: jsonString,
                  },
                  (ack) => {
                    this.chatPendingMessagesModel
                      .updateOne(
                        { _id: { $in: arrayToPendingTableIds } },
                        { $set: { _deliveredSeen: 1 } },
                      )
                      .then((result) => {})
                      .catch((error) => {});
                  },
                );
              }
            }

            await transactionSession.commitTransaction();
            await transactionSession.endSession();
          } catch (error) {
            await transactionSession.abortTransaction();
            await transactionSession.endSession();
          }
        }
      },
    );
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

    return 'Hello world!';
  }

  async chatFileUpload(
    dto: ChatDocumentCreateDto,
    _userId_: string,
    file: Object,
  ) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {

      if (file.hasOwnProperty('document')) {
     

        var resultUpload = await new S3BucketUtils().uploadMyFile(
          file['document'][0],
          UploadedFileDirectoryPath.CHAT_DOCUMENTS,
        );

        if (resultUpload['status'] == 0) {
          throw new HttpException(
            'File upload error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        //         if (dto.type == 1) {

        //           var filePath =
        //             __dirname +
        //             `/../../public${file['document'][0]['path'].split('public')[1]}`;
        // console.log("___filePath   "+filePath);
        //           new ThumbnailUtils().generateThumbnail(
        //             filePath,
        //             UploadedFileDirectoryPath.CHAT_DOCUMENTS +
        //               new StringUtils().makeThumbImageFileName(
        //                 file['document'][0]['filename'],
        //               ),
        //           );

        //         }
        dto.value['fileUrl'] = resultUpload['url'];

      }
      var personalChatId = '';

      //finding personal chat id

      var resultGroupUid = await this.chatPersonalChatsModel.find({
        _groupUid: dto.groupUid,
        _status: 1,
      });
      if (resultGroupUid.length != 0) {
        personalChatId = resultGroupUid[0]._id;

      } else {
        const personalChat = new this.chatPersonalChatsModel({
          _personalIdOne: _userId_,
          _personalIdTwo: dto.recipientId,
          _groupUid: dto.groupUid,
          _status: 1,
        });
        var resultChat = await personalChat.save();

        personalChatId = resultChat._id;

      }

      const personalMessage = new this.chatPersonalChatMessagesModel({
        _personalChatId: personalChatId,
        _senderId: _userId_,
        _createdTime: dto.time,
        _messageUid: dto.messageUid,
        _type: dto.type,
        _value: dto.value,
        _status: 1,
      });
      var resultChatpersonalMessage = await personalMessage.save({
        session: transactionSession,
      });

      const personalPendingMessage = new this.chatPendingMessagesModel({
        _userId: dto.recipientId,
        _createdUserId: _userId_,
        _type: 0,
        _deliveredSeen: 0,
        _personalChatId: personalChatId,
        _personalMessageId: resultChatpersonalMessage._id,
        _status: 1,
      });
      var resultChatPendingMessage = await personalPendingMessage.save({
        session: transactionSession,
      });

      var resultSender = await this.userModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(_userId_) } },
        {
          $lookup: {
            from: ModelNames.GLOBAL_GALLERIES,
            let: { globalGalleryId: '$_globalGalleryId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$globalGalleryId'] },
                },
              },
              {
                $project: {
                  _name: 1,
                  _docType: 1,
                  _type: 1,
                  _uid: 1,
                  _url: 1,
                },
              },
            ],
            as: 'globalGalleryDetails',
          },
        },
        {
          $unwind: {
            path: '$globalGalleryDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);


      var jsonString = {
        _personalChatId: personalChatId,
        messageId: resultChatpersonalMessage._id,
        value: dto.value,
        type: dto.type,
        groupUid: dto.groupUid,
        recipientId: dto.recipientId,
        messageUid: dto.messageUid,
        sender: resultSender[0],
        time: dto.time,
      };
      var onlineUsers = new IndexUtils().multipleIndexChat(
        this.connectedUsers,
        dto.recipientId,
      );

      for (var i = 0; i < onlineUsers.length; i++) {
        var onlineSocket = this.connectedUsers[onlineUsers[i]].socket;

        onlineSocket.emit(
          SocketChatEvents.EVENT_PERSONAL_MESSAGE_RECEIVED,
          resultChatPendingMessage._id,
          {
            data: {
              list: [jsonString],
              isWantToShowNotification: true,
            },
          },
          (ack) => {
            this.chatPendingMessagesModel
              .updateOne({ _id: ack }, { $set: { _deliveredSeen: 1 } })
              .then((result) => {})
              .catch((error) => {});
          },
        );
      }

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: 'success', data: jsonString };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async chatGetUsersList(_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var result = await this.chatPersonalChatsModel.aggregate([
        {
          $match: {
            _status: 1,
            $or: [
              { _personalIdOne: new mongoose.Types.ObjectId(_userId_) },
              { _personalIdTwo: new mongoose.Types.ObjectId(_userId_) },
            ],
          },
        },
        {
          $lookup: {
            from: ModelNames.USER,
            let: { userId: '$_personalIdOne' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$userId'] },
                      { $ne: ['$_id', _userId_] },
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$globalGalleryId'] },
                      },
                    },
                    {
                      $project: {
                        _name: 1,
                        _docType: 1,
                        _type: 1,
                        _uid: 1,
                        _url: 1,
                      },
                    },
                  ],
                  as: 'globalGalleryDetails',
                },
              },
              {
                $unwind: {
                  path: '$globalGalleryDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  _name: 1,
                  _email: 1,
                  _mobile: 1,
                  _uid: 1,
                  globalGalleryDetails: {
                    _name: 1,
                    _docType: 1,
                    _type: 1,
                    _uid: 1,
                    _url: 1,
                  },
                },
              },
            ],
            as: 'userDetails',
          },
        },
        {
          $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: ModelNames.USER,
            let: { userId: '$_personalIdTwo' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$userId'] },
                      { $ne: ['$_id', _userId_] },
                    ],
                  },
                },
              },
              //              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              {
                $lookup: {
                  from: ModelNames.GLOBAL_GALLERIES,
                  let: { globalGalleryId: '$_globalGalleryId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$globalGalleryId'] },
                      },
                    },
                    {
                      $project: {
                        _name: 1,
                        _docType: 1,
                        _type: 1,
                        _uid: 1,
                        _url: 1,
                      },
                    },
                  ],
                  as: 'globalGalleryDetails',
                },
              },
              {
                $unwind: {
                  path: '$globalGalleryDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  _name: 1,
                  _email: 1,
                  _mobile: 1,
                  _uid: 1,
                  globalGalleryDetails: {
                    _name: 1,
                    _docType: 1,
                    _type: 1,
                    _uid: 1,
                    _url: 1,
                  },
                },
              },
            ],
            as: 'userDetails',
          },
        },
        {
          $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true },
        },

        {
          $lookup: {
            from: ModelNames.CHAT_PERSONAL_CHAT_MESSAGES,
            let: { personalChatMessageId: '$_id' },
            pipeline: [
              {
                $match: {
                  _status: 1,
                  $expr: {
                    $eq: ['$_personalChatId', '$$personalChatMessageId'],
                  },
                },
              },
              { $sort: { _id: -1 } },
              { $limit: 1 },
            ],
            as: 'lastMessageDetails',
          },
        },
        {
          $unwind: {
            path: '$lastMessageDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      await transactionSession.commitTransaction();
      await transactionSession.endSession();
      return { message: 'success', data: { list: result } };
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }

  async sendPendingMessages(
    client: Socket,
    lastPendingId: string,
    userId: string,
  ) {
    var arrayPendingAggregationArray = [];
    arrayPendingAggregationArray.push({ $sort: { _id: 1 } });
    if (lastPendingId != '') {
      arrayPendingAggregationArray.push({
        $match: { _id: { $gt: new mongoose.Types.ObjectId(lastPendingId) } },
      });
    }
    arrayPendingAggregationArray.push({
      $match: {
        _userId: new mongoose.Types.ObjectId(userId),
        _deliveredSeen: 0,
        _status: 1,
      },
    });
    arrayPendingAggregationArray.push(
      {
        $lookup: {
          from: ModelNames.CHAT_PERSONAL_CHATS,
          let: { personChatId: '$_personalChatId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$personChatId'] } } },
          ],
          as: 'personChatIdsDetails',
        },
      },
      {
        $unwind: {
          path: '$personChatIdsDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
    );
    arrayPendingAggregationArray.push(
      {
        $lookup: {
          from: ModelNames.CHAT_PERSONAL_CHAT_MESSAGES,
          let: { personChatMessageId: '$_personalMessageId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$personChatMessageId'] } } },
          ],
          as: 'personMessage',
        },
      },
      {
        $unwind: {
          path: '$personMessage',
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    arrayPendingAggregationArray.push(
      {
        $lookup: {
          from: ModelNames.USER,
          let: { userId: '$_createdUserId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            {
              $lookup: {
                from: ModelNames.GLOBAL_GALLERIES,
                let: { globalGalleryId: '$_globalGalleryId' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$globalGalleryId'] },
                    },
                  },
                  {
                    $project: {
                      _name: 1,
                      _docType: 1,
                      _type: 1,
                      _uid: 1,
                      _url: 1,
                    },
                  },
                ],
                as: 'globalGalleryDetails',
              },
            },
            {
              $unwind: {
                path: '$globalGalleryDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _name: 1,
                _email: 1,
                _mobile: 1,
                _uid: 1,
                globalGalleryDetails : { 
                  _name: 1,
                  _docType: 1,
                  _type: 1,
                  _uid: 1,
                  _url: 1,
                }
              },
            },
          ],
          as: 'createdUserDetails',
        },
      },
      {
        $unwind: {
          path: '$createdUserDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    var resultGroupPendingDatas = await this.chatPendingMessagesModel.aggregate(
      arrayPendingAggregationArray,
    );

    var arrayJsonDatasPersonalMessageCreated = [];
    var arrayJsonDatasPersonalMessageCreatedIds = [];
    resultGroupPendingDatas.map((mapItem) => {
      if (mapItem._type == 0) {
        arrayJsonDatasPersonalMessageCreated.push({
          _personalChatId: mapItem._personalChatId,
          messageId: mapItem._personalMessageId,
          value: mapItem.personMessage._value,
          type: 0,
          groupUid: mapItem.personChatIdsDetails._groupUid,
          recipientId: userId,
          messageUid: mapItem.personMessage._messageUid,
          sender: mapItem.createdUserDetails,
          time: mapItem.personMessage._createdTime,
        });
        arrayJsonDatasPersonalMessageCreatedIds.push(mapItem._id);
      }
    });
    if (arrayJsonDatasPersonalMessageCreated.length != 0) {
      client.emit(
        SocketChatEvents.EVENT_PERSONAL_MESSAGE_RECEIVED,
        'OK',
        {
          data: {
            list: arrayJsonDatasPersonalMessageCreated,
            isWantToShowNotification: true,
          },
        },
        async (ack) => {
      

          await this.chatPendingMessagesModel.updateMany(
            { _id: { $in: arrayJsonDatasPersonalMessageCreatedIds } },
            { $set: { _deliveredSeen: 1 } },
          );
        },
      );
    }
  }
}
