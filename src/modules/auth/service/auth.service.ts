// import {
//   Injectable,
//   ConflictException,
//   UnauthorizedException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { TokenService } from './token.service';
// import { SecurityUtil } from '../utils/security.util';
// import { RegisterDto } from '../dto/register.dto';
// import { LoginDto } from '../dto/login.dto';
// import { UserRole, UserStatus } from 'prisma/generated/prisma/enums';
// import { randomUUID } from 'crypto';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { Prisma, RefreshToken } from 'prisma/generated/prisma/browser';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly tokenService: TokenService,
//     private readonly config: ConfigService,
//   ) {}

//   async register(payload: RegisterDto, userAgent: string, ipAddress: string) {
//     const existing = await this.prisma.user.findUnique({
//       where: { email: payload.email },
//     });

//     if (existing) {
//       throw new ConflictException('Email already registered');
//     }

//     const rounds = this.config.get<number>('bcrypt_salt_rounds') ?? 12;
//     const hashedPassword = await SecurityUtil.hashData(payload.password, rounds);

//     const user = await this.prisma.user.create({
//       data: {
//         email: payload.email,
//         name: payload.name,
//         password: hashedPassword,
//         status: UserStatus.ACTIVE,
//         role: UserRole.USER,
//       },
//     });

//     return this.issueTokens(
//       user.id,
//       user.email,
//       user.name,
//       user.role,
//       userAgent,
//       ipAddress,
//     );
//   }

//   async login(payload: LoginDto, userAgent: string, ipAddress: string) {
//     const user = await this.prisma.user.findUnique({
//       where: { email: payload.email },
//     });

//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     const passwordValid = await SecurityUtil.compareData(
//       payload.password,
//       user.password,
//     );

//     if (!passwordValid) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     if (user.status !== UserStatus.ACTIVE) {
//       throw new ForbiddenException(`Account is ${user.status.toLowerCase()}`);
//     }

//     return this.issueTokens(
//       user.id,
//       user.email,
//       user.name,
//       user.role,
//       userAgent,
//       ipAddress,
//     );
//   }

//   async refresh(oldRefreshToken: string, deviceId: string) {
//     let payload: { id: string; email: string; name: string; role: string };

//     try {
//       payload = await this.tokenService.verifyRefreshToken(oldRefreshToken);
//     } catch {
//       throw new UnauthorizedException('Session expired');
//     }

//     const sessions = await this.prisma.refreshToken.findMany({
//       where: {
//         userId: payload.id,
//         deviceId,
//         isRevoked: false,
//       },
//     });

//     let matchedSession: RefreshToken | null = null;

//     for (const session of sessions) {
//       const isMatch = await SecurityUtil.compareData(
//         oldRefreshToken,
//         session.tokenHash,
//       );
//       if (isMatch) {
//         matchedSession = session;
//         break;
//       }
//     }

//     if (!matchedSession) {
//       await this.clearUserSessions(payload.id);
//       throw new UnauthorizedException('Security breach detected');
//     }

//     if (matchedSession.expiresAt < new Date()) {
//       await this.revokeSession(matchedSession.id);
//       throw new UnauthorizedException('Session expired');
//     }

//     return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
//       await tx.refreshToken.delete({
//         where: { id: matchedSession!.id },
//       });

//       return this.issueTokens(
//         payload.id,
//         payload.email,
//         payload.name,
//         payload.role,
//         matchedSession!.userAgent,
//         matchedSession!.ipAddress,
//         tx,
//         deviceId,
//       );
//     });
//   }

//   async logout(userId: string, deviceId: string): Promise<void> {
//     await this.prisma.refreshToken.deleteMany({
//       where: { userId, deviceId },
//     });
//   }

//   async logoutAll(userId: string): Promise<void> {
//     await this.clearUserSessions(userId);
//   }

//   private async issueTokens(
//     userId: string,
//     email: string,
//     name: string,
//     role: string,
//     userAgent: string,
//     ipAddress: string,
//     db: Prisma.TransactionClient | PrismaService = this.prisma,
//     deviceId?: string,
//   ) {
//     const activeSessionsCount = await db.refreshToken.count({
//       where: {
//         userId,
//         isRevoked: false,
//       },
//     });

//     if (!deviceId && activeSessionsCount >= 5) {
//       const oldestSession = await db.refreshToken.findFirst({
//         where: { userId },
//         orderBy: { createdAt: 'asc' },
//       });

