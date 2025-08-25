import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(RoomService.name);

  constructor(private prisma: PrismaService) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    this.logger.log(`Creating room: ${createRoomDto.name}`, 'RoomService.createRoom');
    this.logger.debug(`Room details: ${JSON.stringify(createRoomDto)}`, 'RoomService.createRoom');

    const slug = await this.generateUniqueSlug(createRoomDto.name);
    this.logger.debug(`Generated slug: ${slug}`, 'RoomService.createRoom');

    const room = await this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        slug: slug,
        maxUsers: createRoomDto.maxUsers,
      },
    });

    this.logger.log(`Room created successfully: ${room.name} (ID: ${room.id})`, 'RoomService.createRoom');
    return room;
  }

  async getRoomBySlug(slug: string): Promise<Room> {
    this.logger.debug(`Getting room by slug: ${slug}`, 'RoomService.getRoomBySlug');

    const room = await this.prisma.room.findUnique({
      where: { slug },
    });

    if (!room) {
      this.logger.warn(`Room not found with slug: ${slug}`, 'RoomService.getRoomBySlug');
      throw new NotFoundException('Room not found');
    }

    this.logger.debug(`Room found: ${room.name} (ID: ${room.id})`, 'RoomService.getRoomBySlug');
    return room;
  }

  async getAllRooms(): Promise<Room[]> {
    this.logger.debug('Getting all rooms', 'RoomService.getAllRooms');

    const rooms = await this.prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
    });

    this.logger.debug(`Found ${rooms.length} rooms`, 'RoomService.getAllRooms');
    return rooms;
  }

  async getRoomById(id: string): Promise<Room> {
    this.logger.debug(`Getting room by ID: ${id}`, 'RoomService.getRoomById');

    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      this.logger.warn(`Room not found with ID: ${id}`, 'RoomService.getRoomById');
      throw new NotFoundException('Room not found');
    }

    this.logger.debug(`Room found: ${room.name} (ID: ${room.id})`, 'RoomService.getRoomById');
    return room;
  }

  private generateSlug(name: string): string {
    this.logger.debug(`Generating slug for name: ${name}`, 'RoomService.generateSlug');
    
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    this.logger.debug(`Generating unique slug for name: ${name}`, 'RoomService.generateUniqueSlug');
    
    let slug = this.generateSlug(name);
    let counter = 1;
    let uniqueSlug = slug;

    while (true) {
      const existingRoom = await this.prisma.room.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existingRoom) {
        this.logger.debug(`Unique slug generated: ${uniqueSlug}`, 'RoomService.generateUniqueSlug');
        break;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
      this.logger.debug(`Slug already exists, trying: ${uniqueSlug}`, 'RoomService.generateUniqueSlug');
    }

    return uniqueSlug;
  }
}
