import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsAuthService {
  private readonly logger = new Logger(WsAuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async authenticate(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) return null;

      const secret = this.configService.get<string>('jwt.jwt_access_secret');
      const payload = await this.jwtService.verifyAsync(token, { secret });

      if (!payload?.userId) return null;

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true },
      });

      return user;
    } catch (error) {
      this.logger.error(`Auth Error: ${error.message}`);
      return null;
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (!auth) return null;
    return auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
  }
}