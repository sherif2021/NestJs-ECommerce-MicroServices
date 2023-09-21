import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';

interface RmqModuleOptions {
  name: string;
}

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: function (configService: ConfigService) {
              const USER = configService.get<string>('RABBITMQ_DEFAULT_USER');
              const PASSWORD = configService.get<string>('RABBITMQ_DEFAULT_PASS');
              const HOST = configService.get<string>('RABBITMQ_HOST');

              return ({
                transport: Transport.RMQ,
                options: {
                  urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
                  queue: configService.get<string>(`RABBITMQ_${name}_QUEUE`),
                  queueOptions: {
                    durable: true,
                  },
                },
              });
            },
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
