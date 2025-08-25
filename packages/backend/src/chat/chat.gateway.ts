import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const user = client.data.user;
    if (user) {
      this.server.emit('user:left', {
        userId: user.id,
        userName: user.name,
        message: `${user.name} left the chat`,
      });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:send')
  async handleMessage(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.handshake.auth.user;
    if (!user) {
      return { error: 'User not authenticated' };
    }

    client.data.user = user;

    const message = await this.chatService.createMessage({
      text: data.text,
      userId: user.id,
      userName: user.name,
    });

    this.server.emit('message:new', message);
    return message;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:list')
  async handleGetMessages(@ConnectedSocket() client: Socket) {
    const user = client.handshake.auth.user;
    if (user) {
      client.data.user = user;

      this.server.emit('user:joined', {
        userId: user.id,
        userName: user.name,
        message: `${user.name} joined the chat`,
      });
    }

    const messages = await this.chatService.getRecentMessages(50);
    return messages;
  }
}
