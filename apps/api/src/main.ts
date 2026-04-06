import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { TConfig } from './lib/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService<TConfig>);

  const config = new DocumentBuilder()
    .setTitle('Stock Management API')
    .setDescription('Stock Management API')
    .setVersion('1.0')
    .addTag('stock')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const frontend_url = configService.get('frontend_url', { infer: true });
  const port = configService.get('port', { infer: true });

  app.enableCors({ origin: frontend_url, credentials: true });
  app.set('trust proxy', 'loopback');

  await app.listen(port ?? 3000);
}

bootstrap();
