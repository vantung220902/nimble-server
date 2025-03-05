import { PrismaService } from '@database';
import { CrawlerService } from '@modules/crawler/services';
import { ProcessKeywordsCommand } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.command';
import { ProcessKeywordsHandler } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.handler';
import { ProcessKeywordsRequestBody } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.request-body';
import { SearchKeywordManagementService } from '@modules/search-keyword-management/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { ProcessingStatus } from '@prisma/client';
import { RedisService } from '@redis/services';
import { Cache } from 'cache-manager';

describe('ProcessKeywordsHandler', () => {
  let handler: ProcessKeywordsHandler;
  let prismaService: jest.MockedObject<PrismaService>;
  let searchKeywordManagementService: jest.MockedObject<SearchKeywordManagementService>;
  let redisService: jest.MockedObject<RedisService>;
  let crawlerService: jest.MockedObject<CrawlerService>;
  let cacheService: jest.MockedObject<Cache>;

  const mockConnectionId = '7e97e07f-843f-4ff4-b168-2854104118c7';
  const mockKeywordId = '068e657a-60fc-472d-ae6b-cebc0a91eff1';
  const mockUserId = '7e97e07f-843f-4ff4-b168-2854104118c7';
  const mockProcessingKeywordChannel = `keywordsConnectionId:${mockConnectionId}`;
  const mockPrefixKeywordCacheKey = 'keywordResult:';
  const mockKeyword = 'Nimble';
  const mockProcessKeywordsRequestBody: ProcessKeywordsRequestBody = {
    keywords: [mockKeyword, 'Fullstack'],
    connectionId: mockConnectionId,
    fileUploadId: mockKeywordId,
  };

  const mockCommand = new ProcessKeywordsCommand(
    mockProcessKeywordsRequestBody,
    mockUserId,
  );

  const mockCrawlerResponse = {
    keyword: mockKeyword,
    content: mockKeyword,
    totalAds: 5,
    totalLinks: 10,
    id: mockKeywordId,
    status: '',
  };

  beforeEach(async () => {
    prismaService = {
      keyword: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      userKeywordUpload: {
        create: jest.fn(),
        upsert: jest.fn(),
        createMany: jest.fn(),
      },
      fileKeywordsUpload: {
        update: jest.fn(),
        upsert: jest.fn(),
      },
    } as any as jest.MockedObject<PrismaService>;

    searchKeywordManagementService = {
      getProcessingKeywordChannel: jest.fn(),
      getCacheKey: jest.fn(),
    } as jest.MockedObject<SearchKeywordManagementService>;

    redisService = {
      publish: jest.fn(),
    } as jest.MockedObject<RedisService>;

    crawlerService = {
      crawlKeyword: jest.fn(),
    } as jest.MockedObject<CrawlerService>;

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
    } as jest.MockedObject<Cache>;

    const module = await Test.createTestingModule({
      providers: [
        ProcessKeywordsHandler,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: SearchKeywordManagementService,
          useValue: searchKeywordManagementService,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
        {
          provide: CrawlerService,
          useValue: crawlerService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheService,
        },
      ],
    }).compile();

    handler = module.get<ProcessKeywordsHandler>(ProcessKeywordsHandler);
  });

  describe('execute', () => {
    beforeEach(() => {
      searchKeywordManagementService.getProcessingKeywordChannel.mockReturnValue(
        mockProcessingKeywordChannel,
      );
      searchKeywordManagementService.getCacheKey.mockImplementation(
        (k) => `${mockPrefixKeywordCacheKey}:${k}`,
      );
    });

    it('should process new keywords successfully', async () => {
      cacheService.get.mockResolvedValue(null);
      crawlerService.crawlKeyword.mockResolvedValue(mockCrawlerResponse);
      (prismaService.keyword.upsert as jest.Mock).mockResolvedValue({
        id: mockKeywordId,
      });
      (prismaService.userKeywordUpload.upsert as jest.Mock).mockResolvedValue(
        {},
      );

      const processKeywordsResponse = await handler.execute(mockCommand);

      expect(processKeywordsResponse).toHaveLength(2);
      expect(processKeywordsResponse[0].status).toBe(
        ProcessingStatus.COMPLETED,
      );
      expect(prismaService.keyword.upsert).toHaveBeenCalled();
      expect(prismaService.userKeywordUpload.upsert).toHaveBeenCalled();
      expect(redisService.publish).toHaveBeenCalled();
    });

    it('should handle cached keywords', async () => {
      cacheService.get.mockResolvedValue(
        `${mockPrefixKeywordCacheKey}${mockKeyword}`,
      );

      await handler.execute(mockCommand);

      expect(prismaService.userKeywordUpload.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            status: ProcessingStatus.COMPLETED,
            fileUploadId: mockCommand.body.fileUploadId,
          }),
        ]),
      });
    });

    it('should handle crawler service errors', async () => {
      cacheService.get.mockResolvedValue(null);

      crawlerService.crawlKeyword.mockRejectedValue(
        new Error('Somethings wrong'),
      );

      mockCrawlerResponse.status = ProcessingStatus.FAILED;

      (prismaService.keyword.findMany as jest.Mock).mockResolvedValue([
        mockCrawlerResponse,
      ]);
      handler['processKeywordsWithConcurrency'] = jest
        .fn()
        .mockResolvedValue([mockCrawlerResponse]);

      const processKeywordsResponse = await handler.execute(mockCommand);

      expect(processKeywordsResponse[0].status).toBe(ProcessingStatus.FAILED);
    });

    it('should handle duplicate keywords', async () => {
      mockProcessKeywordsRequestBody.keywords = [
        mockKeyword,
        mockKeyword,
        mockKeyword,
      ];

      const commandWithDuplicates = new ProcessKeywordsCommand(
        mockProcessKeywordsRequestBody,
        mockUserId,
      );

      cacheService.get.mockResolvedValue(null);
      mockCrawlerResponse.status = ProcessingStatus.COMPLETED;
      crawlerService.crawlKeyword.mockResolvedValue(mockCrawlerResponse);
      (prismaService.keyword.findMany as jest.Mock).mockResolvedValue([
        mockCrawlerResponse,
      ]);

      handler['processKeywordsWithConcurrency'] = jest
        .fn()
        .mockResolvedValue([mockCrawlerResponse]);

      const processKeywordsResponse = await handler.execute(
        commandWithDuplicates,
      );

      expect(processKeywordsResponse).toHaveLength(1);
    });
  });
});
