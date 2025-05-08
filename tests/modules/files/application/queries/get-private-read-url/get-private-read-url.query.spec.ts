import { GetPrivateReadUrlQuery } from '@modules/file/application/queries/get-private-read-url/get-private-read-url.query';

describe('GetPrivateReadUrlQuery', () => {
  it('Should initialize GetPrivateReadUrlQuery correctly', () => {
    const privateReadUrlQuery = new GetPrivateReadUrlQuery({
      filePath:
        'https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/keywords.csv',
    });

    expect(privateReadUrlQuery).toBeDefined();
    expect(privateReadUrlQuery.option).toEqual(
      expect.objectContaining({
        filePath:
          'https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/keywords.csv',
      }),
    );
  });
});
