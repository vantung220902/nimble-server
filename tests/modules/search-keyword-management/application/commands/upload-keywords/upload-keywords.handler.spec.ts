import { PrismaService } from '@database';
import { FileService } from '@modules/file/services';
import { UploadKeywordsCommand } from '@modules/search-keyword-management/application/commands/upload-keywords/upload-keywords.command';
import { UploadKeywordsHandler } from '@modules/search-keyword-management/application/commands/upload-keywords/upload-keywords.handler';
import { MAXIMUM_KEYWORDS_PROCESS } from '@modules/search-keyword-management/search-keyword-management.enum';
import { SearchKeywordManagementService } from '@modules/search-keyword-management/services';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ProcessingStatus, UserStatus } from '@prisma/client';
import { RedisService } from '@redis/services';

describe('UploadKeywordsHandler', () => {
  let handler: UploadKeywordsHandler;
  let prismaService: jest.MockedObject<PrismaService>;
  let fileService: jest.MockedObject<FileService>;
  let redisService: jest.MockedObject<RedisService>;
  let searchKeywordManagementService: jest.MockedObject<SearchKeywordManagementService>;

  const mockTriggerKeyword = 'triggerKeyword';
  const mockObjectUrl = `https://user-storage-dev/key/keyword.csv`;
  const mockReqUser = {
    sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
    email: 'example@google.com',
    status: UserStatus.ACTIVE,
  };
  const mockFileUpload = {
    id: '068e657a-60fc-472d-ae6b-cebc0a91eff1',
    userId: mockReqUser.sub,
    totalKeywords: 2,
    status: ProcessingStatus.PENDING,
    uploadedAt: new Date(),
  };
  const mockCommand = new UploadKeywordsCommand(
    {
      url: mockObjectUrl,
    },
    mockReqUser,
  );

  beforeEach(async () => {
    prismaService = {
      fileKeywordsUpload: {
        create: jest.fn(),
      },
    } as any as jest.MockedObject<PrismaService>;

    fileService = {
      getContentFromUrl: jest.fn(),
    } as jest.MockedObject<FileService>;

    redisService = {
      publish: jest.fn(),
    } as jest.MockedObject<RedisService>;

    searchKeywordManagementService = {
      getTriggerProcessKeywordChannel: jest
        .fn()
        .mockReturnValue(mockTriggerKeyword),
    } as jest.MockedObject<SearchKeywordManagementService>;

    const testModule = await Test.createTestingModule({
      providers: [
        UploadKeywordsHandler,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: FileService,
          useValue: fileService,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
        {
          provide: SearchKeywordManagementService,
          useValue: searchKeywordManagementService,
        },
      ],
    }).compile();

    handler = testModule.get<UploadKeywordsHandler>(UploadKeywordsHandler);
  });

  describe('execute', () => {
    it('should successfully process keywords upload', async () => {
      const mockKeywords = ['Nimble', 'AI', 'Full stack'];
      fileService.getContentFromUrl.mockResolvedValue(mockKeywords);
      (prismaService.fileKeywordsUpload.create as jest.Mock).mockResolvedValue(
        mockFileUpload,
      );
      (redisService.publish as jest.Mock).mockResolvedValue(1);

      const uploadedKeywordsResponse = await handler.execute(mockCommand);

      expect(uploadedKeywordsResponse).toEqual({
        connectionId: mockFileUpload.id,
        totalKeyword: mockKeywords.length,
      });

      expect(fileService.getContentFromUrl).toHaveBeenCalledWith(mockObjectUrl);
      expect(prismaService.fileKeywordsUpload.create).toHaveBeenCalledWith({
        data: {
          fileUrl: mockObjectUrl,
          userId: mockReqUser.sub,
          totalKeywords: mockKeywords.length,
          status: ProcessingStatus.PENDING,
          uploadedAt: expect.any(Date),
        },
      });
      expect(redisService.publish).toHaveBeenCalledWith(
        mockTriggerKeyword,
        expect.any(String),
      );
    });

    it('should throw BadRequestException for empty keywords file', async () => {
      fileService.getContentFromUrl.mockResolvedValue([]);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException('Upload empty keywords file!'),
      );

      expect(prismaService.fileKeywordsUpload.create).not.toHaveBeenCalled();
      expect(redisService.publish).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for exceeding maximum keywords', async () => {
      const tooManyKeywords = Array(MAXIMUM_KEYWORDS_PROCESS + 1).fill(
        'Nimble',
      );
      fileService.getContentFromUrl.mockResolvedValue(tooManyKeywords);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException(
          `Upload keywords file must less than ${MAXIMUM_KEYWORDS_PROCESS} keywords!`,
        ),
      );

      expect(prismaService.fileKeywordsUpload.create).not.toHaveBeenCalled();
      expect(redisService.publish).not.toHaveBeenCalled();
    });

    it('should handle file service errors', async () => {
      const error = new Error('File service error');
      fileService.getContentFromUrl.mockRejectedValue(error);

      await expect(handler.execute(mockCommand)).rejects.toThrow(error);
    });

    it('should handle database errors', async () => {
      const mockKeywords = ['Nimble', 'AI', 'Full stack'];
      const error = new Error('Somethings wrong');

      fileService.getContentFromUrl.mockResolvedValue(mockKeywords);
      (prismaService.fileKeywordsUpload.create as jest.Mock).mockRejectedValue(
        error,
      );

      await expect(handler.execute(mockCommand)).rejects.toThrow(error);
      expect(redisService.publish).not.toHaveBeenCalled();
    });
  });
});
