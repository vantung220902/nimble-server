import { RequestUser } from '@common/interfaces';
import { UploadKeywordsRequestBody } from './upload-keywords.request-body';

export class UploadKeywordsCommand {
  constructor(
    public readonly body: UploadKeywordsRequestBody,
    public readonly reqUser: RequestUser,
  ) {}
}
