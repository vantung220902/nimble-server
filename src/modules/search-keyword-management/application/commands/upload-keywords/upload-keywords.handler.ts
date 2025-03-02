import { CommandHandlerBase } from '@common/cqrs';
import { PrismaService } from '@database';
import { FileService } from '@modules/file/services';
import { ProcessKeywordsCommand } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.command';
import { ProcessKeywordsRequestBody } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.request-body';
import { MAXIMUM_KEYWORDS_PROCESS } from '@modules/search-keyword-management/search-keyword-management.enum';
import { BadRequestException } from '@nestjs/common';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { ProcessingStatus } from '@prisma/client';
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
    private commandBus: CommandBus,
  ) {
    super();
  }

  public execute(
    command: UploadKeywordsCommand,
  ): Promise<UploadKeywordsCommandResponse> {
    return this.upload(command);
  }

  private async triggerProcessKeywords(option: ProcessKeywordsRequestBody) {
    return this.commandBus.execute(new ProcessKeywordsCommand(option));
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
      keywords,
      connectionId,
      fileUploadId: createdFileKeywords.id,
    });

    return {
      connectionId,
      totalKeyword: keywords.length,
    };
  }
}
