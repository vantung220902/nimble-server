import { GetPrivateWriteUrlHandler } from '@modules/file/application';
import { GetPrivateWriteUrlQuery } from '@modules/file/application/queries/get-private-write-url/get-private-write-url.query';
import { GetPrivateWriteUrlRequestQuery } from '@modules/file/application/queries/get-private-write-url/get-private-write-url.request-query';
import { FileTypeEnum } from '@modules/file/file.enum';
import { FileService } from '@modules/file/services';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';

describe('GetPrivateWriteUrlHandler', () => {
  let handler: GetPrivateWriteUrlHandler;
  let moduleRef: TestingModule;

  const mockFileService = {
    getPrivateWriteUrl: jest.fn(),
  };
  const mockPayload: GetPrivateWriteUrlRequestQuery = {
    fileName: 'keyword.csv',
    customKey: null,
    contentType: 'text/csv',
    type: FileTypeEnum.KEYWORDS,
  };
  const mockReqUser = {
    sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
    email: 'example@google.com',
    status: UserStatus.ACTIVE,
  };
  const mockUrl = `https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/${mockPayload.fileName}`;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        GetPrivateWriteUrlHandler,
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    handler = moduleRef.get<GetPrivateWriteUrlHandler>(
      GetPrivateWriteUrlHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  describe('execute', () => {
    it('Should return presigned url successfully', async () => {
      mockFileService.getPrivateWriteUrl.mockResolvedValueOnce(mockUrl);

      const query = new GetPrivateWriteUrlQuery(mockReqUser, mockPayload);
      const presignedUrl = await handler.execute(query);

      expect(presignedUrl).toBeDefined();
      expect(presignedUrl.url).toEqual(mockUrl);
      expect(mockFileService.getPrivateWriteUrl).toHaveBeenCalledTimes(1);
      expect(mockFileService.getPrivateWriteUrl).toHaveBeenLastCalledWith(
        query.reqUser.sub,
        query.option,
      );
    });

    it('Should throw error when file service failed', async () => {
      mockFileService.getPrivateWriteUrl.mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      const query = new GetPrivateWriteUrlQuery(mockReqUser, mockPayload);

      await expect(handler.execute(query)).rejects.toThrow('Something wrong!');
      expect(mockFileService.getPrivateWriteUrl).toHaveBeenCalledTimes(1);
      expect(mockFileService.getPrivateWriteUrl).toHaveBeenLastCalledWith(
        query.reqUser.sub,
        query.option,
      );
    });
  });
});
