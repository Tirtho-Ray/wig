import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { EmailService } from 'src/lib/email/email.service';

@Module({
  controllers: [UserController],
  providers: [UserService, EmailService]
})
export class UserModule { }
