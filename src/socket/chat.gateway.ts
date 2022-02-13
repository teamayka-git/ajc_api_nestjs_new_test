import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(4002,{ cors: true })
export class ChatGateway implements OnGatewayInit,OnGatewayConnection,OnGatewayDisconnect{


// private logger:Logger =new Logger("ChatGateway");
// @WebSocketServer() wss:Server;//if emit with this then to all users message will send


afterInit(server: Server) {//when server start socket.io
  console.log("chat socket started");
}



handleDisconnect(client: Socket) {
  
  console.log("client disconnected");
}
handleConnection(client: Socket, ...args: any[]) {
  
  console.log("client connected");
}





  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): string {


    client.emit("message","KUNDI",(ack)=>{
console.log("acknowledgement");
    });


    console.log("message received   "+payload);

    return 'Hello world!';
  }
}
