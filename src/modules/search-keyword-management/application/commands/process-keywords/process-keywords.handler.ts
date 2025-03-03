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

  private async handleCompletedKeywords(
    fileUploadId: string,
    { content, keyword, totalAds, totalLinks }: CrawledGoogleResponse,
  ) {
    const createdKeyword = await this.dbContext.keyword.upsert({
      where: {
        content: keyword,
      },
      create: {
        content: keyword,
        resolvedAt: new Date(),
        crawledContent: {
          create: {
            totalGoogleAds: totalAds,
            totalLinks,
            content,
          },
        },
      },
      update: {
        resolvedAt: new Date(),
        crawledContent: {
          update: {
            totalGoogleAds: totalAds,
            totalLinks,
            content,
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
        this.searchKeywordManagementService.getCacheKey(keyword),
        createdKeyword.id,
        EXPIRATION_KEYWORD_SECONDS,
      ),
    ]);
  }

  private async handleFailedKeywords(
    processedKeywords: ProcessKeywordsCommandResponse[],
    fileUploadId: string,
  ) {
    const keywords = processedKeywords
      .filter((keyword) => keyword.status === ProcessingStatus.FAILED)
      .map(({ keyword }) => keyword);

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
      keywords.map(async (keyword) => {
        let failedKeyword = failedKeywords.find((fk) => fk.content === keyword);

        if (!failedKeyword) {
          failedKeyword = await this.dbContext.keyword.create({
            data: {
              content: keyword,
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
      const insertingKeywords = cachedKeywords.map(({ keywordId }) => ({
        status: ProcessingStatus.COMPLETED,
        fileUploadId,
        keywordId,
      }));

      await this.dbContext.userKeywordUpload.createMany({
        data: insertingKeywords,
      });

      this.redisService.publish(
        processingKeywordChannel,
        JSON.stringify({
          data: insertingKeywords,
        }),
      );
    }

    if (uncachedKeywords.length === 0) return [];

    this.redisService.publish(
      processingKeywordChannel,
      JSON.stringify({
        data: uncachedKeywords.map((keyword) => ({
          keyword,
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

    console.log('processedKeywords', processedKeywords);

    await this.handleFailedKeywords(processedKeywords, fileUploadId);

    return processedKeywords;
  }

  private async processKeyword({
    keyword,
    fileUploadId,
    channel,
  }: {
    keyword: string;
    fileUploadId: string;
    channel: string;
  }): Promise<ProcessKeywordsCommandResponse> {
    const response: ProcessKeywordsCommandResponse = {
      keyword,
      status: ProcessingStatus.PROCESSING,
    };

    try {
      const crawledResponse = await this.crawlerService.crawlKeyword(keyword);
      response.status = ProcessingStatus.COMPLETED;
      await this.handleCompletedKeywords(fileUploadId, crawledResponse);
    } catch (error) {
      this.logger.error(
        `CrawlerService crawlKeyword Error for "${keyword}": ${error}`,
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
      const batchPromises = batch.map((keyword) =>
        this.processKeyword({ keyword, fileUploadId, channel }),
      );

      const batchProcessedKeywords = await Promise.all(batchPromises);
      processKeywords.push(...batchProcessedKeywords);
    }

    return processKeywords;
  }

  private async separateKeywords(keywords: string[]) {
    const cachedKeywords: Array<{ keywordId: string; keyword: string }> = [];
    const uncachedKeywords: string[] = [];

    await Promise.all(
      keywords.map(async (keyword) => {
        keyword = keyword.toLowerCase();

        const cacheKey =
          this.searchKeywordManagementService.getCacheKey(keyword);
        const keywordId = await this.cacheService.get<string>(cacheKey);

        if (keywordId) {
          cachedKeywords.push({ keywordId, keyword });
        } else {
          uncachedKeywords.push(keyword);
        }
      }),
    );

    return { cachedKeywords, uncachedKeywords };
  }
}
