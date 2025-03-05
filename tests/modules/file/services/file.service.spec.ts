import { AppConfig } from '@config';
import { FileTypeEnum } from '@modules/file/file.enum';
import { FileService } from '@modules/file/services';
import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';

const mockS3Send = jest.fn().mockResolvedValue({
  Body: Readable.from(['keyword,value\nvalue1\nvalue2']),
});

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3: jest.fn().mockReturnValue({
      putObject: jest
        .fn()
        .mockResolvedValue('https://user-storage-dev/key/keyword.csv'),
    }),
    S3Client: jest.fn().mockReturnValue({
      send: () => mockS3Send(),
    }),
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

  describe('getContentFromUrl', () => {
    test('should parse CSV content successfully', async () => {
      expect.assertions(1);
      const result = await fileService.getContentFromUrl(mockObjectUrl);
      expect(result).toEqual(['value1', 'value2']);
    });

    test('should handle empty CSV content', async () => {
      expect.assertions(1);
      mockS3Send.mockResolvedValueOnce({
        Body: Readable.from(['keyword,value\n']),
      });

      const result = await fileService.getContentFromUrl(mockObjectUrl);
      expect(result).toEqual([]);
    });
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

    test('should handle invalid URL format', async () => {
      expect.assertions(1);
      const invalidUrl = 'invalid-url';

      await expect(
        fileService.getPrivateReadUrl({
          filePath: invalidUrl,
        }),
      ).rejects.toThrow();
    });
  });

  describe('getPrivateWriteUrl', () => {
    test('should safely get presigned url for private write', async () => {
      expect.assertions(1);

      await expect(
        fileService.getPrivateWriteUrl(mockUserId, mockPreSignPayload),
      ).resolves.toBe(mockObjectUrl);
    });

    test('should safely get presigned url with custom key', async () => {
      expect.assertions(1);
      const customKeyPayload = {
        ...mockPreSignPayload,
        customKey: 'custom/path/file.csv',
      };

      await expect(
        fileService.getPrivateWriteUrl(mockUserId, customKeyPayload),
      ).resolves.toBe(mockObjectUrl);
    });
  });
});
