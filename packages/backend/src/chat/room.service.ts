import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

export interface Room {
  id: string;
  name: string;
  slug: string;
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingRoom = await this.prisma.room.findUnique({
        where: { slug },
      });

      if (!existingRoom) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const baseSlug = this.generateSlug(createRoomDto.name);
    const slug = await this.generateUniqueSlug(baseSlug);

    const room = await this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        slug,
        maxUsers: createRoomDto.maxUsers,
      },
    });

    return room;
  }

  async getRoomBySlug(slug: string): Promise<Room> {
    const room = await this.prisma.room.findUnique({
      where: { slug },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async getAllRooms(): Promise<Room[]> {
    const rooms = await this.prisma.room.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rooms;
  }

  async getRoomById(id: string): Promise<Room> {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }
}
