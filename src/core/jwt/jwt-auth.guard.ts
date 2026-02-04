import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './jwt.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (info) {
      const request = context.switchToHttp().getRequest();
      const hasCookie = !!request.cookies?.['access_token'];
      const hasAuthHeader = !!request.headers['authorization'];
      
      console.error(`[AuthGuard] Error: ${info.message}`);
      console.log(`[AuthGuard] Credentials Found - Cookie: ${hasCookie}, Header: ${hasAuthHeader}`);
    }
    if (err || !user) {
      throw (
        err || 
        new UnauthorizedException('Authentication failed: Please login to access this resource')
      );
    }

    return user;
  }
}