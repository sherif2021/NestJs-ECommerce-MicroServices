import { NestFactory } from '@nestjs/core';
import { CartModule } from './cart.module';
import { RmqService, RpcExceptionFilter } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(CartModule);

  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: true,
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
  }));

  app.useGlobalFilters(new RpcExceptionFilter());

  const rmqService = app.get(RmqService);

  app.connectMicroservice(rmqService.getOptions('CART_SERVICE'));
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('Cart Api')
    .setDescription('The Cart API description')
    .setVersion('1.0')
    .addTag('cart')
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