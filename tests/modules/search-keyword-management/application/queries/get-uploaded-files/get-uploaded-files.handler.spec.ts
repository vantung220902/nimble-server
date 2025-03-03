import { PrismaService } from '@database';
import { GetUploadedFilesHandler } from '@modules/search-keyword-management/application/queries/get-uploaded-files/get-uploaded-files.handler';
import { GetUploadedFilesQuery } from '@modules/search-keyword-management/application/queries/get-uploaded-files/get-uploaded-files.query';
import { GetUploadedFilesRequestQuery } from '@modules/search-keyword-management/application/queries/get-uploaded-files/get-uploaded-files.request-query';
import { Test } from '@nestjs/testing';
import { Prisma, ProcessingStatus, UserStatus } from '@prisma/client';

describe('GetUploadedFilesHandler', () => {
  let handler: GetUploadedFilesHandler;
  let prismaService: jest.MockedObject<PrismaService>;

  const mockReqUser = {
    sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
    email: 'example@google.com',
    status: UserStatus.ACTIVE,
  };
  const mockGetUploadedFilesRequestQuery: GetUploadedFilesRequestQuery = {
    take: 10,
    skip: 0,
  };
  const mockGetUploadedFilesQuery = new GetUploadedFilesQuery(
    mockReqUser,
    mockGetUploadedFilesRequestQuery,
  );

  const mockUploadedFiles = [
    {
      id: '7e97e07f-843f-4ff4-b168-2854104118c7',
      userId: mockReqUser.sub,
      fileUrl: 'https://user-storage-dev/keyword.csv',
      totalKeywords: 5,
      status: ProcessingStatus.COMPLETED,
      uploadedAt: new Date(),
    },
    {
      id: '068e657a-60fc-472d-ae6b-cebc0a91eff1',
      userId: mockReqUser.sub,
      fileUrl: 'https://user-storage-dev/keyword2.csv',
      totalKeywords: 3,
      status: ProcessingStatus.PENDING,
      uploadedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    prismaService = {
      fileKeywordsUpload: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as any as jest.MockedObject<PrismaService>;

    const testModule = await Test.createTestingModule({
      providers: [
        GetUploadedFilesHandler,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    handler = testModule.get<GetUploadedFilesHandler>(GetUploadedFilesHandler);
  });

  describe('execute', () => {
    it('should return paginated uploaded files', async () => {
      (
        prismaService.fileKeywordsUpload.findMany as jest.Mock
      ).mockResolvedValue(mockUploadedFiles);

      (prismaService.fileKeywordsUpload.count as jest.Mock).mockResolvedValue(
        mockUploadedFiles.length,
      );

      const getUploadedFilesResponse = await handler.execute(
        mockGetUploadedFilesQuery,
      );

      expect(getUploadedFilesResponse).toEqual({
        records: mockUploadedFiles,
        skippedRecords: 0,
        totalRecords: 2,
        payloadSize: 2,
        hasNext: false,
      });

      expect(prismaService.fileKeywordsUpload.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockReqUser.sub,
        },
        take: mockGetUploadedFilesRequestQuery.take,
        skip: mockGetUploadedFilesRequestQuery.skip,
        orderBy: {
          uploadedAt: Prisma.SortOrder.desc,
        },
      });

      expect(prismaService.fileKeywordsUpload.count).toHaveBeenCalledWith({
        where: {
          userId: mockReqUser.sub,
        },
      });
    });

    it('should handle empty uploaded files', async () => {
      (
        prismaService.fileKeywordsUpload.findMany as jest.Mock
      ).mockResolvedValue([]);

      (prismaService.fileKeywordsUpload.count as jest.Mock).mockResolvedValue(
        0,
      );

      const getUploadedFilesResponse = await handler.execute(
        mockGetUploadedFilesQuery,
      );

      expect(getUploadedFilesResponse).toEqual({
        records: [],
        skippedRecords: 0,
        totalRecords: 0,
        payloadSize: 0,
        hasNext: false,
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Somethings wrong');
      (
        prismaService.fileKeywordsUpload.findMany as jest.Mock
      ).mockRejectedValue(error);

      await expect(handler.execute(mockGetUploadedFilesQuery)).rejects.toThrow(
        error,
      );
    });

    it('should handle pagination parameters', async () => {
      (
        prismaService.fileKeywordsUpload.findMany as jest.Mock
      ).mockResolvedValue(mockUploadedFiles);

      (prismaService.fileKeywordsUpload.count as jest.Mock).mockResolvedValue(
        mockUploadedFiles.length,
      );

      mockGetUploadedFilesRequestQuery.skip = 5;

      const queryWithPagination = new GetUploadedFilesQuery(
        mockReqUser,
        mockGetUploadedFilesRequestQuery,
      );

      const getUploadedFilesResponse =
        await handler.execute(queryWithPagination);

      expect(getUploadedFilesResponse).toEqual({
        records: mockUploadedFiles,
        skippedRecords: 5,
        totalRecords: 2,
        payloadSize: 2,
        hasNext: false,
      });
    });
  });
});
