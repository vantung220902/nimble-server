import { RequestUser } from '@common/interfaces';
import { GetUploadedFilesRequestQuery } from './get-uploaded-files.request-query';

export class GetUploadedFilesQuery {
  constructor(
    public readonly reqUser: RequestUser,
    public readonly query: GetUploadedFilesRequestQuery,
  ) {}
}
