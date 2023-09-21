import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(service: string): RmqOptions {
    const USER = this.configService.get<string>('RABBITMQ_DEFAULT_USER');
    const PASSWORD = this.configService.get<string>('RABBITMQ_DEFAULT_PASS');
    const HOST = this.configService.get<string>('RABBITMQ_HOST');

    return {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
        queue: this.configService.get<string>(`RABBITMQ_${service}_QUEUE`),
        queueOptions: {
          durable: true,
        },
        noAck: false,
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
