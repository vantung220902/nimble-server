import { GetPrivateReadUrlQueryResponse } from '@modules/file/application/queries/get-private-read-url/get-private-read-url.response';

describe('GetPrivateReadUrlQueryResponse', () => {
  it('Should initialize GetPrivateReadUrlQueryResponse correctly', () => {
    const privateReadUrlResponse = new GetPrivateReadUrlQueryResponse();
    privateReadUrlResponse.url =
      'https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/keywords.csv';

    expect(privateReadUrlResponse).toBeDefined();
    expect(privateReadUrlResponse.url).toEqual(
      'https://user-storage-dev.s3.us-east-1.amazonaws.com/avatars/user-id/keywords.csv',
    );
  });
});
