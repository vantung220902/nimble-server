import { GetPrivateReadUrlDto } from '@modules/file/dtos';
import { validate } from 'class-validator';

describe('GetPrivateReadUrlDto', () => {
  it('Should pass validation successfully', async () => {
    const privateReadUrlDto = new GetPrivateReadUrlDto();
    privateReadUrlDto.filePath =
      'https://user-storage-dev.s3.us-west-2.amazonaws.com/keyword.csv';

    const validationResponse = await validate(privateReadUrlDto);

    expect(privateReadUrlDto).toBeDefined();
    expect(privateReadUrlDto.filePath).toEqual(
      'https://user-storage-dev.s3.us-west-2.amazonaws.com/keyword.csv',
    );
    expect(validationResponse).toHaveLength(0);
  });

  it('Should throw error on invalid url', async () => {
    const privateReadUrlDto = new GetPrivateReadUrlDto();
    privateReadUrlDto.filePath = 'invalid-url';

    const validationResponse = await validate(privateReadUrlDto);

    expect(privateReadUrlDto).toBeDefined();
    expect(privateReadUrlDto.filePath).toEqual('invalid-url');
    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isUrl: 'filePath must be a URL address',
      }),
    );
  });

  it('Should throw error on missing url property', async () => {
    const privateReadUrlDto = new GetPrivateReadUrlDto();

    const validationResponse = await validate(privateReadUrlDto);

    expect(privateReadUrlDto).toBeDefined();
    expect(privateReadUrlDto.filePath).toBeUndefined();
    expect(validationResponse).toHaveLength(1);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isUrl: 'filePath must be a URL address',
      }),
    );
  });
});
