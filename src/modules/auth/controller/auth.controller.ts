import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    UnauthorizedException,
    Req,
    Res,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Throttle({ auth: { limit: 3, ttl: 60000 } })
    @Post('register')
    async register(
        @Body() dto: RegisterDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userAgent = req.headers['user-agent'] || 'unknown';
        const ipAddress = req.ip || '0.0.0.0';

        const { access_token, refresh_token } = await this.authService.register(
            dto,
            userAgent,
            ipAddress,
        );

        this.setCookie(res, refresh_token);
        return { message: 'Account created successfully', access_token };
    }

    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userAgent = req.headers['user-agent'] || 'unknown';
        const ipAddress = req.ip || '0.0.0.0';

        const { access_token, refresh_token } = await this.authService.login(
            dto,
            userAgent,
            ipAddress,
        );

        this.setCookie(res, refresh_token);
        return { message: 'Login successful', access_token };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = req.cookies?.['refresh_token'];
        const deviceId = req.headers['x-device-id'] as string;

        if (!token) throw new UnauthorizedException('No refresh token provided');
        if (!deviceId) throw new UnauthorizedException('Device ID missing');

        const { access_token, refresh_token } = await this.authService.refresh(
            token,
            deviceId,
        );

        this.setCookie(res, refresh_token);
        return { access_token };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = req.cookies?.['refresh_token'];
        const deviceId = req.headers['x-device-id'] as string;
        const userId = req.user?.['id'];

        if (token && userId && deviceId) {
            await this.authService.logout(userId, deviceId);
        }

        this.clearCookie(res);
        return { message: 'Logged out successfully' };
    }

    @Post('logout-all')
    @HttpCode(HttpStatus.OK)
    async logoutAll(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const userId = req.user?.['id'];
        if (userId) {
            await this.authService.logoutAll(userId);
        }

        this.clearCookie(res);
        return { message: 'Logged out from all devices' };
    }

    private setCookie(res: Response, token: string) {
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('refresh_token', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
    }

    private clearCookie(res: Response) {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
    }
}