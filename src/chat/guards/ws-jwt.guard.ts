import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHeader(client);

      if (!token) {
        throw new WsException('Unauthorized');
      }
      const payload = this.jwtService.verify(token);
      const user = await this.authService.validateUser(payload.sub);

      if (!user) {
        throw new WsException('Unauthorized');
      }

      client.handshake.auth.user = user;
      return true;
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth =
      client.handshake.auth.token || client.handshake.headers.authorization;
    if (!auth) {
      return undefined;
    }

    if (auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }

    return auth;
  }
}
