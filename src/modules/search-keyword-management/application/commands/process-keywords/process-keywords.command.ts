import { ProcessKeywordsRequestBody } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.request-body';

export class ProcessKeywordsCommand {
  constructor(
    public readonly body: ProcessKeywordsRequestBody,
    public readonly userId: string,
  ) {}
}
