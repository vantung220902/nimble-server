import { CommandEndpoint } from '@common/cqrs';
import { ApiListResponse, ApiResponse } from '@common/decorators';
import { AuthenticationGuard } from '@common/guards';
import { ResponseInterceptor } from '@common/interceptors';
import { ProcessKeywordsCommand } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.command';
import { ProcessKeywordsRequestBody } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.request-body';
import { ProcessKeywordsCommandResponse } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.response';
import { UploadKeywordsCommand } from '@modules/search-keyword-management/application/commands/upload-keywords/upload-keywords.command';
import { UploadKeywordsRequestBody } from '@modules/search-keyword-management/application/commands/upload-keywords/upload-keywords.request-body';
import { UploadKeywordsCommandResponse } from '@modules/search-keyword-management/application/commands/upload-keywords/upload-keywords.response';
import { SearchKeywordManagementService } from '@modules/search-keyword-management/services';
import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  Sse,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

@ApiTags('Search Keywords Management')
@Controller({
  version: '1',
  path: 'search-keywords',
})
@UseInterceptors(ResponseInterceptor)
export class SearchKeywordManagementCommandEndpoint extends CommandEndpoint {
  constructor(
    protected commandBus: CommandBus,
    private readonly searchKeywordManagementService: SearchKeywordManagementService,
  ) {
    super(commandBus);
  }

  @ApiOperation({ description: 'Process keywords endpoint' })
  @ApiListResponse(ProcessKeywordsCommandResponse)
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  @Post('process')
  public search(
    @Request() request,
    @Body() body: ProcessKeywordsRequestBody,
  ): Promise<ProcessKeywordsCommandResponse> {
    return this.commandBus.execute<
      ProcessKeywordsCommand,
      ProcessKeywordsCommandResponse
    >(new ProcessKeywordsCommand(body, request.user.sub));
  }

  @Sse('keyword-stream/:id')
  public stream(@Param('id') id: string): Observable<any> {
    return this.searchKeywordManagementService
      .subscribeKeywordStream(id)
      .pipe();
  }

  @ApiOperation({ description: 'Upload file keywords endpoint' })
  @ApiResponse()
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  @Post('upload')
  public upload(
    @Request() request,
    @Body() body: UploadKeywordsRequestBody,
  ): Promise<UploadKeywordsCommandResponse> {
    return this.commandBus.execute<
      UploadKeywordsCommand,
      UploadKeywordsCommandResponse
    >(new UploadKeywordsCommand(body, request.user));
  }
}
