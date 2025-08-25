import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateMessageDto {
  text: string;
  userId: string;
  userName: string;
  roomId: string;
}

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(createMessageDto: CreateMessageDto) {
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

    return message;
  }

  async getRecentMessages(roomId: string, limit: number = 50) {
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

    return messages.reverse();
  }
}
