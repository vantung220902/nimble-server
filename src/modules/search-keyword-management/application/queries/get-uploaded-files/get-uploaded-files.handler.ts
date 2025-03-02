import { QueryHandlerBase } from '@common/cqrs';
import { Pagination } from '@common/factories';
import { PrismaService } from '@database';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { GetUploadedFilesQuery } from './get-uploaded-files.query';
import { GetUploadedFilesQueryResponse } from './get-uploaded-files.response';

@QueryHandler(GetUploadedFilesQuery)
export class GetUploadedFilesHandler extends QueryHandlerBase<
  GetUploadedFilesQuery,
  GetUploadedFilesQueryResponse
> {
  constructor(private readonly dbContext: PrismaService) {
    super();
  }

  public async execute(
    query: GetUploadedFilesQuery,
  ): Promise<GetUploadedFilesQueryResponse> {
    return this.getUploadedFiles(query);
  }

  private async getUploadedFiles({
    reqUser,
    query: { take, skip },
  }: GetUploadedFilesQuery) {
    const [foundUploadedFiles, totalUploadedFiles] = await Promise.all([
      this.dbContext.fileKeywordsUpload.findMany({
        where: {
          userId: reqUser.sub,
        },
        take,
        skip,
        orderBy: {
          uploadedAt: Prisma.SortOrder.desc,
        },
      }),
      this.dbContext.fileKeywordsUpload.count({
        where: {
          userId: reqUser.sub,
        },
      }),
    ]);

    return Pagination.of(
      { skip, take },
      totalUploadedFiles,
      foundUploadedFiles,
    );
  }
}
