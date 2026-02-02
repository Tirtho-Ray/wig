import { Body, Controller, Post, HttpCode, HttpStatus, UnauthorizedException, Req, Res } from "@nestjs/common";
import type { Response, Request } from 'express';
import { AuthService } from "../service/auth.service";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const { access_token, refresh_token } = await this.authService.register(dto);
        this.setCookie(res, refresh_token);
        return {
            message: "Account created successfully",
            access_token
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { access_token, refresh_token } = await this.authService.login(dto);
        this.setCookie(res, refresh_token);
        return {
            message: "Login successful",
            access_token
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies?.['refresh_token'];
        if (!token) throw new UnauthorizedException('Session expired');

        const { access_token, refresh_token } = await this.authService.refresh(token);
        this.setCookie(res, refresh_token);
        return { access_token };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies?.['refresh_token'];

        if (token) {
            await this.authService.logout(token);
        }
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });

        return { message: "Logged out successfully" };
    }

    private setCookie(res: Response, token: string) {
        res.cookie('refresh_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
    }
}