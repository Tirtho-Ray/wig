import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private config: ConfigService) {
    const secret = config.get<string>('jwt.access_secret');
    const issuer = config.get<string>('jwt.issuer');
    const audience = config.get<string>('jwt.audience');

    if (!secret) {
      throw new InternalServerErrorException('JWT Access Secret is missing in config');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['access_token']; 
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ]),
      secretOrKey: secret,
      issuer: issuer,
      audience: audience,
      ignoreExpiration: false,
    });
  }

  validate(payload: any) {
    console.log(' JWT Verified. Payload:', payload);

    if (!payload) {
      throw new UnauthorizedException('Invalid or empty token payload');
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}