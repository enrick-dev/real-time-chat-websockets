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
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { RoomService } from './room.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`, 'ChatGateway.handleConnection');
    this.logger.debug(`Client handshake: ${JSON.stringify(client.handshake)}`, 'ChatGateway.handleConnection');
  }

  handleDisconnect(client: Socket) {
    const roomId = client.data.roomId;
    this.logger.log(`Client disconnected: ${client.id}`, 'ChatGateway.handleDisconnect');
    
    if (roomId) {
      this.logger.log(`Client left room: ${roomId}`, 'ChatGateway.handleDisconnect');
      this.server.to(roomId).emit('user:left', {
        userId: client.handshake.auth.user?.id,
        userName: client.handshake.auth.user?.name,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @MessageBody() data: { roomSlug: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.handshake.auth.user;
    this.logger.log(`User ${user.email} attempting to join room: ${data.roomSlug}`, 'ChatGateway.handleJoinRoom');

    try {
      const room = await this.roomService.getRoomBySlug(data.roomSlug);
      
      if (!room) {
        this.logger.warn(`Room not found: ${data.roomSlug}`, 'ChatGateway.handleJoinRoom');
        client.emit('error', 'Room not found');
        return;
      }

      client.join(room.id);
      client.data.roomId = room.id;
      
      this.logger.log(`User ${user.email} joined room: ${room.name} (${room.id})`, 'ChatGateway.handleJoinRoom');

      const messages = await this.chatService.getRecentMessages(room.id);
      this.logger.debug(`Retrieved ${messages.length} messages for room: ${room.id}`, 'ChatGateway.handleJoinRoom');

      this.server.to(room.id).emit('user:joined', {
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
      });

      client.emit('room:join', { room, messages });
      
      this.logger.log(`Room join completed for user ${user.email} in room ${room.name}`, 'ChatGateway.handleJoinRoom');
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`, error.stack, 'ChatGateway.handleJoinRoom');
      client.emit('error', 'Failed to join room');
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

    if (!roomId) {
      this.logger.warn(`User ${user.email} tried to send message without being in a room`, 'ChatGateway.handleMessage');
      client.emit('error', 'You must join a room first');
      return;
    }

    this.logger.log(`User ${user.email} sending message in room: ${roomId}`, 'ChatGateway.handleMessage');
    this.logger.debug(`Message content: ${data.text}`, 'ChatGateway.handleMessage');

    try {
      const message = await this.chatService.createMessage({
        text: data.text,
        userId: user.id,
        userName: user.name,
        roomId: roomId,
      });

      this.logger.log(`Message created successfully: ${message.id}`, 'ChatGateway.handleMessage');

      this.server.to(roomId).emit('message:new', {
        id: message.id,
        text: message.text,
        userId: message.userId,
        userName: message.userName,
        createdAt: message.createdAt,
      });

      this.logger.debug(`Message emitted to room: ${roomId}`, 'ChatGateway.handleMessage');
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`, error.stack, 'ChatGateway.handleMessage');
      client.emit('error', 'Failed to send message');
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:list')
  async handleMessageList(@ConnectedSocket() client: Socket) {
    const user = client.handshake.auth.user;
    this.logger.debug(`User ${user.email} requested message list`, 'ChatGateway.handleMessageList');
    
    client.emit('message:list', []);
  }
}
