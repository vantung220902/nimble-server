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
    const andWhereConditions: Prisma.Enumerable<Prisma.UserKeywordUploadWhereInput> =
      [
        {
          fileUpload: {
            userId: reqUser.sub,
          },
        },
      ];

    if (fileUploadId) {
      andWhereConditions.push({
        fileUploadId,
      });
    }

    if (search) {
      andWhereConditions.push({
        keyword: {
          OR: [
            { content: filterOperationByMode(search) },
            {
              crawledContent: {
                content: filterOperationByMode(search),
              },
            },
          ],
        },
      });
    }

    const [foundKeywords, totalKeywords] = await Promise.all([
      this.dbContext.userKeywordUpload.findMany({
        where: {
          AND: andWhereConditions,
        },
        select: {
          keywordId: true,
          resolvedAt: true,
          createdAt: true,
          status: true,
          keyword: {
            select: {
              content: true,
            },
          },
        },
        take,
        skip,
        orderBy: {
          resolvedAt: Prisma.SortOrder.desc,
        },
      }),
      this.dbContext.userKeywordUpload.count({
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
      ({ keyword: { content }, keywordId, status, createdAt, resolvedAt }) => ({
        id: keywordId,
        status,
        content,
        createdAt,
        resolvedAt,
      }),
    );
  }
}
