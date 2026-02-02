import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ConfigurationModule } from './config/config.module';


@Module({
  imports: [
    ConfigurationModule
  ],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
