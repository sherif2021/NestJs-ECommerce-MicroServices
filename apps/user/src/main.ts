import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { RpcExceptionFilter, RmqService } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);

  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: true,
    forbidUnknownValues : true,
    forbidNonWhitelisted : true,
  }));
  
  app.useGlobalFilters(new RpcExceptionFilter());

  const rmqService = app.get(RmqService);
  
  app.connectMicroservice(rmqService.getOptions('USER_SERVICE'));

  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('User Api')
    .setDescription('The User API description')
    .setVersion('1.0')
    .addTag('user')
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
  
  app.listen(3000);
}
bootstrap();