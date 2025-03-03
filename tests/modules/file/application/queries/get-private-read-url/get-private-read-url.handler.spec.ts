import { GetPrivateReadUrlHandler } from '@modules/file/application/queries/get-private-read-url/get-private-read-url.handler';
import { GetPrivateReadUrlQuery } from '@modules/file/application/queries/get-private-read-url/get-private-read-url.query';
import { FileService } from '@modules/file/services';
import { Test } from '@nestjs/testing';

describe('GetPrivateReadUrlHandler', () => {
  let handler: GetPrivateReadUrlHandler;
  let fileService: jest.MockedObject<FileService>;
  const mockObjectUrl = 'https://user-storage-dev/presigned-read-url';
  const mockQuery = new GetPrivateReadUrlQuery({
    filePath: mockObjectUrl,
  });

  beforeEach(async () => {
    fileService = {
      getPrivateReadUrl: jest.fn(),
    } as jest.MockedObject<FileService>;

    const module = await Test.createTestingModule({
      providers: [
        GetPrivateReadUrlHandler,
        {
          provide: FileService,
          useValue: fileService,
        },
      ],
    }).compile();

    handler = module.get<GetPrivateReadUrlHandler>(GetPrivateReadUrlHandler);
  });

  describe('execute', () => {
    it('should return presigned URL successfully', async () => {
      fileService.getPrivateReadUrl.mockResolvedValue(mockObjectUrl);

      const preSignedResponse = await handler.execute(mockQuery);

      expect(preSignedResponse).toEqual({ url: mockObjectUrl });
      expect(fileService.getPrivateReadUrl).toHaveBeenCalledWith(
        mockQuery.option,
      );
    });

    it('should handle file service errors', async () => {
      const error = new Error('Somethings wrong');
      fileService.getPrivateReadUrl.mockRejectedValue(error);

      await expect(handler.execute(mockQuery)).rejects.toThrow(error);
      expect(fileService.getPrivateReadUrl).toHaveBeenCalledWith(
        mockQuery.option,
      );
    });
  });
});
