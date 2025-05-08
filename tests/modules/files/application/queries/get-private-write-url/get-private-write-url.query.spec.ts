import { GetPrivateWriteUrlQuery } from '@modules/file/application/queries/get-private-write-url/get-private-write-url.query';
import { FileTypeEnum } from '@modules/file/file.enum';
import { UserStatus } from '@prisma/client';

describe('GetPrivateWriteUrlQuery', () => {
  it('Should initialize GetPrivateWriteUrlQuery correctly', () => {
    const mockReqUser = {
      sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
      email: 'example@google.com',
      status: UserStatus.ACTIVE,
    };
    const privateWriteUrlQuery = new GetPrivateWriteUrlQuery(mockReqUser, {
      fileName: 'keyword.csv',
      contentType: 'text/csv',
      type: FileTypeEnum.KEYWORDS,
    });

    expect(privateWriteUrlQuery).toBeDefined();
    expect(privateWriteUrlQuery.option).toEqual(
      expect.objectContaining({
        fileName: 'keyword.csv',
        contentType: 'text/csv',
        type: FileTypeEnum.KEYWORDS,
      }),
    );
    expect(privateWriteUrlQuery.reqUser).toEqual(mockReqUser);
  });
});
