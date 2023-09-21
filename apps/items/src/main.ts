import { NestFactory } from '@nestjs/core';
import { RmqService } from '@app/common';
import { ItemsModule } from './items.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ItemsModule);

  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: true,
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
  }));

  const rmqService = app.get(RmqService);

  app.connectMicroservice(rmqService.getOptions('ITEMS_SERVICE'));
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('Items Api')
    .setDescription('The Items API description')
    .setVersion('1.0')
    .addTag('items')
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