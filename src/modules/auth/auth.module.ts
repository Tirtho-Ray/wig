import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; 
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { TokenService } from './service/token.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
  exports: [AuthService, TokenService],
})
export class AuthModule {}