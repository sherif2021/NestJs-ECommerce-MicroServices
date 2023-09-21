import { NestFactory } from '@nestjs/core';
import { RmqService, RpcExceptionFilter } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { OrderModule } from './order.module';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(OrderModule);

  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: true,
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
  }));

  app.useGlobalFilters(new RpcExceptionFilter());

  const rmqService = app.get(RmqService);

  app.connectMicroservice(rmqService.getOptions('ORDER_SERVICE'));
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('Order Api')
    .setDescription('The Order API description')
    .setVersion('1.0')
    .addTag('order')
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