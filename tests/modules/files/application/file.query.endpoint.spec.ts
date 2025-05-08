import { FileQueryEndpoint } from '@modules/file/application';
import { GetPrivateReadUrlQuery } from '@modules/file/application/queries/get-private-read-url/get-private-read-url.query';
import { GetPrivateReadUrlRequestQuery } from '@modules/file/application/queries/get-private-read-url/get-private-read-url.request-query';
import { GetPrivateReadUrlQueryResponse } from '@modules/file/application/queries/get-private-read-url/get-private-read-url.response';
import { GetPrivateWriteUrlQuery } from '@modules/file/application/queries/get-private-write-url/get-private-write-url.query';
import { GetPrivateWriteUrlRequestQuery } from '@modules/file/application/queries/get-private-write-url/get-private-write-url.request-query';
import { GetPrivateWriteUrlQueryResponse } from '@modules/file/application/queries/get-private-write-url/get-private-write-url.response';
import { FileTypeEnum } from '@modules/file/file.enum';
import { QueryBus } from '@nestjs/cqrs';
import { UserStatus } from '@prisma/client';
import { anyOfClass, instance, mock, verify, when } from 'ts-mockito';

describe('FileQueryEndpoint', () => {
  let queryBus: QueryBus;
  let fileQueryEndpoint: FileQueryEndpoint;

  beforeEach(() => {
    queryBus = mock(QueryBus);
    fileQueryEndpoint = new FileQueryEndpoint(instance(queryBus));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('file/presigned-download-url', () => {
    const mockQuery: GetPrivateReadUrlRequestQuery = {
      filePath:
        'https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/keywords.csv',
    };

    it('Should execute getPresignedDownloadUrl on the QueryBus', async () => {
      const queryResponse: GetPrivateReadUrlQueryResponse = {
        url: 'https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/keywords.csv',
      };

      when(
        queryBus.execute<
          GetPrivateReadUrlQuery,
          GetPrivateReadUrlQueryResponse
        >(anyOfClass(GetPrivateReadUrlQuery)),
      ).thenResolve(queryResponse);

      const presignedUrl =
        await fileQueryEndpoint.getPresignedDownloadUrl(mockQuery);

      expect(presignedUrl).toEqual(queryResponse);
      verify(queryBus.execute(anyOfClass(GetPrivateReadUrlQuery))).once();
    });

    it('Should throw error when QueryBus failed', async () => {
      when(
        queryBus.execute<
          GetPrivateReadUrlQuery,
          GetPrivateReadUrlQueryResponse
        >(anyOfClass(GetPrivateReadUrlQuery)),
      ).thenReject(new Error('Something wrong!'));

      await expect(
        fileQueryEndpoint.getPresignedDownloadUrl(mockQuery),
      ).rejects.toThrow('Something wrong!');
      verify(queryBus.execute(anyOfClass(GetPrivateReadUrlQuery))).once();
    });
  });

  describe('file/presigned-upload-url', () => {
    const mockReqUser = {
      sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
      email: 'example@google.com',
      status: UserStatus.ACTIVE,
    };
    const mockQuery: GetPrivateWriteUrlRequestQuery = {
      fileName: 'keyword.csv',
      customKey: null,
      contentType: 'text/csv',
      type: FileTypeEnum.KEYWORDS,
    };

    it('Should execute getPresignedUploadUrl on the QueryBus', async () => {
      const queryResponse: GetPrivateWriteUrlQueryResponse = {
        url: 'https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/keywords.csv',
      };

      when(
        queryBus.execute<
          GetPrivateWriteUrlQuery,
          GetPrivateWriteUrlQueryResponse
        >(anyOfClass(GetPrivateWriteUrlQuery)),
      ).thenResolve(queryResponse);

      const presignedUrl = await fileQueryEndpoint.getPresignedUploadUrl(
        mockReqUser,
        mockQuery,
      );

      expect(presignedUrl).toEqual(queryResponse);
      verify(queryBus.execute(anyOfClass(GetPrivateWriteUrlQuery))).once();
    });

    it('Should throw error when QueryBus failed', async () => {
      when(
        queryBus.execute<
          GetPrivateWriteUrlQuery,
          GetPrivateWriteUrlQueryResponse
        >(anyOfClass(GetPrivateWriteUrlQuery)),
      ).thenReject(new Error('Something wrong!'));

      await expect(
        fileQueryEndpoint.getPresignedUploadUrl(mockReqUser, mockQuery),
      ).rejects.toThrow('Something wrong!');
      verify(queryBus.execute(anyOfClass(GetPrivateWriteUrlQuery))).once();
    });
  });
});
