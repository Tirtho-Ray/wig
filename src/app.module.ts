import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { DocumentModule } from './modules/document/document.module';
import { EmContactModule } from './modules/contact/contace.module';

@Module({
  imports: [
    // Rate Limiting Configuration
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 1000,    
      limit: 3,     
    }, {
      name: 'auth',
      ttl: 60000,   
      limit: 5,     
    }]),
    
    ScheduleModule.forRoot(), 
    
    ConfigurationModule,
    AuthModule,
    UserModule,
    PrismaModule,
    DocumentModule,
    EmContactModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}