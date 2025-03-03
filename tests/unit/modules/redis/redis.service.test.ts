import { AppConfig } from '@config';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@redis/services';
import Redis from 'ioredis';

jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      unsubscribe: jest.fn(),
      publish: jest.fn(),
      subscribe: jest.fn(),
      on: jest.fn(),
    })),
  };
});

describe('RedisService', () => {
  let service: RedisService;
  let mockPublisher: Redis;
  let mockSubscriber: Redis;

  const mockAppConfig = {
    redisHost: 'localhost',
    redisPort: 6379,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: AppConfig,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    mockPublisher = service['publisher'];
    mockSubscriber = service['subscriber'];
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('should call publisher.publish with correct channel and payload', () => {
    const channel = 'testChannel';
    const payload = 'testPayload';
    service.publish(channel, payload);
    expect(mockPublisher.publish).toHaveBeenCalledWith(channel, payload);
  });

  test('should call subscriber.subscribe with the correct channel', () => {
    const channel = 'testChannel';
    const callback = jest.fn();
    service.subscribe(channel, callback);
    expect(mockSubscriber.subscribe).toHaveBeenCalledWith(channel);
  });

  test('should set up message listener', () => {
    const channel = 'testChannel';
    const callback = jest.fn();
    service.subscribe(channel, callback);
    expect(mockSubscriber.on).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );
  });

  test('should call callback when message is received on the correct channel', () => {
    const channel = 'testChannel';
    const message = 'testMessage';
    const callback = jest.fn();
    service.subscribe(channel, callback);

    const messageHandler = (mockSubscriber as any).on.mock.calls.find(
      (call) => call[0] === 'message',
    )[1];
    messageHandler(channel, message);

    expect(callback).toHaveBeenCalledWith(message);
  });

  test('should not call callback for message on a different channel', () => {
    const channel = 'testChannel';
    const message = 'testMessage';
    const callback = jest.fn();
    service.subscribe(channel, callback);

    const messageHandler = (mockSubscriber as any).on.mock.calls.find(
      (call) => call[0] === 'message',
    )[1];
    messageHandler('otherChannel', message);

    expect(callback).not.toHaveBeenCalled();
  });

  test('should call subscriber.unsubscribe with the correct key', async () => {
    const key = 'testKey';
    service.unsubscribe(key);
    expect(mockSubscriber.unsubscribe).toHaveBeenCalledWith(key);
  });
});
