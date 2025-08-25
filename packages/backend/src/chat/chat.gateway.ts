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
import { RoomService } from './room.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private roomService: RoomService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const user = client.data.user;
    const roomId = client.data.roomId;

    if (user && roomId) {
      client.to(roomId).emit('user:left', {
        userId: user.id,
        userName: user.name,
        message: `${user.name} left the chat`,
      });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @MessageBody() data: { roomSlug: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Attempting to join room:', data.roomSlug);

    const user = client.handshake.auth.user;
    if (!user) {
      console.log('User not authenticated');
      client.emit('error', 'User not authenticated');
      return;
    }

    try {
      const room = await this.roomService.getRoomBySlug(data.roomSlug);

      await client.join(room.id);
      client.data.user = user;
      client.data.roomId = room.id;

      client.to(room.id).emit('user:joined', {
        userId: user.id,
        userName: user.name,
        message: `${user.name} joined the chat`,
      });

      const messages = await this.chatService.getRecentMessages(room.id, 50);
      console.log('Retrieved messages:', messages.length);

      client.emit('room:join', {
        room,
        messages,
      });
      console.log('Emitted room:join event to client');
    } catch (error) {
      console.error('Error joining room:', error);
      client.emit('error', 'Room not found');
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:send')
  async handleMessage(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.handshake.auth.user;
    const roomId = client.data.roomId;

    if (!user) {
      return { error: 'User not authenticated' };
    }

    if (!roomId) {
      return { error: 'Not in a room' };
    }

    const message = await this.chatService.createMessage({
      text: data.text,
      userId: user.id,
      userName: user.name,
      roomId: roomId,
    });

    this.server.to(roomId).emit('message:new', message);
    return message;
  }
}
