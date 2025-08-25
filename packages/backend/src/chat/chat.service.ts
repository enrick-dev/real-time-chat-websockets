import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateMessageDto {
  text: string;
  userId: string;
  userName: string;
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
      },
      select: {
        id: true,
        text: true,
        userName: true,
        createdAt: true,
      },
    });

    return message;
  }

  async getRecentMessages(limit: number = 50) {
    const messages = await this.prisma.message.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        text: true,
        userName: true,
        createdAt: true,
      },
    });

    return messages.reverse();
  }
}
