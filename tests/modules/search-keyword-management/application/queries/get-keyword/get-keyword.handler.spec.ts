import { PrismaService } from '@database';
import { GetKeywordHandler } from '@modules/search-keyword-management/application/queries/get-keyword/get-keyword.handler';
import { GetKeywordQuery } from '@modules/search-keyword-management/application/queries/get-keyword/get-keyword.query';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma, ProcessingStatus, UserStatus } from '@prisma/client';
import { omit } from 'lodash';

describe('GetKeywordHandler', () => {
  let handler: GetKeywordHandler;
  let prismaService: jest.MockedObject<PrismaService>;

  const mockKeywordId = '068e657a-60fc-472d-ae6b-cebc0a91eff1';
  const mockContent = 'Nimble';
  const mockReqUser = {
    sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
    email: 'example@google.com',
    status: UserStatus.ACTIVE,
  };
  const mockQuery = new GetKeywordQuery(mockReqUser, mockKeywordId);

  const mockKeywordResponse = {
    id: mockKeywordId,
    content: mockContent,
    createdAt: new Date(),
    resolvedAt: new Date(),
    crawledContent: {
      totalGoogleAds: 5,
      totalLinks: 10,
      content: '<html>Nimble</html>',
    },
    fileUploads: [
      {
        status: ProcessingStatus.COMPLETED,
      },
    ],
  };

  beforeEach(async () => {
    prismaService = {
      keyword: {
        findUnique: jest.fn(),
      },
    } as any as jest.MockedObject<PrismaService>;

    const testModule = await Test.createTestingModule({
      providers: [
        GetKeywordHandler,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    handler = testModule.get<GetKeywordHandler>(GetKeywordHandler);
  });

  describe('execute', () => {
    it('should return keyword details successfully', async () => {
      (prismaService.keyword.findUnique as jest.Mock).mockResolvedValue(
        mockKeywordResponse,
      );

      const getKeywordResponse = await handler.execute(mockQuery);

      expect(getKeywordResponse).toEqual({
        status: mockKeywordResponse.fileUploads[0].status,
        ...omit(mockKeywordResponse, 'fileUploads'),
      });

      expect(prismaService.keyword.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockQuery.id,
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
      });
    });

    it('should throw BadRequestException if keyword does not exist', async () => {
      (prismaService.keyword.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(handler.execute(mockQuery)).rejects.toThrow(
        new BadRequestException('The keyword does not exist!'),
      );

      expect(prismaService.keyword.findUnique).toHaveBeenCalledWith(
        expect.any(Object),
      );
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (prismaService.keyword.findUnique as jest.Mock).mockRejectedValue(error);

      await expect(handler.execute(mockQuery)).rejects.toThrow(error);
    });

    it('should handle empty fileUploads array', async () => {
      const keywordWithNoUploads = {
        ...mockKeywordResponse,
        fileUploads: [],
      };

      (prismaService.keyword.findUnique as jest.Mock).mockResolvedValue(
        keywordWithNoUploads,
      );

      const getKeywordResponse = await handler.execute(mockQuery);

      expect(getKeywordResponse.status).toBeUndefined();
    });
  });
});
