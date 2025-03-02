import { CommandHandlerBase } from '@common/cqrs';
import { PrismaService } from '@database';
import { CrawlerService } from '@modules/crawler/services';
import { ProcessKeywordsCommand } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.command';
import { ProcessKeywordsCommandResponse } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.response';
import { CONCURRENTCY_KEYWORDS_LIMIT } from '@modules/search-keyword-management/search-keyword-management.enum';
import { SearchKeywordManagementService } from '@modules/search-keyword-management/services';
import { CommandHandler } from '@nestjs/cqrs';
import { ProcessingStatus } from '@prisma/client';
import { RedisService } from '@redis/services';

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
  ) {
    super();
  }

  public execute(
    command: ProcessKeywordsCommand,
  ): Promise<ProcessKeywordsCommandResponse[]> {
    return this.process(command);
  }

  private async process({
    body: { keywords, connectionId, fileUploadId },
  }: ProcessKeywordsCommand): Promise<ProcessKeywordsCommandResponse[]> {
    const uniqueKeywords = [...new Set(keywords)];
    const processingKeywordChannel =
      this.searchKeywordManagementService.getProcessingKeywordChannel(
        connectionId,
      );

    const insertingKeywords = uniqueKeywords.map((keyword) => ({
      content: keyword,
      fileUploadId,
      status: ProcessingStatus.PENDING,
    }));

    await Promise.all([
      this.dbContext.keyword.createMany({
        data: insertingKeywords,
      }),
      this.redisService.publish(
        processingKeywordChannel,
        JSON.stringify({
          data: insertingKeywords,
        }),
      ),
    ]);

    const processingKeywords = uniqueKeywords.map(
      (keyword) =>
        ({
          keyword,
          fileUploadId,
          status: ProcessingStatus.PROCESSING,
        }) as ProcessKeywordsCommandResponse,
    );

    this.redisService.publish(
      processingKeywordChannel,
      JSON.stringify({
        data: processingKeywords,
      }),
    );

    const concurrencyLimit = CONCURRENTCY_KEYWORDS_LIMIT;
    const processedKeywords = await this.processKeywordsWithConcurrency(
      uniqueKeywords,
      fileUploadId,
      processingKeywordChannel,
      concurrencyLimit,
    );

    await this.processFailedKeywords(processedKeywords, fileUploadId);

    return processedKeywords;
  }

  private async processFailedKeywords(
    processedKeywords: ProcessKeywordsCommandResponse[],
    fileUploadId: string,
  ) {
    const failedKeywords = processedKeywords
      .filter((keyword) => keyword.status === ProcessingStatus.FAILED)
      .map(({ keyword }) => keyword);

    return this.dbContext.keyword.updateMany({
      where: {
        fileUploadId,
        content: {
          in: failedKeywords,
        },
      },
      data: {
        status: ProcessingStatus.FAILED,
      },
    });
  }

  private async processKeywordsWithConcurrency(
    keywords: string[],
    fileUploadId: string,
    channel: string,
    concurrencyLimit: number,
  ): Promise<ProcessKeywordsCommandResponse[]> {
    const results: ProcessKeywordsCommandResponse[] = [];
    const queue = [...keywords];

    while (queue.length > 0) {
      const batch = queue.splice(0, concurrencyLimit);
      const batchPromises = batch.map(async (keyword) => {
        const response = {
          keyword,
          fileUploadId,
          status: ProcessingStatus.PROCESSING,
        } as ProcessKeywordsCommandResponse;

        try {
          const crawledResponse =
            await this.crawlerService.crawlKeyword(keyword);

          response.status = ProcessingStatus.COMPLETED;
          response.searchResult = crawledResponse;

          await this.processSuccessKeywords(response, fileUploadId);
        } catch (error) {
          this.logger.error(
            `CrawlerService crawlKeyword Error for "${keyword}": ${error}`,
          );
          response.status = ProcessingStatus.FAILED;
        }

        await this.redisService.publish(
          channel,
          JSON.stringify({
            data: [response],
          }),
        );

        return response;
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  private async processSuccessKeywords(
    processedResponse: ProcessKeywordsCommandResponse,
    fileUploadId: string,
  ) {
    return this.dbContext.keyword.update({
      where: {
        fileUploadId_content: {
          fileUploadId,
          content: processedResponse.keyword,
        },
      },
      data: {
        status: ProcessingStatus.COMPLETED,
        crawledContent: {
          create: {
            content: processedResponse.searchResult.content,
            totalGoogleAds: processedResponse.searchResult.totalAds,
            totalLinks: processedResponse.searchResult.totalLinks,
          },
        },
      },
    });
  }
}
