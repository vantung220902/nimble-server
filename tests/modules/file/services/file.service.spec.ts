import { AppConfig } from '@config';
import { FileTypeEnum } from '@modules/file/file.enum';
import { FileService } from '@modules/file/services';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3: jest.fn().mockReturnValue({
      putObject: jest
        .fn()
        .mockResolvedValue('https://user-storage-dev/key/keyword.csv'),
    }),
    S3Client: jest.fn().mockReturnValue({}),
    PutObjectCommand: class {},
    GetObjectCommand: class {},
    HeadObjectCommand: class {},
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: jest
      .fn()
      .mockResolvedValue('https://user-storage-dev/key/keyword.csv'),
  };
});

describe('FileService', () => {
  let fileService: FileService;

  const mockUserId = '7e97e07f-843f-4ff4-b168-2854104118c7';
  const mockPreSignPayload = {
    fileName: 'keyword.csv',
    customKey: null,
    contentType: 'text/csv',
    type: FileTypeEnum.KEYWORDS,
  };
  const mockObjectUrl = `https://user-storage-dev/key/${mockPreSignPayload.fileName}`;

  const mockAppConfig = {
    bucketS3Name: 'user-storage-dev',
  };

  beforeAll(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        FileService,
        {
          provide: AppConfig,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    fileService = testModule.get<FileService>(FileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPrivateReadUrl', () => {
    test('should safely get presigned url for private read', async () => {
      expect.assertions(1);

      await expect(
        fileService.getPrivateReadUrl({
          filePath: mockObjectUrl,
        }),
      ).resolves.toBe(mockObjectUrl);
    });
  });

  describe('getPrivateWriteUrl', () => {
    test('should safely get presigned url for private write', async () => {
      expect.assertions(1);

      await expect(
        fileService.getPrivateWriteUrl(mockUserId, mockPreSignPayload),
      ).resolves.toBe(mockObjectUrl);
    });

    test('should safely get presigned url for private write with entityId', async () => {
      expect.assertions(2);

      await expect(
        fileService.getPrivateWriteUrl(mockUserId, mockPreSignPayload),
      ).resolves.toBe(mockObjectUrl);

      await expect(
        fileService.getPrivateWriteUrl(mockUserId, mockPreSignPayload),
      ).resolves.toBe(mockObjectUrl);
    });
  });
});
