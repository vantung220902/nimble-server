import { SearchKeywordManagementService } from '@modules/search-keyword-management/services/search-keyword-management.service';
import { Test } from '@nestjs/testing';
import { ProcessingStatus } from '@prisma/client';
import { RedisService } from '@redis/services';
import { firstValueFrom } from 'rxjs';

describe('SearchKeywordManagementService', () => {
  let service: SearchKeywordManagementService;
  let redisService: jest.MockedObject<RedisService>;
  const mockConnectionId = '7e97e07f-843f-4ff4-b168-2854104118c7';
  const mockKeywordId = '068e657a-60fc-472d-ae6b-cebc0a91eff1';
  const mockProcessingKeywordChannel = `keywordsConnectionId:${mockConnectionId}`;
  const mockTriggerKeyword = 'triggerKeyword';
  const mockPrefixCacheKey = 'keywordResult:';
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
    } as jest.MockedObject<RedisService>;

    const module = await Test.createTestingModule({
      providers: [
        SearchKeywordManagementService,
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    service = module.get<SearchKeywordManagementService>(
      SearchKeywordManagementService,
    );
  });

  describe('getProcessingKeywordChannel', () => {
    it('should return correct channel name', () => {
      expect(service.getProcessingKeywordChannel(mockConnectionId)).toBe(
        mockProcessingKeywordChannel,
      );
    });
  });

  describe('getTriggerProcessKeywordChannel', () => {
    it('should return correct channel name', () => {
      expect(service.getTriggerProcessKeywordChannel()).toBe(
        mockTriggerKeyword,
      );
    });
  });

  describe('getCacheKey', () => {
    it('should return formatted cache key', () => {
      const testCacheKeywords = ['Nimble', 'AI', 'Full stack'].map(
        (keyword) => ({
          keyword,
          expected: `${mockPrefixCacheKey}${keyword.toLowerCase()}`,
        }),
      );

      testCacheKeywords.forEach(({ keyword, expected }) => {
        expect(service.getCacheKey(keyword)).toBe(expected);
      });
    });
  });

  describe('subscribeKeywordStream', () => {
    it('should create observable and subscribe to Redis channel', async () => {
      let subscriptionCallback: (message: string) => void;

      redisService.subscribe.mockImplementation((_, callback) => {
        subscriptionCallback = callback;
      });

      const observable = service.subscribeKeywordStream(mockConnectionId);
      const promise = firstValueFrom(observable);

      subscriptionCallback(mockMessage);

      const result = await promise;

      expect(result).toBe(mockMessage);
      expect(redisService.subscribe).toHaveBeenCalledWith(
        mockProcessingKeywordChannel,
        expect.any(Function),
      );
    });

    it('should handle multiple messages', async () => {
      const messages = [
        JSON.stringify({
          data: [mockKeywordResponse],
        }),
        JSON.stringify({
          data: [mockKeywordResponse],
        }),
        JSON.stringify({
          data: [mockKeywordResponse],
        }),
      ];
      const receivedMessages: string[] = [];

      redisService.subscribe.mockImplementation((_, callback) => {
        messages.forEach((msg) => callback(msg));
      });

      const subscription = service
        .subscribeKeywordStream(mockConnectionId)
        .subscribe((message) => {
          receivedMessages.push(message);
        });

      await new Promise((resolve) => setTimeout(resolve, 0));
      subscription.unsubscribe();

      expect(receivedMessages).toEqual(messages);
      expect(redisService.subscribe).toHaveBeenCalledWith(
        mockProcessingKeywordChannel,
        expect.any(Function),
      );
    });

    it('should handle subscription errors', async () => {
      const error = new Error('Somethings wrong');
      redisService.subscribe.mockImplementation(() => {
        throw error;
      });

      await expect(
        firstValueFrom(service.subscribeKeywordStream(mockConnectionId)),
      ).rejects.toThrow(error);
    });
  });
});
