import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateMessageDto {
  text: string;
  userId: string;
  userName: string;
  roomId: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  async createMessage(createMessageDto: CreateMessageDto) {
    this.logger.log(`Creating message for user: ${createMessageDto.userName}`, 'ChatService.createMessage');
    this.logger.debug(`Message details: ${JSON.stringify(createMessageDto)}`, 'ChatService.createMessage');

    const message = await this.prisma.message.create({
      data: {
        text: createMessageDto.text,
        userId: createMessageDto.userId,
        userName: createMessageDto.userName,
        roomId: createMessageDto.roomId,
      },
      select: {
        id: true,
        text: true,
        userName: true,
        userId: true,
        roomId: true,
        createdAt: true,
      },
    });

    this.logger.log(`Message created successfully: ${message.id}`, 'ChatService.createMessage');
    return message;
  }

  async getRecentMessages(roomId: string, limit: number = 50) {
    this.logger.debug(`Getting recent messages for room: ${roomId}, limit: ${limit}`, 'ChatService.getRecentMessages');

    const messages = await this.prisma.message.findMany({
      where: {
        roomId: roomId,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        text: true,
        userName: true,
        userId: true,
        roomId: true,
        createdAt: true,
      },
    });

    this.logger.debug(`Retrieved ${messages.length} messages for room: ${roomId}`, 'ChatService.getRecentMessages');
    return messages.reverse();
  }
}
