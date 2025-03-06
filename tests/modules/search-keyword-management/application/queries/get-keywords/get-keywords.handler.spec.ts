import { PrismaService } from '@database';
import { GetKeywordsHandler } from '@modules/search-keyword-management/application/queries/get-keywords/get-keywords.handler';
import { GetKeywordsQuery } from '@modules/search-keyword-management/application/queries/get-keywords/get-keywords.query';
import { GetKeywordsRequestQuery } from '@modules/search-keyword-management/application/queries/get-keywords/get-keywords.request-query';
import { Test } from '@nestjs/testing';
import { Prisma, ProcessingStatus, UserStatus } from '@prisma/client';
import { omit } from 'lodash';

describe('GetKeywordsHandler', () => {
  let handler: GetKeywordsHandler;
  let prismaService: jest.MockedObject<PrismaService>;

  const mockFileUploadId = '7e97e07f-843f-4ff4-b168-2854104118c7';
  const mockKeywordId = '068e657a-60fc-472d-ae6b-cebc0a91eff1';
  const mockSearch = 'Nimble';
  const mockReqUser = {
    sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
    email: 'example@google.com',
    status: UserStatus.ACTIVE,
  };

  const mockGetKeywordsRequestQuery: GetKeywordsRequestQuery = {
    take: 10,
    skip: 0,
    fileUploadId: mockFileUploadId,
    search: mockSearch,
  };
  const mockGetKeywordsRequestQueryWithoutSearch: GetKeywordsRequestQuery = {
    take: 10,
    skip: 0,
  };

  const mockKeywords = [
    {
      id: mockKeywordId,
      content: mockSearch,
      createdAt: new Date(),
      resolvedAt: new Date(),
      fileUploads: [
        {
          status: ProcessingStatus.COMPLETED,
        },
      ],
    },
  ];

  beforeEach(async () => {
    prismaService = {
      keyword: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as any as jest.MockedObject<PrismaService>;

    const testModule = await Test.createTestingModule({
      providers: [
        GetKeywordsHandler,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    handler = testModule.get<GetKeywordsHandler>(GetKeywordsHandler);
  });

  describe('execute', () => {
    const mockQuery = new GetKeywordsQuery(
      mockReqUser,
      mockGetKeywordsRequestQuery,
    );

    it('should return paginated keywords', async () => {
      (prismaService.keyword.findMany as jest.Mock).mockResolvedValue(
        mockKeywords,
      );
      (prismaService.keyword.count as jest.Mock).mockResolvedValue(1);

      const getKeywordsResponse = await handler.execute(mockQuery);
      expect(getKeywordsResponse).toEqual({
        records: mockKeywords.map((keyword) => ({
          status: keyword.fileUploads[0].status,
          ...omit(keyword, 'fileUploads'),
        })),
        skippedRecords: 0,
        totalRecords: 1,
        payloadSize: 1,
        hasNext: false,
      });

      expect(prismaService.keyword.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              fileUploads: {
                some: {
                  fileUpload: {
                    userId: mockReqUser.sub,
                  },
                },
              },
            },
            {
              fileUploads: {
                some: {
                  fileUploadId: mockFileUploadId,
                },
              },
            },
            {
              content: expect.any(Object),
            },
          ],
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
                userId: mockReqUser.sub,
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
        take: mockGetKeywordsRequestQuery.take,
        skip: mockGetKeywordsRequestQuery.skip,
        orderBy: {
          resolvedAt: Prisma.SortOrder.desc,
        },
      });
    });

    it('should handle empty search parameter', async () => {
      const queryWithoutSearch = new GetKeywordsQuery(
        mockReqUser,
        mockGetKeywordsRequestQueryWithoutSearch,
      );

      (prismaService.keyword.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.keyword.count as jest.Mock).mockResolvedValue(0);

      await handler.execute(queryWithoutSearch);

      expect(prismaService.keyword.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              {
                fileUploads: {
                  some: {
                    fileUpload: {
                      userId: mockReqUser.sub,
                    },
                  },
                },
              },
            ],
          },
        }),
      );
    });

    it('should handle database errors', async () => {
      const error = new Error('Somethings wrong');
      (prismaService.keyword.findMany as jest.Mock).mockRejectedValue(error);

      await expect(handler.execute(mockQuery)).rejects.toThrow(error);
    });
  });
});
