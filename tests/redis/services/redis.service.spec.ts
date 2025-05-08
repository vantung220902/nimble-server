import { AppConfig } from '@config';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@redis/services';
import { Redis } from 'ioredis';

jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      publish: jest.fn(),
      subscribe: jest.fn(),
      on: jest.fn(),
      unsubscribe: jest.fn(),
    })),
  };
});

describe('RedisService', () => {
  let redisService: RedisService;
  let publisher: Redis;
  let subscriber: Redis;
  let moduleRef: TestingModule;

  const mockAppConfig = {
    redisHost: 'localhost',
    redisPort: 6379,
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: AppConfig,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    redisService = moduleRef.get<RedisService>(RedisService);
    publisher = redisService['publisher'];
    subscriber = redisService['subscriber'];
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(redisService).toBeDefined();
    expect(publisher).toBeDefined();
    expect(subscriber).toBeDefined();
  });

  it('Should handle publish function correctly', () => {
    const channel = 'test';
    const payload = 'payload';

    redisService.publish(channel, payload);

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenLastCalledWith(channel, payload);
  });

  it('Should handle subscribe function correctly', () => {
    const channel = 'test';
    const callback = jest.fn();

    redisService.subscribe(channel, callback);

    expect(subscriber.subscribe).toHaveBeenCalledTimes(1);
    expect(subscriber.subscribe).toHaveBeenLastCalledWith(channel);
    expect(subscriber.on).toHaveBeenCalledTimes(1);
    expect(subscriber.on).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('Should call callback function  when message is received on the correct channel', () => {
    const channel = 'test';
    const callback = jest.fn();
    const message = 'message';

    redisService.subscribe(channel, callback);

    const messageHandler = (subscriber.on as jest.Mock).mock.calls.find(
      (call) => call[0] === 'message',
    )[1];
    messageHandler(channel, message);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(message);
  });

  it('Shout not call callback function when message is received on other channel', () => {
    const channel = 'test';
    const callback = jest.fn();
    const message = 'message';

    redisService.subscribe(channel, callback);

    const messageHandler = (subscriber.on as jest.Mock).mock.calls.find(
      (call) => call[0] === 'message',
    )[1];
    messageHandler('another', message);

    expect(callback).not.toHaveBeenCalled();
  });

  it('Should call unsubscribe function correctly', () => {
    const channel = 'channel';

    redisService.unsubscribe(channel);

    expect(subscriber.unsubscribe).toHaveBeenCalledTimes(1);
    expect(subscriber.unsubscribe).toHaveBeenLastCalledWith(channel);
  });
});
