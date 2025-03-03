import { AppConfig } from '@config';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  constructor(private readonly appConfig: AppConfig) {
    this.publisher = new Redis({
      host: this.appConfig.redisHost,
      port: this.appConfig.redisPort,
    });

    this.subscriber = new Redis({
      host: this.appConfig.redisHost,
      port: this.appConfig.redisPort,
    });
  }

  public publish(channel: string, payload: string) {
    this.publisher.publish(channel, payload);
  }

  public subscribe(channel: string, callback: (message: string) => void) {
    this.subscriber.subscribe(channel);
    this.subscriber.on('message', (receivedChannel, receivedMessage) => {
      if (receivedChannel === channel) {
        callback(receivedMessage);
      }
    });
  }

  public unsubscribe(channel: string) {
    this.subscriber.unsubscribe(channel);
  }
}