//       if (oldestSession) {
//         await db.refreshToken.delete({
//           where: { id: oldestSession.id },
//         });
//       }
//     }

//     const tokens = await this.tokenService.generateTokens({
//       id: userId,
//       email,
//       name,
//       role,
//     });

//     const refreshTtlDays = this.config.get<number>('refresh_token_ttl_days') ?? 7;
//     const tokenHash = await SecurityUtil.hashData(tokens.refresh_token, 10);

//     await db.refreshToken.create({
//       data: {
//         tokenHash,
//         userId,
//         deviceId: deviceId ?? randomUUID(),
//         userAgent,
//         ipAddress,
//         expiresAt: new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000),
//       },
//     });

//     return tokens;
//   }

//   private async clearUserSessions(userId: string): Promise<void> {
//     await this.prisma.refreshToken.deleteMany({
//       where: { userId },
//     });
//   }

//   private async revokeSession(sessionId: string): Promise<void> {
//     await this.prisma.refreshToken.update({
//       where: { id: sessionId },
//       data: { isRevoked: true },
//     });
//   }

//   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
//   async cleanExpiredTokens(): Promise<void> {
//     await this.prisma.refreshToken.deleteMany({
//       where: {
//         OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
//       },
//     });
//   }
// }

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from './token.service';
import { SecurityUtil } from '../utils/security.util';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UserRole, UserStatus } from 'prisma/generated/prisma/enums';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, User } from 'prisma/generated/prisma/browser';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
  ) { }


  async register(payload: RegisterDto, userAgent: string, ipAddress: string, deviceId: string) {
    if (!deviceId) throw new UnauthorizedException('Device ID required');

    const existing = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) throw new ConflictException('Email already registered');

    const rounds = this.config.get<number>('security.bcrypt_salt_rounds') || 12;
    const hashedPassword = await SecurityUtil.hashData(payload.password, rounds);

    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        role: UserRole.USER,
      },
    });

    return this.issueTokens(user, userAgent, ipAddress, deviceId);
  }

  async login(payload: LoginDto, userAgent: string, ipAddress: string, deviceId: string) {
    if (!deviceId) throw new UnauthorizedException('Device ID required');

    const user = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new ForbiddenException('Account temporarily locked');
    }

    const isPasswordValid = await SecurityUtil.compareData(payload.password, user.password);

    if (!isPasswordValid) {
      const attempts = user.failedLoginAttempts + 1;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(`Account is ${user.status.toLowerCase()}`);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockUntil: null },
    });

    return this.issueTokens(user, userAgent, ipAddress, deviceId);
  }


  async refresh(refreshToken: string, deviceId: string) {
    const payload = await this.tokenService.verifyRefresh(refreshToken);
    const { jti, sub: userId } = payload;

    const session = await this.prisma.refreshToken.findUnique({ where: { jti } });

    // Security check
    if (!session || session.isRevoked || session.userId !== userId || session.deviceId !== deviceId) {
      if (session) await this.clearUserSessions(userId);
      throw new UnauthorizedException('Invalid or compromised session');
    }

    // Verify token hash
    const isValid = await SecurityUtil.compareData(refreshToken, session.tokenHash);
    if (!isValid) {
      await this.clearUserSessions(userId);
      throw new UnauthorizedException('Token mismatch');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    return this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.delete({ where: { id: session.id } });
      return this.issueTokens(user, session.userAgent, session.ipAddress, deviceId, tx);
    });
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId, deviceId } });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.clearUserSessions(userId);
  }

  private async issueTokens(
    user: User,
    userAgent: string,
    ipAddress: string,
    deviceId: string,
    db: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const activeSessionsCount = await db.refreshToken.count({
      where: { userId: user.id, isRevoked: false },
    });

    if (activeSessionsCount >= 5) {
      const oldest = await db.refreshToken.findFirst({
        where: { userId: user.id, isRevoked: false },
        orderBy: { createdAt: 'asc' },
      });
      if (oldest) await db.refreshToken.delete({ where: { id: oldest.id } });
    }

    const { accessToken, refreshToken, jti } = await this.tokenService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const tokenHash = await SecurityUtil.hashData(refreshToken);
    const ttlDays = this.config.get<number>('jwt.refresh_ttl_days') || 7;

    await db.refreshToken.create({
      data: {
        jti,
        tokenHash,
        userId: user.id,
        deviceId,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
      },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private async clearUserSessions(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanExpiredTokens() {
    await this.prisma.refreshToken.deleteMany({
      where: { OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }] },
    });
  }
}