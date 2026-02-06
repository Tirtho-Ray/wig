import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Throttle } from '@nestjs/throttler';
import { GetUser } from 'src/core/jwt/get-user.decorator';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { DeviceInfo, GetDeviceInfo } from '../utils/device-info.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ auth: { limit: 3, ttl: 60000 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @GetDeviceInfo() device: DeviceInfo,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.register(dto, device);
    this.setCookies(res, access_token, refresh_token);
    return { message: 'Account created successfully', access_token };
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @GetDeviceInfo() device: DeviceInfo,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.login(dto, device);
    this.setCookies(res, access_token, refresh_token);
    return { message: 'Login successful', access_token };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @GetDeviceInfo() device: DeviceInfo,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.['refresh_token'];
    if (!token) throw new UnauthorizedException('No refresh token provided');

    const { access_token, refresh_token } = await this.authService.refresh(token, device);
    this.setCookies(res, access_token, refresh_token);
    return { access_token };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetUser('id') userId: string,
    @GetDeviceInfo() device: DeviceInfo,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId, device.userAgent);
    this.clearCookies(res);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@GetUser('id') userId: string, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(userId);
    this.clearCookies(res);
    return { message: 'Logged out from all devices' };
  }

  private setCookies(res: Response, access: string, refresh: string) {
    const isProd = process.env.NODE_ENV === 'production';
    const commonOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'strict' : 'lax') as 'strict' | 'lax',
      path: '/',
    };

    res.cookie('access_token', access, { ...commonOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refresh, { ...commonOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  }

  private clearCookies(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const commonOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'strict' : 'lax') as 'strict' | 'lax',
      path: '/',
    };
    res.clearCookie('access_token', commonOptions);
    res.clearCookie('refresh_token', commonOptions);
  }
}