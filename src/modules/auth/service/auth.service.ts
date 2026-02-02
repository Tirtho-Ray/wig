import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
import { TokenService } from "./token.service";
import { SecurityUtil } from "../utils/security.util";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { UserStatus } from "prisma/generated/prisma/enums";

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tokenService: TokenService,
        private readonly config: ConfigService,
    ) { }

    async register(payload: RegisterDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: payload.email } });
        if (existing) throw new ConflictException('Email already registered');

        const rounds = this.config.get<number>('bcrypt_salt_rounds') || 10;
        const hashedPassword = await SecurityUtil.hashData(payload.password, rounds);

        const user = await this.prisma.user.create({
            data: {
                ...payload,
                password: hashedPassword,
                status: UserStatus.ACTIVE,
            },
        });

        return this.issueTokens(user.id, user.email, user.name);
    }

    async login(payload: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: payload.email },
        });

        if (!user) {
            throw new UnauthorizedException('Email does not exist');
        }
        const isPasswordValid = await SecurityUtil.compareData(
            payload.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Incorrect password');
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new ForbiddenException(`Account is ${user.status}`);
        }

        return this.issueTokens(user.id, user.email, user.name);
    }


    async refresh(oldToken: string) {
        const payload = await this.tokenService.verifyRefreshToken(oldToken);

        const savedToken = await this.prisma.refreshToken.findUnique({
            where: { token: oldToken }
        });

        if (!savedToken || savedToken.isRevoked || savedToken.expiresAt < new Date()) {
            if (savedToken) await this.clearUserSessions(savedToken.userId);
            throw new UnauthorizedException('Invalid or reuse of refresh token detected');
        }

        return this.prisma.$transaction(async (tx) => {
            await tx.refreshToken.delete({ where: { id: savedToken.id } });
            return this.issueTokens(payload.id, payload.email, payload.name, tx);
        });
    }

    async logout(token: string) {
        await this.prisma.refreshToken.delete({ where: { token } }).catch(() => { });
    }

    private async issueTokens(userId: string, email: string, name: string, db: any = this.prisma) {
        const tokens = await this.tokenService.generateTokens({ id: userId, email, name });

        await db.refreshToken.create({
            data: {
                token: tokens.refresh_token,
                userId: userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return tokens;
    }

    private async clearUserSessions(userId: string) {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
}