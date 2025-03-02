import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  onModuleDestroy() {
    return this.redis.quit();
  }

  public async publish(channel: string, message: string) {
    return this.redis.publish(channel, message);
  }

  public async subscribe(channel: string, callback: (message: string) => void) {
    const subscriber = this.redis.duplicate();
    return subscriber.on('message', (receivedChannel, receivedMessage) => {
      if (receivedChannel === channel) {
        callback(receivedMessage);
      }
    });
  }
}
