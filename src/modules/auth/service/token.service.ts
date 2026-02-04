import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async generateTokens(user: JwtPayload) {
    const jti = randomUUID();
    
    // config.ts এর নেস্টেড পাথ অনুযায়ী ডাটা রিড করা হচ্ছে
    const issuer = this.config.get<string>('jwt.issuer');
    const audience = this.config.get<string>('jwt.audience');
    const accessSecret = this.config.get<string>('jwt.access_secret');
    const refreshSecret = this.config.get<string>('jwt.refresh_secret');
    const accessExpires = this.config.get<string>('jwt.access_expires_in');
    const refreshExpires = this.config.get<string>('jwt.refresh_expires_in');

    if (!accessSecret || !refreshSecret) {
      throw new InternalServerErrorException('JWT secrets are not defined in configuration');
    }

    const commonOptions = {
      issuer,
      audience,
    };

    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshTokenPayload = {
      sub: user.id,
      jti,
    };

    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwt.signAsync(accessTokenPayload, {
          ...commonOptions,
          secret: accessSecret,
          expiresIn: accessExpires as any,
        }),
        this.jwt.signAsync(refreshTokenPayload, {
          ...commonOptions,
          secret: refreshSecret,
          expiresIn: refreshExpires as any,
        }),
      ]);

      return { accessToken, refreshToken, jti };
    } catch (error) {
      throw new InternalServerErrorException('Error generating security tokens');
    }
  }

  async verifyRefresh(token: string) {
    const secret = this.config.get<string>('jwt.refresh_secret');
    const issuer = this.config.get<string>('jwt.issuer');
    const audience = this.config.get<string>('jwt.audience');

    try {
      return await this.jwt.verifyAsync(token, {
        secret,
        issuer,
        audience,
      });
    } catch {
      throw new UnauthorizedException('Session expired or invalid');
    }
  }
}