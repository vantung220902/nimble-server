import { QueryHandlerBase } from '@common/cqrs';
import { PrismaService } from '@database';
import { GetKeywordQuery } from '@modules/search-keyword-management/application/queries/get-keyword/get-keyword.query';
import { GetKeywordQueryResponse } from '@modules/search-keyword-management/application/queries/get-keyword/get-keyword.response';
import { BadRequestException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';

@QueryHandler(GetKeywordQuery)
export class GetKeywordHandler extends QueryHandlerBase<
  GetKeywordQuery,
  GetKeywordQueryResponse
> {
  constructor(private readonly dbContext: PrismaService) {
    super();
  }

  public async execute(
    query: GetKeywordQuery,
  ): Promise<GetKeywordQueryResponse> {
    const keyword = await this.getKeywords(query);

    return this.map(keyword);
  }

  private async getKeywords({ reqUser, id }: GetKeywordQuery) {
    const foundKeyword = await this.dbContext.keyword.findUnique({
      where: {
        id,
      },
      include: {
        crawledContent: {
          select: {
            totalGoogleAds: true,
            totalLinks: true,
            content: true,
          },
        },
        fileUploads: {
          where: {
            fileUpload: {
              userId: reqUser.sub,
            },
          },
          select: {
            status: true,
          },
          orderBy: {
            resolvedAt: Prisma.SortOrder.desc,
          },
          take: 1,
        },
      },
    });

    if (!foundKeyword) {
      throw new BadRequestException('The keyword does not exist!');
    }

    return foundKeyword;
  }

  private map({
    id,
    content,
    crawledContent,
    createdAt,
    fileUploads,
    resolvedAt,
  }: Awaited<
    ReturnType<GetKeywordHandler['getKeywords']>
  >): GetKeywordQueryResponse {
    return {
      status: fileUploads[0]?.status,
      id,
      content,
      crawledContent,
      createdAt,
      resolvedAt,
    };
  }
}
