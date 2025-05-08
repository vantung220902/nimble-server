import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { normalizeFileName } from '@common/utils';
import { AppConfig } from '@config';
import { GetPrivateWriteUrlRequestQuery } from '@modules/file/application/queries/get-private-write-url/get-private-write-url.request-query';
import { FileTypeEnum } from '@modules/file/file.enum';
import { FileService } from '@modules/file/services';
import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';

const mockS3Send = jest.fn().mockResolvedValue({
  Body: Readable.from(['keyword,value\nvalue1\nvalue2']),
});

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockReturnValue({
      send: () => mockS3Send(),
    }),
    PutObjectCommand: jest.fn().mockReturnValue({}),
    GetObjectCommand: jest.fn().mockReturnValue({}),
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
  let appConfig: AppConfig;
  let moduleRef: TestingModule;

  const mockUserId = '7e97e07f-843f-4ff4-b168-2854104118c7';
  const mockPayload: GetPrivateWriteUrlRequestQuery = {
    fileName: 'keyword.csv',
    customKey: null,
    contentType: 'text/csv',
    type: FileTypeEnum.KEYWORDS,
  };
  const mockObjectUrl = `https://user-storage-dev/key/${mockPayload.fileName}`;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: AppConfig,
          useValue: {
            bucketS3Name: 'user-storage-dev',
          },
        },
      ],
    }).compile();

    fileService = moduleRef.get<FileService>(FileService);
    appConfig = moduleRef.get<AppConfig>(AppConfig);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  describe('getParamFromUrl', () => {
    it('Should get bucket and key from url successfully', () => {
      const { bucket, key } = fileService['getParamFromUrl'](mockObjectUrl);

      expect(bucket).toEqual('user-storage-dev');
      expect(key).toEqual(`key/${mockPayload.fileName}`);
    });

    it('Should handle on invalid url', () => {
      try {
        fileService['getParamFromUrl']('invalid-url');
        fail('Must throw Invalid URL here');
      } catch (error) {
        expect(error.message).toContain('Invalid URL');
      }
    });
  });

  describe('getContentFromUrl', () => {
    it('Should parse content successfully', async () => {
      const content = await fileService.getContentFromUrl(mockObjectUrl);

      expect(content).toEqual(['value1', 'value2']);
      expect(mockS3Send).toHaveBeenCalled();
      expect(GetObjectCommand).toHaveBeenCalled();
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'user-storage-dev',
        Key: `key/${mockPayload.fileName}`,
      });
    });

    it('Should handle empty content', async () => {
      mockS3Send.mockResolvedValueOnce({
        Body: Readable.from(['keyword,value\n']),
      });

      const content = await fileService.getContentFromUrl(mockObjectUrl);

      expect(content).toEqual([]);
      expect(mockS3Send).toHaveBeenCalled();
      expect(GetObjectCommand).toHaveBeenCalled();
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'user-storage-dev',
        Key: `key/${mockPayload.fileName}`,
      });
    });

    it('Should throw Invalid on invalid url', async () => {
      try {
        await fileService.getContentFromUrl('invalid-url');
        fail('Must throw Invalid URL here');
      } catch (error) {
        expect(error.message).toContain('Invalid URL');
      }

      expect(GetObjectCommand).not.toHaveBeenCalled();
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('Should throw error when s3Client failed', async () => {
      mockS3Send.mockRejectedValueOnce(new Error('Something wrong!'));

      await expect(
        fileService.getContentFromUrl(mockObjectUrl),
      ).rejects.toThrow('Something wrong!');

      expect(GetObjectCommand).toHaveBeenCalled();
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'user-storage-dev',
        Key: `key/${mockPayload.fileName}`,
      });
    });
  });

  describe('getPrivateReadUrl', () => {
    it('Should get presigned read url successfully', async () => {
      const presignedUrl = await fileService.getPrivateReadUrl({
        filePath: mockObjectUrl,
      });

      expect(presignedUrl).toEqual('https://user-storage-dev/key/keyword.csv');
      expect(getSignedUrl).toHaveBeenCalled();
      expect(GetObjectCommand).toHaveBeenCalled();
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'user-storage-dev',
        Key: `key/${mockPayload.fileName}`,
      });
    });

    it('Should throw Invalid on invalid url', async () => {
      try {
        await fileService.getPrivateReadUrl({ filePath: 'invalid-url' });
        fail('Must throw Invalid URL here');
      } catch (error) {
        expect(error.message).toContain('Invalid URL');
      }

      expect(GetObjectCommand).not.toHaveBeenCalled();
      expect(getSignedUrl).not.toHaveBeenCalled();
    });

    it('Should throw error when getSignedUrl failed', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      await expect(
        fileService.getPrivateReadUrl({ filePath: mockObjectUrl }),
      ).rejects.toThrow('Something wrong!');

      expect(GetObjectCommand).toHaveBeenCalled();
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'user-storage-dev',
        Key: `key/${mockPayload.fileName}`,
      });
    });
  });

  describe('getPrivateWriteUrl', () => {
    it('Should get presigned write url successfully', async () => {
      const presignedUrl = await fileService.getPrivateWriteUrl(
        mockUserId,
        mockPayload,
      );

      expect(presignedUrl).toEqual('https://user-storage-dev/key/keyword.csv');
      expect(getSignedUrl).toHaveBeenCalled();
      expect(PutObjectCommand).toHaveBeenCalled();
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: appConfig.bucketS3Name,
        Key: expect.stringContaining(normalizeFileName(mockPayload.fileName)),
        ContentType: mockPayload.contentType,
      });
    });

    it('Should get presigned write url successfully with custom key', async () => {
      const presignedUrl = await fileService.getPrivateWriteUrl(mockUserId, {
        ...mockPayload,
        customKey: 'custom-key.csv',
      });

      expect(presignedUrl).toEqual('https://user-storage-dev/key/keyword.csv');
      expect(getSignedUrl).toHaveBeenCalled();
      expect(PutObjectCommand).toHaveBeenCalled();
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: appConfig.bucketS3Name,
        Key: 'custom-key.csv',
        ContentType: mockPayload.contentType,
      });
    });

    it('Should throw error when getSignedUrl failed', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      await expect(
        fileService.getPrivateWriteUrl(mockUserId, mockPayload),
      ).rejects.toThrow('Something wrong!');

      expect(PutObjectCommand).toHaveBeenCalled();
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: appConfig.bucketS3Name,
        Key: expect.stringContaining(normalizeFileName(mockPayload.fileName)),
        ContentType: mockPayload.contentType,
      });
    });
  });
});
