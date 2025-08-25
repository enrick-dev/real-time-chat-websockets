import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RoomService } from './room.service';
import type { CreateRoomDto } from './room.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Post()
  async createRoom(@Body() createRoomDto: CreateRoomDto, @Request() req) {
    console.log('Creating room:', createRoomDto);
    const room = await this.roomService.createRoom(createRoomDto);
    console.log('Room created:', room);
    return room;
  }

  @Get()
  async getAllRooms() {
    console.log('Getting all rooms');
    const rooms = await this.roomService.getAllRooms();
    console.log('Rooms found:', rooms.length);
    return rooms;
  }

  @Get(':slug')
  async getRoomBySlug(@Param('slug') slug: string) {
    console.log('Getting room by slug:', slug);
    const room = await this.roomService.getRoomBySlug(slug);
    console.log('Room found:', room);
    return room;
  }
}
