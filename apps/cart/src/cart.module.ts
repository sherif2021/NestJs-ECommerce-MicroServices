import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomJwtModule, RmqModule } from '@app/common';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './entities/cart.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
      validationSchema: Joi.object({
        'RABBITMQ_DEFAULT_USER' : Joi.string().required(),
        'RABBITMQ_DEFAULT_PASS' : Joi.string().required(),
        'JWT_SECRET_KEY': Joi.string().required(),
        'CART_MONGO_URI': Joi.string().required(),
        'RABBITMQ_CART_SERVICE_QUEUE': Joi.string().required(),
        'RABBITMQ_ITEMS_SERVICE_QUEUE': Joi.string().required(),
      },
      ),
    },
    ),
    CustomJwtModule,
    RmqModule,
    RmqModule.register({ name: 'ITEMS_SERVICE' }),
    MongooseModule.forRootAsync(
      {
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>('CART_MONGO_URI'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        inject: [ConfigService],
      }
    ),
    MongooseModule.forFeature([
      {
        name: Cart.name,
        schema: CartSchema,
      },
    ])
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule { }
