import { ProcessKeywordsCommand } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.command';
import { SearchKeywordManagementService } from '@modules/search-keyword-management/services';
import { SearchKeywordManagementSubscriber } from '@modules/search-keyword-management/services/search-keyword-management.subscriber';
import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ProcessingStatus } from '@prisma/client';
import { RedisService } from '@redis/services';

describe('SearchKeywordManagementSubscriber', () => {
  let subscriber: SearchKeywordManagementSubscriber;
  let redisService: jest.MockedObject<RedisService>;
  let searchKeywordManagementService: jest.MockedObject<SearchKeywordManagementService>;
  let commandBus: jest.MockedObject<CommandBus>;
  const mockConnectionId = '7e97e07f-843f-4ff4-b168-2854104118c7';
  const mockKeywordId = '068e657a-60fc-472d-ae6b-cebc0a91eff1';
  const mockTriggerKeyword = 'triggerKeyword';
  const mockKeywordResponse = {
    status: ProcessingStatus.COMPLETED,
    fileUploadId: mockConnectionId,
    keywordId: mockKeywordId,
  };
  const mockMessage = JSON.stringify({
    data: [mockKeywordResponse],
  });

  beforeEach(async () => {
    redisService = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    } as jest.MockedObject<RedisService>;

    searchKeywordManagementService = {
      getTriggerProcessKeywordChannel: jest
        .fn()
        .mockReturnValue(mockTriggerKeyword),
    } as jest.MockedObject<SearchKeywordManagementService>;

    commandBus = {
      execute: jest.fn(),
    } as jest.MockedObject<CommandBus>;

    const module = await Test.createTestingModule({
      providers: [
        SearchKeywordManagementSubscriber,
        {
          provide: RedisService,
          useValue: redisService,
        },
        {
          provide: SearchKeywordManagementService,
          useValue: searchKeywordManagementService,
        },
        {
          provide: CommandBus,
          useValue: commandBus,
        },
      ],
    }).compile();

    subscriber = module.get<SearchKeywordManagementSubscriber>(
      SearchKeywordManagementSubscriber,
    );
  });

  describe('onModuleInit', () => {
    it('should subscribe to process keyword channel', () => {
      subscriber.onModuleInit();

      expect(redisService.subscribe).toHaveBeenCalledWith(
        mockTriggerKeyword,
        expect.any(Function),
      );
    });

    it('should process messages correctly', async () => {
      let subscriptionCallback: (message: string) => void;
      redisService.subscribe.mockImplementation((_, callback) => {
        subscriptionCallback = callback;
      });

      subscriber.onModuleInit();
      subscriptionCallback(mockMessage);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(ProcessKeywordsCommand),
      );
    });

    it('should handle invalid JSON messages', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();
      const invalidMessage = 'invalid';

      let subscriptionCallback: (message: string) => void;
      redisService.subscribe.mockImplementation((_, callback) => {
        subscriptionCallback = callback;
      });

      subscriber.onModuleInit();
      subscriptionCallback(invalidMessage);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error processing Redis message'),
      );
      loggerSpy.mockRestore();
    });
  });

  describe('onModuleDestroy', () => {
    it('should unsubscribe from process keyword channel', () => {
      subscriber.onModuleDestroy();

      expect(redisService.unsubscribe).toHaveBeenCalledWith(mockTriggerKeyword);
    });
  });

  describe('processMessage', () => {
    it('should handle command execution errors', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      commandBus.execute.mockRejectedValue(new Error('Something went wrong'));

      let subscriptionCallback: (message: string) => void;
      redisService.subscribe.mockImplementation((_, callback) => {
        subscriptionCallback = callback;
      });

      subscriber.onModuleInit();

      subscriptionCallback(mockMessage);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error processing Redis message'),
      );

      loggerSpy.mockRestore();
    });
  });
});
