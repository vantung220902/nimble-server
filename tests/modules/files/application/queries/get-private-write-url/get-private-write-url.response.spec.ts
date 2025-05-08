import { GetPrivateWriteUrlQueryResponse } from '@modules/file/application/queries/get-private-write-url/get-private-write-url.response';

describe('GetPrivateWriteUrlQueryResponse', () => {
  it('Should initialize GetPrivateWriteUrlQueryResponse correctly', () => {
    const privateWriteUrlResponse = new GetPrivateWriteUrlQueryResponse();
    privateWriteUrlResponse.url =
      'https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/keywords.csv';

    expect(privateWriteUrlResponse).toBeDefined();
    expect(privateWriteUrlResponse.url).toEqual(
      'https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/keywords.csv',
    );
  });
});
