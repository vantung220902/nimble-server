import { FileUrlResponse } from '@modules/file/interfaces';

describe('FileUrlResponse', () => {
  it('Should initialize FileUrlResponse correctly', () => {
    const response: FileUrlResponse = {
      get: 'https://user-storage-dev/key/keyword.csv',
      head: 'https://user-storage-dev/key/keyword.csv',
    };

    expect(response).toBeDefined();
    expect(response.get).toEqual('https://user-storage-dev/key/keyword.csv');
    expect(response.head).toEqual('https://user-storage-dev/key/keyword.csv');
  });
});
