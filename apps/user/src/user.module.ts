import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entites/user.entity';
import * as Joi from 'joi';
import { CustomJwtModule, RmqModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
      validationSchema: Joi.object({
        'RABBITMQ_DEFAULT_USER': Joi.string().required(),
        'RABBITMQ_DEFAULT_PASS': Joi.string().required(),
        'JWT_SECTET_KEY': Joi.string().required(),
        'CRYPT_SECRET_KEY': Joi.string().required(),
        'RABBITMQ_USER_SERVICE_QUEUE': Joi.string().required(),
        'USER_MONGO_URI': Joi.string().required(),
      }),
    }),
    CustomJwtModule,
    RmqModule,
    RmqModule.register({ name: 'CART_SERVICE' }),
    MongooseModule.forRootAsync(
      {
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>('USER_MONGO_URI'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        inject: [ConfigService],
      }
    ),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
