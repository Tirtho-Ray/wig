import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class DeviceInfo {
  userAgent: string;
  ip: string;
  constructor(userAgent: string, ip: string) {
    this.userAgent = userAgent;
    this.ip = ip;
  }
}

export const GetDeviceInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DeviceInfo => {
    const request = ctx.switchToHttp().getRequest();
    const ip = request.headers['x-forwarded-for']?.toString() || 
               request.socket.remoteAddress || 
               '0.0.0.0';
               
    const userAgent = request.headers['user-agent'] || 'unknown';

    return new DeviceInfo(userAgent, ip);
  },
);