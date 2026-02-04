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
import { DeviceInfo } from '../utils/device-info.decorator';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
  ) {}

  async register(payload: RegisterDto, device: DeviceInfo) {
    const existing = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) throw new ConflictException('Email already registered');

    const rounds = this.config.get<number>('security.bcrypt_salt_rounds') || 12;
    const hashedPassword = await SecurityUtil.hashData(payload.password, rounds);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          password: hashedPassword,
          status: UserStatus.ACTIVE,
          role: UserRole.USER,
        },
      });
      return this.issueTokens(user, device, tx);
    });
  }

  async login(payload: LoginDto, device: DeviceInfo
  ) {
    // ১. প্রি-ভ্যালিডেশন: ডাটাবেস হিটের আগে সাধারণ চেক
    if (!payload.email || !payload.password) throw new UnauthorizedException('Missing credentials');

    const user = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // ২. অ্যাকাউন্ট লক চেক
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

    // ৩. ট্রানজেকশনের মাধ্যমে সেশন এবং লগইন অ্যাটেম্পট আপডেট (Scalability & Race Condition Fix)
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockUntil: null },
      });
      return this.issueTokens(user, device, tx);
    });
  }

  async refresh(refreshToken: string, device: DeviceInfo) {
    const payload = await this.tokenService.verifyRefresh(refreshToken);
    const { jti, sub: userId } = payload;

    const session = await this.prisma.refreshToken.findUnique({ where: { jti } });

    if (!session || session.isRevoked || session.userId !== userId) {
      if (session) await this.clearUserSessions(userId);
      throw new UnauthorizedException('Invalid or compromised session');
    }

    const isValid = await SecurityUtil.compareData(refreshToken, session.tokenHash);
    if (!isValid) {
      await this.clearUserSessions(userId);
      throw new UnauthorizedException('Token mismatch');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    return this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.delete({ where: { id: session.id } });
      return this.issueTokens(user, device, tx);
    });
  }

  private async issueTokens(
    user: User,
    device: DeviceInfo,
    tx: Prisma.TransactionClient,
  ) {
    // ৪. রেস কন্ডিশন প্রিভেন্ট করতে ট্রানজেকশনের ভেতরে কাউন্ট ও ডিলিট
    const activeSessions = await tx.refreshToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    if (activeSessions.length >= 5) {
      const oldestSession = activeSessions[0];
      await tx.refreshToken.delete({ where: { id: oldestSession.id } });
    }

    const { accessToken, refreshToken, jti } = await this.tokenService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // ৫. সিকিউরিটি হ্যাশ (ভবিষ্যতে এটিকে Redis এ মুভ করা যেতে পারে)
    const tokenHash = await SecurityUtil.hashData(refreshToken);
    const ttlDays = this.config.get<number>('jwt.refresh_ttl_days') || 7;

    await tx.refreshToken.create({
      data: {
        jti,
        tokenHash,
        userId: user.id,
        userAgent: device.userAgent,
        ipAddress: device.ip,
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
      },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async logout(userId: string, userAgent: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId, userAgent },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
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