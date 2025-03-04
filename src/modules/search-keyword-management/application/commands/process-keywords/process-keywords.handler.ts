import { CommandHandlerBase } from '@common/cqrs';
import { PrismaService } from '@database';
import { EXPIRATION_KEYWORD_SECONDS } from '@modules/crawler/crawler.enum';
import { CrawledGoogleResponse } from '@modules/crawler/interfaces';
import { CrawlerService } from '@modules/crawler/services';
import { ProcessKeywordsCommand } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.command';
import { ProcessKeywordsCommandResponse } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.response';
import { CONCURRENCY_KEYWORDS_LIMIT } from '@modules/search-keyword-management/search-keyword-management.enum';
import { SearchKeywordManagementService } from '@modules/search-keyword-management/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { ProcessingStatus } from '@prisma/client';
import { RedisService } from '@redis/services';
import { Cache } from 'cache-manager';

@CommandHandler(ProcessKeywordsCommand)
export class ProcessKeywordsHandler extends CommandHandlerBase<
  ProcessKeywordsCommand,
  ProcessKeywordsCommandResponse[]
> {
  constructor(
    private readonly dbContext: PrismaService,
    private readonly searchKeywordManagementService: SearchKeywordManagementService,
    private readonly redisService: RedisService,
    private readonly crawlerService: CrawlerService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {
    super();
  }

  public execute(
    command: ProcessKeywordsCommand,
  ): Promise<ProcessKeywordsCommandResponse[]> {
    return this.process(command);
  }

  private async handleCompletedKeywords({
    content,
    fileUploadId,
    crawledResponse,
  }: {
    fileUploadId: string;
    content: string;
    crawledResponse: CrawledGoogleResponse;
  }) {
    console.log('crawlContent', crawledResponse);

    const crawlContentPayload = {
      totalGoogleAds: crawledResponse.totalAds,
      totalLinks: crawledResponse.totalLinks,
      content: crawledResponse.content,
    };

    const createdKeyword = await this.dbContext.keyword.upsert({
      where: {
        content,
      },
      create: {
        content,
        resolvedAt: new Date(),
        crawledContent: {
          create: crawlContentPayload,
        },
      },
      update: {
        resolvedAt: new Date(),
        crawledContent: {
          upsert: {
            create: crawlContentPayload,
            update: crawlContentPayload,
          },
        },
      },
    });

    await Promise.all([
      this.dbContext.userKeywordUpload.create({
        data: {
          status: ProcessingStatus.COMPLETED,
          fileUploadId,
          keywordId: createdKeyword.id,
        },
      }),
      this.cacheService.set(
        this.searchKeywordManagementService.getCacheKey(content.toLowerCase()),
        createdKeyword.id,
        EXPIRATION_KEYWORD_SECONDS,
      ),
    ]);

    return createdKeyword;
  }

  private async handleFailedKeywords({
    processedKeywords,
    fileUploadId,
  }: {
    processedKeywords: ProcessKeywordsCommandResponse[];
    fileUploadId: string;
  }) {
    const keywords = processedKeywords
      .filter((keyword) => keyword.status === ProcessingStatus.FAILED)
      .map(({ content }) => content);

    const failedKeywords = await this.dbContext.keyword.findMany({
      where: {
        content: {
          in: keywords,
        },
      },
      select: {
        content: true,
        id: true,
      },
    });

    await Promise.all(
      keywords.map(async (content) => {
        let failedKeyword = failedKeywords.find((fk) => fk.content === content);

        if (!failedKeyword) {
          failedKeyword = await this.dbContext.keyword.create({
            data: {
              content,
            },
          });
        }

        return this.dbContext.userKeywordUpload.create({
          data: {
            fileUploadId,
            keywordId: failedKeyword.id,
            status: ProcessingStatus.FAILED,
            resolvedAt: new Date(),
          },
        });
      }),
    );
  }

  private async process({
    body: { keywords, connectionId, fileUploadId },
  }: ProcessKeywordsCommand): Promise<ProcessKeywordsCommandResponse[]> {
    const uniqueKeywords = [...new Set(keywords)];
    const processingKeywordChannel =
      this.searchKeywordManagementService.getProcessingKeywordChannel(
        connectionId,
      );

    const { cachedKeywords, uncachedKeywords } =
      await this.separateKeywords(uniqueKeywords);

    if (cachedKeywords.length > 0) {
      await this.dbContext.userKeywordUpload.createMany({
        data: cachedKeywords.map(({ keywordId }) => ({
          status: ProcessingStatus.COMPLETED,
          fileUploadId,
          keywordId,
        })),
      });

      this.redisService.publish(
        processingKeywordChannel,
        JSON.stringify({
          data: cachedKeywords.map(({ content, keywordId }) => ({
            status: ProcessingStatus.COMPLETED,
            fileUploadId,
            content,
            id: keywordId,
          })),
        }),
      );
    }

    if (cachedKeywords.length === uniqueKeywords.length) return [];

    this.redisService.publish(
      processingKeywordChannel,
      JSON.stringify({
        data: uncachedKeywords.map((content) => ({
          content,
          fileUploadId,
          status: ProcessingStatus.PROCESSING,
        })),
      }),
    );

    const processedKeywords = await this.processKeywordsWithConcurrency({
      keywords: uncachedKeywords,
      fileUploadId,
      channel: processingKeywordChannel,
    });

    await this.handleFailedKeywords({
      processedKeywords,
      fileUploadId,
    });

    await this.dbContext.fileKeywordsUpload.update({
      where: {
        id: fileUploadId,
      },
      data: {
        status: ProcessingStatus.COMPLETED,
      },
    });

    return processedKeywords;
  }

  private async processKeyword({
    content,
    fileUploadId,
    channel,
  }: {
    content: string;
    fileUploadId: string;
    channel: string;
  }): Promise<ProcessKeywordsCommandResponse> {
    const response: ProcessKeywordsCommandResponse = {
      content,
      status: ProcessingStatus.PROCESSING,
    };

    try {
      const crawledResponse = await this.crawlerService.crawlKeyword(content);

      response.status = ProcessingStatus.COMPLETED;
      const createdKeyword = await this.handleCompletedKeywords({
        fileUploadId,
        content,
        crawledResponse,
      });

      response.id = createdKeyword.id;
    } catch (error) {
      this.logger.error(
        `CrawlerService crawlKeyword Error for "${content}": ${error}`,
      );
      response.status = ProcessingStatus.FAILED;
    }

    this.redisService.publish(
      channel,
      JSON.stringify({
        data: [response],
      }),
    );

    return response;
  }

  private async processKeywordsWithConcurrency({
    keywords,
    fileUploadId,
    channel,
  }: {
    keywords: string[];
    fileUploadId: string;
    channel: string;
  }): Promise<ProcessKeywordsCommandResponse[]> {
    const processKeywords: ProcessKeywordsCommandResponse[] = [];
    const queue = Array.from(keywords);

    while (queue.length > 0) {
      const batch = queue.splice(0, CONCURRENCY_KEYWORDS_LIMIT);
      const batchPromises = batch.map((content) =>
        this.processKeyword({ content, fileUploadId, channel }),
      );

      const batchProcessedKeywords = await Promise.all(batchPromises);
      processKeywords.push(...batchProcessedKeywords);
    }

    return processKeywords;
  }

  private async separateKeywords(keywords: string[]) {
    const cachedKeywords: Array<{ keywordId: string; content: string }> = [];
    const uncachedKeywords: string[] = [];

    await Promise.all(
      keywords.map(async (content) => {
        const cacheKey = this.searchKeywordManagementService.getCacheKey(
          content.toLowerCase(),
        );
        const keywordId = await this.cacheService.get<string>(cacheKey);

        if (keywordId) {
          cachedKeywords.push({ keywordId, content });
        } else {
          uncachedKeywords.push(content);
        }
      }),
    );

    return { cachedKeywords, uncachedKeywords };
  }
}
