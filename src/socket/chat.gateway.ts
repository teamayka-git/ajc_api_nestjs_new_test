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
import { ChatDocumentCreateDto } from 'src/app.dto';
import { UploadedFileDirectoryPath } from 'src/common/uploaded_file_directory_path';
import { StringUtils } from 'src/utils/string_utils';
import { ThumbnailUtils } from 'src/utils/ThumbnailUtils';

@WebSocketGateway(4001, { cors: true }) //todo add port from env file
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
    console.log('chat socket started');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('client connected   ' + JSON.stringify(args));
    // console.log("______ client connected   "+client.handshake.query.token);
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
  }
  handleDisconnect(client: Socket) {
    var indexClient = this.connectedUsers.findIndex((i) => i.socket === client);
    this.connectedUsers.splice(indexClient, 1);
    console.log('client disconnected    ' + this.connectedUsers.length);
  }

  @SubscribeMessage(SocketChatEvents.EVENT_PERSONAL_MESSAGE_SEND)
  async handleMessagePersonalMessageSend(client: Socket, payload: Object) {
    console.log('Message uploaded 1');
    var dateTime = new Date().getTime();

    const dataJson = payload;

    var indexClient = this.connectedUsers.findIndex((i) => i.socket === client);

    var userId = dataJson['userId'];
    var recipientId = dataJson['recipientId'];
    var groupUid = dataJson['groupUid'];
    var value = dataJson['value'];
    var messageUid = dataJson['messageUid'];

    if (typeof recipientId == 'undefined' || typeof recipientId != 'string') {
      client.disconnect();
      console.log('111');
      return;
    }
    if (typeof groupUid == 'undefined' || typeof groupUid != 'string') {
      client.disconnect();
      console.log('222');
      return;
    }
    if (typeof value == 'undefined' || typeof value != 'object') {
      client.disconnect();
      console.log('333');
      return;
    }
    if (typeof messageUid == 'undefined' || typeof messageUid != 'string') {
      client.disconnect();
      console.log('444');
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
    console.log('Message uploaded 2');
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
          console.log('Message uploaded 31');
          const transactionSession = await this.connection.startSession();
          transactionSession.startTransaction();
          try {
            const personalMessage = new this.chatPersonalChatMessagesModel({
              _personalChatId: personalChatId,
              _senderId: userId,
              _createdTime: dateTime,
              _messageUid: messageUid,
              _type: 0,
              _value: value,
              _status: 1,
            });
            var resultChatpersonalMessage = await personalMessage.save({
              session: transactionSession,
            });

            const personalPendingMessage =
              new this.chatPersonalChatMessagesModel({
                _userId: recipientId,
                _createdUserId: userId,
                _type: 0,
                _deliveredSeen: -1,
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
                $project: {
                  _type: 1,
                  _employeeId: 1,
                  _agentId: 1,
                  _supplierId: 1,
                  _customerId: 1,
                },
              },
              {
                $lookup: {
                  from: ModelNames.EMPLOYEES,
                  let: { employeeId: '$_employeeId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$employeeId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'employeeDetails',
                },
              },
              {
                $unwind: {
                  path: '$employeeDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.AGENTS,
                  let: { agentId: '$_agentId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$agentId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'agentDetails',
                },
              },
              {
                $unwind: {
                  path: '$agentDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.SUPPLIERS,
                  let: { suppliersId: '$_supplierId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$suppliersId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'supplierDetails',
                },
              },
              {
                $unwind: {
                  path: '$supplierDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.CUSTOMERS,
                  let: { customerId: '$_customerId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$customerId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'customerDetails',
                },
              },
              {
                $unwind: {
                  path: '$customerDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ]);

            var jsonString = {
              _personalChatId: personalChatId,
              messageId: resultChatpersonalMessage._id,
              value: value,
              type: 0,
              groupUid: groupUid,
              recipientId: recipientId,
              messageUid: messageUid,
              sender: resultSender[0],
              time: dateTime,
            };
            console.log('Message uploaded 4');
            var onlineUsers = new IndexUtils().multipleIndexChat(
              this.connectedUsers,
              recipientId,
            );

            console.log('onlineUsers   ' + JSON.stringify(onlineUsers));

            console.log('all users   ' + this.connectedUsers.length);
            console.log('receipient id   ' + recipientId);
            console.log('sender id   ' + userId);
            console.log('jsonString    ' + JSON.stringify(jsonString));

            for (var i = 0; i < this.connectedUsers.length; i++) {
              console.log('User ids ' + this.connectedUsers[i].userId);
            }

            for (var i = 0; i < onlineUsers.length; i++) {
              console.log(
                'Sending from server   ' +
                  this.connectedUsers[onlineUsers[i]].userId,
              );
              var onlineSocket = this.connectedUsers[onlineUsers[i]].socket;

              //  console.log("this.connectedUsers[onlineUsers[i]].socket   "+JSON.stringify(this.connectedUsers[onlineUsers[i]].socket));
              onlineSocket.emit(
                SocketChatEvents.EVENT_PERSONAL_MESSAGE_RECEIVED,
                'OK',
                {
                  data: {
                    list: [jsonString],
                    isWantToShowNotification: true,
                  },
                },
                (ack) => {
                  // TableChatPendingData.updateOne({ _id: ack }, { $set: { "_status": 0 } }).then(result => {
                  // }).catch(error => {
                  // });
                },
              );
            }
            console.log('Message uploaded 6');
            await transactionSession.commitTransaction();
            await transactionSession.endSession();
          } catch (error) {
            await transactionSession.abortTransaction();
            await transactionSession.endSession();
            console.log('Socket chat error ' + JSON.stringify(error));
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
              arrayMessageIds.map((mapItem) => {
                arrayToPendingTable.push({
                  _userId: recipientId,
                  _createdUserId: userId,
                  _type: 1,
                  _deliveredSeen: -1,
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
                    // TableChatPendingData.updateOne({ _id: ack }, { $set: { "_status": 0 } }).then(result => {
                    // }).catch(error => {
                    // });
                  },
                );
              }
            }

            await transactionSession.commitTransaction();
            await transactionSession.endSession();
          } catch (error) {
            await transactionSession.abortTransaction();
            await transactionSession.endSession();
            console.log('Socket chat error ' + JSON.stringify(error));
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

    console.log('message received   ' + payload);

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
        if (dto.type == 1) {
          var filePath =
            __dirname +
            `/../../../public${file['document'][0]['path'].split('public')[1]}`;

          new ThumbnailUtils().generateThumbnail(
            filePath,
            UploadedFileDirectoryPath.CHAT_DOCUMENTS +
              new StringUtils().makeThumbImageFileName(
                file['document'][0]['filename'],
              ),
          );
        }

        dto.value['fileUrl'] = `${
          process.env.SSL == 'true' ? 'https' : 'http'
        }://${process.env.SERVER_DOMAIN}:${process.env.PORT}${
          file['document'][0]['path'].split('public')[1]
        }`;
        dto.value['fileUrlThumb'] = new StringUtils().makeThumbImageFileName(
          `${process.env.SSL == 'true' ? 'https' : 'http'}://${
            process.env.SERVER_DOMAIN
          }:${process.env.PORT}${
            file['document'][0]['path'].split('public')[1]
          }`,
        );
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
        _createdTime: dateTime,
        _messageUid: dto.messageUid,
        _type: dto.type,
        _value: dto.value,
        _status: 1,
      });
      var resultChatpersonalMessage = await personalMessage.save({
        session: transactionSession,
      });

      const personalPendingMessage = new this.chatPersonalChatMessagesModel({
        _userId: dto.recipientId,
        _createdUserId: _userId_,
        _type: 0,
        _deliveredSeen: -1,
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
          $project: {
            _type: 1,
            _employeeId: 1,
            _agentId: 1,
            _supplierId: 1,
            _customerId: 1,
          },
        },
        {
          $lookup: {
            from: ModelNames.EMPLOYEES,
            let: { employeeId: '$_employeeId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$employeeId'] } } },
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
                    _thumbUrl: 1,
                  },
                },
              },
            ],
            as: 'employeeDetails',
          },
        },
        {
          $unwind: {
            path: '$employeeDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: ModelNames.AGENTS,
            let: { agentId: '$_agentId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$agentId'] } } },
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
                    _thumbUrl: 1,
                  },
                },
              },
            ],
            as: 'agentDetails',
          },
        },
        {
          $unwind: {
            path: '$agentDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: ModelNames.SUPPLIERS,
            let: { suppliersId: '$_supplierId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$suppliersId'] } } },
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
                    _thumbUrl: 1,
                  },
                },
              },
            ],
            as: 'supplierDetails',
          },
        },
        {
          $unwind: {
            path: '$supplierDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: ModelNames.CUSTOMERS,
            let: { customerId: '$_customerId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$customerId'] } } },
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
                    _thumbUrl: 1,
                  },
                },
              },
            ],
            as: 'customerDetails',
          },
        },
        {
          $unwind: {
            path: '$customerDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      var jsonString = {
        _personalChatId: personalChatId,
        messageId: resultChatpersonalMessage._id,
        value: dto.value,
        type: 0,
        groupUid: dto.groupUid,
        recipientId: dto.recipientId,
        messageUid: dto.messageUid,
        sender: resultSender[0],
        time: dateTime,
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
            // TableChatPendingData.updateOne({ _id: ack }, { $set: { "_status": 0 } }).then(result => {
            // }).catch(error => {
            // });
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
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              {
                $project: {
                  _type: 1,
                  _employeeId: 1,
                  _agentId: 1,
                  _supplierId: 1,
                  _customerId: 1,
                },
              },
              {
                $lookup: {
                  from: ModelNames.EMPLOYEES,
                  let: { employeeId: '$_employeeId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$employeeId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'employeeDetails',
                },
              },
              {
                $unwind: {
                  path: '$employeeDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.AGENTS,
                  let: { agentId: '$_agentId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$agentId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'agentDetails',
                },
              },
              {
                $unwind: {
                  path: '$agentDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.SUPPLIERS,
                  let: { suppliersId: '$_supplierId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$suppliersId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'supplierDetails',
                },
              },
              {
                $unwind: {
                  path: '$supplierDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.CUSTOMERS,
                  let: { customerId: '$_customerId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$customerId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'customerDetails',
                },
              },
              {
                $unwind: {
                  path: '$customerDetails',
                  preserveNullAndEmptyArrays: true,
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
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              {
                $project: {
                  _type: 1,
                  _employeeId: 1,
                  _agentId: 1,
                  _supplierId: 1,
                  _customerId: 1,
                },
              },
              {
                $lookup: {
                  from: ModelNames.EMPLOYEES,
                  let: { employeeId: '$_employeeId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$employeeId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'employeeDetails',
                },
              },
              {
                $unwind: {
                  path: '$employeeDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.AGENTS,
                  let: { agentId: '$_agentId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$agentId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'agentDetails',
                },
              },
              {
                $unwind: {
                  path: '$agentDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.SUPPLIERS,
                  let: { suppliersId: '$_supplierId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$suppliersId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'supplierDetails',
                },
              },
              {
                $unwind: {
                  path: '$supplierDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: ModelNames.CUSTOMERS,
                  let: { customerId: '$_customerId' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$customerId'] } } },
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
                          _thumbUrl: 1,
                        },
                      },
                    },
                  ],
                  as: 'customerDetails',
                },
              },
              {
                $unwind: {
                  path: '$customerDetails',
                  preserveNullAndEmptyArrays: true,
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
}
