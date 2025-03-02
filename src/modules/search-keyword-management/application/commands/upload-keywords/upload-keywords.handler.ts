import { CommandHandlerBase } from '@common/cqrs';
import { PrismaService } from '@database';
import { FileService } from '@modules/file/services';
import { ProcessKeywordsCommand } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.command';
import { MAXIMUM_KEYWORDS_PROCESS } from '@modules/search-keyword-management/search-keyword-management.enum';
import { SearchKeywordManagementService } from '@modules/search-keyword-management/services';
import { BadRequestException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { ProcessingStatus } from '@prisma/client';
import { RedisService } from '@redis/services';
import { UploadKeywordsCommand } from './upload-keywords.command';
import { UploadKeywordsCommandResponse } from './upload-keywords.response';

@CommandHandler(UploadKeywordsCommand)
export class UploadKeywordsHandler extends CommandHandlerBase<
  UploadKeywordsCommand,
  UploadKeywordsCommandResponse
> {
  constructor(
    private readonly dbContext: PrismaService,
    private readonly fileService: FileService,
    private readonly redisService: RedisService,
    private readonly searchKeywordManagementService: SearchKeywordManagementService,
  ) {
    super();
  }

  public execute(
    command: UploadKeywordsCommand,
  ): Promise<UploadKeywordsCommandResponse> {
    return this.upload(command);
  }

  private async triggerProcessKeywords(option: ProcessKeywordsCommand) {
    const processKeywordChannel =
      this.searchKeywordManagementService.getTriggerProcessKeywordChannel();

    return this.redisService.publish(
      processKeywordChannel,
      JSON.stringify(option),
    );
  }

  private async upload({
    body: { url },
    reqUser,
  }: UploadKeywordsCommand): Promise<UploadKeywordsCommandResponse> {
    const keywords = await this.fileService.getContentFromUrl(url);

    if (keywords.length === 0) {
      throw new BadRequestException('Upload empty keywords file!');
    }

    if (keywords.length > MAXIMUM_KEYWORDS_PROCESS) {
      throw new BadRequestException(
        `Upload keywords file must less than ${MAXIMUM_KEYWORDS_PROCESS} keywords!`,
      );
    }

    const createdFileKeywords = await this.dbContext.fileKeywordsUpload.create({
      data: {
        fileUrl: url,
        userId: reqUser.sub,
        totalKeywords: keywords.length,
        status: ProcessingStatus.PENDING,
        uploadedAt: new Date(),
      },
    });
    const connectionId = createdFileKeywords.id;

    await this.triggerProcessKeywords({
      body: {
        keywords,
        connectionId,
        fileUploadId: createdFileKeywords.id,
      },
      userId: createdFileKeywords.userId,
    });

    return {
      connectionId,
      totalKeyword: keywords.length,
    };
  }
}
