import { QueryHandlerBase } from '@common/cqrs';
import { Pagination } from '@common/factories';
import { filterOperationByMode } from '@common/utils';
import { PrismaService } from '@database';
import { QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { GetKeywordsQuery } from './get-keywords.query';
import {
  GetKeywordsQueryResponse,
  GetKeywordsResponse,
} from './get-keywords.response';

@QueryHandler(GetKeywordsQuery)
export class GetKeywordsHandler extends QueryHandlerBase<
  GetKeywordsQuery,
  GetKeywordsQueryResponse
> {
  constructor(private readonly dbContext: PrismaService) {
    super();
  }

  public async execute(
    query: GetKeywordsQuery,
  ): Promise<GetKeywordsQueryResponse> {
    const { totalKeywords, foundKeywords } = await this.getKeywords(query);
    const {
      query: { skip, take },
    } = query;

    return Pagination.of(
      { skip, take },
      totalKeywords,
      this.map(foundKeywords),
    );
  }

  private async getKeywords({
    reqUser,
    query: { take, skip, fileUploadId, search },
  }: GetKeywordsQuery) {
    const andWhereConditions: Prisma.Enumerable<Prisma.KeywordWhereInput> = [
      {
        fileUploads: {
          some: {
            fileUpload: {
              userId: reqUser.sub,
            },
          },
        },
      },
    ];

    if (fileUploadId) {
      andWhereConditions.push({
        fileUploads: {
          some: {
            fileUploadId,
          },
        },
      });
    }

    if (search) {
      andWhereConditions.push({ content: filterOperationByMode(search) });
    }

    const [foundKeywords, totalKeywords] = await Promise.all([
      this.dbContext.keyword.findMany({
        where: {
          AND: andWhereConditions,
        },
        select: {
          id: true,
          resolvedAt: true,
          createdAt: true,
          content: true,
          crawledContent: {
            select: {
              totalGoogleAds: true,
              totalLinks: true,
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
        take,
        skip,
        orderBy: {
          resolvedAt: Prisma.SortOrder.desc,
        },
      }),
      this.dbContext.keyword.count({
        where: {
          AND: andWhereConditions,
        },
      }),
    ]);

    return { totalKeywords, foundKeywords };
  }

  private map(
    keywords: Awaited<
      ReturnType<GetKeywordsHandler['getKeywords']>
    >['foundKeywords'],
  ): GetKeywordsResponse[] {
    return keywords.map(
      ({
        createdAt,
        fileUploads,
        content,
        id,
        resolvedAt,
        crawledContent,
      }) => ({
        id,
        status: fileUploads[0].status,
        content,
        createdAt,
        resolvedAt,
        crawledContent,
      }),
    );
  }
}
