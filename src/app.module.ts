import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ConfigurationModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { DocumentModule } from './modules/document/document.module';
import { EmContactModule } from './modules/contact/contace.module';


@Module({
  imports: [
    ConfigurationModule,
    AuthModule,
    UserModule,
    PrismaModule,
    DocumentModule,
    EmContactModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
