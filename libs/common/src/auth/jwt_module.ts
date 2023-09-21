import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECTET_KEY'),
        signOptions: { expiresIn: configService.get<string>('JWT_DURATION') },
      }),
      inject: [ConfigService],
    })
  ]
})
export class CustomJwtModule { }