import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
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
        'JWT_SECRET_KEY': Joi.string().required(),
        'JWT_REFRESH_SECRET_KEY': Joi.string().required(),
        'JWT_DURATION': Joi.string().required(),
        'RABBITMQ_USER_SERVICE_QUEUE': Joi.string().required(),
        'RABBITMQ_AUTH_SERVICE_QUEUE': Joi.string().required(),
      }
      ),
    }),
    RmqModule,
    CustomJwtModule,
    RmqModule.register({ name: 'USER_SERVICE' }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
