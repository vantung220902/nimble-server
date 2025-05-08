import { GetPrivateWriteUrlDto } from '@modules/file/dtos';
import { FileTypeEnum } from '@modules/file/file.enum';
import { validate } from 'class-validator';

describe('GetPrivateWriteUrlDto', () => {
  it('Should pass validation successfully', async () => {
    const privateWriteUrlDto = new GetPrivateWriteUrlDto();
    privateWriteUrlDto.fileName = 'keyword.csv';
    privateWriteUrlDto.contentType = 'text/csv';
    privateWriteUrlDto.type = FileTypeEnum.KEYWORDS;

    const validationResponse = await validate(privateWriteUrlDto);

    expect(privateWriteUrlDto).toBeDefined();
    expect(privateWriteUrlDto).toEqual(
      expect.objectContaining({
        fileName: 'keyword.csv',
        contentType: 'text/csv',
        type: FileTypeEnum.KEYWORDS,
      }),
    );
    expect(validationResponse).toHaveLength(0);
  });

  it('Should throw error on invalid payload', async () => {
    const privateWriteUrlDto = new GetPrivateWriteUrlDto();
    privateWriteUrlDto.fileName = 1 as any;
    privateWriteUrlDto.contentType = 2 as any;
    privateWriteUrlDto.type = 3 as any;

    const validationResponse = await validate(privateWriteUrlDto);

    expect(privateWriteUrlDto).toBeDefined();
    expect(privateWriteUrlDto).toEqual(
      expect.objectContaining({
        fileName: 1,
        contentType: 2,
        type: 3,
      }),
    );
    expect(validationResponse).toHaveLength(3);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isString: 'fileName must be a string',
      }),
    );
    expect(validationResponse[1].constraints).toEqual(
      expect.objectContaining({
        isString: 'contentType must be a string',
      }),
    );
    expect(validationResponse[2].constraints).toEqual(
      expect.objectContaining({
        isEnum: 'type must be one of the following values: keywords',
      }),
    );
  });

  it('Should throw error on empty payload', async () => {
    const privateWriteUrlDto = new GetPrivateWriteUrlDto();
    privateWriteUrlDto.fileName = '';
    privateWriteUrlDto.contentType = '';
    privateWriteUrlDto.type = '';

    const validationResponse = await validate(privateWriteUrlDto);

    expect(privateWriteUrlDto).toBeDefined();
    expect(privateWriteUrlDto).toEqual(
      expect.objectContaining({
        fileName: '',
        contentType: '',
        type: '',
      }),
    );
    expect(validationResponse).toHaveLength(3);
    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isNotEmpty: 'fileName should not be empty',
      }),
    );
    expect(validationResponse[1].constraints).toEqual(
      expect.objectContaining({
        isNotEmpty: 'contentType should not be empty',
      }),
    );
    expect(validationResponse[2].constraints).toEqual(
      expect.objectContaining({
        isEnum: 'type must be one of the following values: keywords',
      }),
    );
  });
});
