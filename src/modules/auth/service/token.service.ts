import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {
    constructor(
        private jwtService: JwtService,
        private config: ConfigService,
    ) { }


    async generateTokens(payload: Record<string, any>) {
        const [at, rt] = await Promise.all([
            // Access Token
            this.jwtService.signAsync(payload, {
                secret: this.config.get<string>('jwt_access_secret'),
                expiresIn: this.config.get<string>('jwt_access_expires_in') as any,
            }),
            // Refresh Token
            this.jwtService.signAsync(payload, {
                secret: this.config.get<string>('jwt_refresh_secret'),
                expiresIn: this.config.get<string>('jwt_refresh_expires_in') as any,
            }),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }

    //verify token
    async verifyRefreshToken(token: string) {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: this.config.get<string>('jwt_refresh_secret'),
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }
}