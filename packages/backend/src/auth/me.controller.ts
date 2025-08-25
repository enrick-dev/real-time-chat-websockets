import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class MeController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
