import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ENVEnum } from './common/enum/env.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
   const port = parseInt(configService.get<string>(ENVEnum.PORT) ?? '9000');
   console.log(`Project is running on ${port}`)
  await app.listen(port);

}
bootstrap();

