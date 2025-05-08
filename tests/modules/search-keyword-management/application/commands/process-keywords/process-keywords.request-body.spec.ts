import { ProcessKeywordsRequestBody } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.request-body';
import { validate } from 'class-validator';

describe('ProcessKeywordsRequestBody', () => {
  it('Should pass validation successfully', async () => {
    const body = new ProcessKeywordsRequestBody();
    body.keywords = ['Nimble', 'Fullstack', 'NodeJS', 'Book', 'Desk'];
    body.fileUploadId = 'b0f61762-8688-4477-b304-4c38eba78639';
    body.connectionId = 'b0f61762-8688-4477-b304-4c38eba78639';

    const validationResponse = await validate(body);

    expect(body).toEqual({
      keywords: ['Nimble', 'Fullstack', 'NodeJS', 'Book', 'Desk'],
      fileUploadId: 'b0f61762-8688-4477-b304-4c38eba78639',
      connectionId: 'b0f61762-8688-4477-b304-4c38eba78639',
    });
    expect(validationResponse).toHaveLength(0);
  });

  it('Should throw error if keywords invalid', async () => {
    const body = new ProcessKeywordsRequestBody();
    body.keywords = 1231 as any;
    body.fileUploadId = 'b0f61762-8688-4477-b304-4c38eba78639';
    body.connectionId = 'b0f61762-8688-4477-b304-4c38eba78639';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isString: 'Keyword must be a string',
        arrayNotEmpty: 'Keywords are required',
        isArray: 'Keywords must be array',
      }),
    );
  });

  it('Should throw error if keywords are a empty array', async () => {
    const body = new ProcessKeywordsRequestBody();
    body.keywords = [];
    body.fileUploadId = 'b0f61762-8688-4477-b304-4c38eba78639';
    body.connectionId = 'b0f61762-8688-4477-b304-4c38eba78639';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        arrayNotEmpty: 'Keywords are required',
      }),
    );
  });

  it('Should throw error if keywords are not string array', async () => {
    const body = new ProcessKeywordsRequestBody();
    body.keywords = [123, 123] as any;
    body.fileUploadId = 'b0f61762-8688-4477-b304-4c38eba78639';
    body.connectionId = 'b0f61762-8688-4477-b304-4c38eba78639';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isString: 'Keyword must be a string',
      }),
    );
  });

  it('Should throw error if fileUploadId invalid', async () => {
    const body = new ProcessKeywordsRequestBody();
    body.keywords = ['Nimble', 'Fullstack', 'NodeJS', 'Book', 'Desk'];
    body.fileUploadId = 'invalid-fileUploadId';
    body.connectionId = 'b0f61762-8688-4477-b304-4c38eba78639';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isUuid: 'FleUploadId must be a UUID',
      }),
    );
  });

  it('Should throw error if fileUploadId invalid', async () => {
    const body = new ProcessKeywordsRequestBody();
    body.keywords = ['Nimble', 'Fullstack', 'NodeJS', 'Book', 'Desk'];
    body.fileUploadId = 'b0f61762-8688-4477-b304-4c38eba78639';
    body.connectionId = 'invalid-connectionId';

    const validationResponse = await validate(body);

    expect(validationResponse[0].constraints).toEqual(
      expect.objectContaining({
        isUuid: 'ConnectionId must be a UUID',
      }),
    );
  });
});
