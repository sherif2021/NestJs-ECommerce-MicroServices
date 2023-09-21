import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ValidationPipe } from '@nestjs/common';
import { RpcExceptionFilter, RmqService } from '@app/common';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: true,
    forbidUnknownValues : true,
    forbidNonWhitelisted : true,
  }));
  app.useGlobalFilters(new RpcExceptionFilter());

  const rmqService = app.get(RmqService);

  app.connectMicroservice(rmqService.getOptions('AUTH_SERVICE'));
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('Auth Api')
    .setDescription('The Items Auth description')
    .setVersion('1.0')
    .addTag('Auth')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    deepScanRoutes: true,
    operationIdFactory: (
      controllerKey: string,
      methodKey: string,
    ) => methodKey
  };

  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
}
bootstrap();