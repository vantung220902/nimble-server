import { GetPrivateWriteUrlHandler } from '@modules/file/application/queries/get-private-write-url/get-private-write-url.handler';
import { GetPrivateWriteUrlQuery } from '@modules/file/application/queries/get-private-write-url/get-private-write-url.query';
import { FileTypeEnum } from '@modules/file/file.enum';
import { FileService } from '@modules/file/services';
import { Test } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';

describe('GetPrivateWriteUrlHandler', () => {
  let handler: GetPrivateWriteUrlHandler;
  let fileService: jest.MockedObject<FileService>;

  const mockReqUser = {
    sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
    email: 'example@google.com',
    status: UserStatus.ACTIVE,
  };
  const mockPreSignPayload = {
    fileName: 'keyword.csv',
    customKey: null,
    contentType: 'text/csv',
    type: FileTypeEnum.KEYWORDS,
  };
  const mockObjectUrl = `https://user-storage-dev/key/${mockPreSignPayload.fileName}`;

  beforeEach(async () => {
    fileService = {
      getPrivateWriteUrl: jest.fn(),
    } as jest.MockedObject<FileService>;

    const module = await Test.createTestingModule({
      providers: [
        GetPrivateWriteUrlHandler,
        {
          provide: FileService,
          useValue: fileService,
        },
      ],
    }).compile();

    handler = module.get<GetPrivateWriteUrlHandler>(GetPrivateWriteUrlHandler);
  });

  describe('execute', () => {
    const mockQuery = new GetPrivateWriteUrlQuery(
      mockReqUser,
      mockPreSignPayload,
    );

    it('should return presigned URL successfully', async () => {
      fileService.getPrivateWriteUrl.mockResolvedValue(mockObjectUrl);

      const result = await handler.execute(mockQuery);

      expect(result).toEqual({ url: mockObjectUrl });
      expect(fileService.getPrivateWriteUrl).toHaveBeenCalledWith(
        mockQuery.reqUser.sub,
        mockQuery.option,
      );
    });

    it('should handle file service errors', async () => {
      const error = new Error('Something wrong');
      fileService.getPrivateWriteUrl.mockRejectedValue(error);

      await expect(handler.execute(mockQuery)).rejects.toThrow(error);
      expect(fileService.getPrivateWriteUrl).toHaveBeenCalledWith(
        mockReqUser.sub,
        mockPreSignPayload,
      );
    });
  });
});
