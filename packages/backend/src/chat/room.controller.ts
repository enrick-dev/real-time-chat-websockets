import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomController {
  private readonly logger = new Logger(RoomController.name);

  constructor(private readonly roomService: RoomService) {}

  @Post()
  async createRoom(@Body() createRoomDto: CreateRoomDto, @Request() req) {
    this.logger.log(`Creating room: ${JSON.stringify(createRoomDto)}`, 'RoomController.createRoom');
    this.logger.debug(`User creating room: ${req.user.email}`, 'RoomController.createRoom');

    const room = await this.roomService.createRoom(createRoomDto);
    
    this.logger.log(`Room created: ${JSON.stringify(room)}`, 'RoomController.createRoom');
    return room;
  }

  @Get()
  async getAllRooms() {
    this.logger.log('Getting all rooms', 'RoomController.getAllRooms');

    const rooms = await this.roomService.getAllRooms();
    
    this.logger.log(`Rooms found: ${rooms.length}`, 'RoomController.getAllRooms');
    return rooms;
  }

  @Get(':slug')
  async getRoomBySlug(@Param('slug') slug: string) {
    this.logger.log(`Getting room by slug: ${slug}`, 'RoomController.getRoomBySlug');

    const room = await this.roomService.getRoomBySlug(slug);
    
    this.logger.log(`Room found: ${JSON.stringify(room)}`, 'RoomController.getRoomBySlug');
    return room;
  }
}
