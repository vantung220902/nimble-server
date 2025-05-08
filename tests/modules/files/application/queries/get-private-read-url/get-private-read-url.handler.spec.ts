import { GetPrivateReadUrlHandler } from '@modules/file/application';
import { GetPrivateReadUrlQuery } from '@modules/file/application/queries/get-private-read-url/get-private-read-url.query';
import { FileService } from '@modules/file/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('GetPrivateReadUrlHandler', () => {
  let handler: GetPrivateReadUrlHandler;
  let moduleRef: TestingModule;

  const mockUrl =
    'https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/keywords.csv';
  const mockFileService = {
    getPrivateReadUrl: jest.fn(),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        GetPrivateReadUrlHandler,
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    handler = moduleRef.get<GetPrivateReadUrlHandler>(GetPrivateReadUrlHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  describe('execute', () => {
    it('Should return presigned url successfully', async () => {
      mockFileService.getPrivateReadUrl.mockResolvedValueOnce(mockUrl);

      const query = new GetPrivateReadUrlQuery({
        filePath: mockUrl,
      });
      const presignedUrl = await handler.execute(query);

      expect(presignedUrl).toBeDefined();
      expect(presignedUrl).toEqual({ url: mockUrl });
      expect(mockFileService.getPrivateReadUrl).toHaveBeenCalledTimes(1);
      expect(mockFileService.getPrivateReadUrl).toHaveBeenLastCalledWith(
        query.option,
      );
    });

    it('Should throw error when file service failed', async () => {
      mockFileService.getPrivateReadUrl.mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      const query = new GetPrivateReadUrlQuery({
        filePath: mockUrl,
      });
      await expect(handler.execute(query)).rejects.toThrow('Something wrong!');
      expect(mockFileService.getPrivateReadUrl).toHaveBeenCalledTimes(1);
      expect(mockFileService.getPrivateReadUrl).toHaveBeenLastCalledWith(
        query.option,
      );
    });
  });
});
