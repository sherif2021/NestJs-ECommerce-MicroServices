import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CustomJwtModule, RmqModule } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { Order, OrderSchema } from './entites/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
      validationSchema: Joi.object({
        'RABBITMQ_DEFAULT_USER': Joi.string().required(),
        'RABBITMQ_DEFAULT_PASS': Joi.string().required(),
        'JWT_SECTET_KEY': Joi.string().required(),
        'ORDER_MONGO_URI': Joi.string().required(),
        'RABBITMQ_ORDER_SERVICE_QUEUE': Joi.string().required(),
        'RABBITMQ_CART_SERVICE_QUEUE': Joi.string().required(),
      },
      ),
    },
    ),
    CustomJwtModule,
    RmqModule,
    RmqModule.register({ name: 'CART_SERVICE' }),
    RmqModule.register({ name: 'ITEMS_SERVICE' }),
    MongooseModule.forRootAsync(
      {
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>('ORDER_MONGO_URI'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        inject: [ConfigService],
      }
    ),
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      }
    ])
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
