import { ProcessKeywordsCommand } from '@modules/search-keyword-management/application/commands/process-keywords/process-keywords.command';
import { SearchKeywordManagementService } from '@modules/search-keyword-management/services';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RedisService } from '@redis/services';

@Injectable()
export class SearchKeywordManagementSubscriber
  implements OnModuleInit, OnModuleDestroy
{
  private readonly processKeywordChannel: string;
  private readonly logger = new Logger(SearchKeywordManagementService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly searchKeywordManagementService: SearchKeywordManagementService,
    private commandBus: CommandBus,
  ) {
    this.processKeywordChannel =
      this.searchKeywordManagementService.getTriggerProcessKeywordChannel();
  }

  public onModuleDestroy() {
    this.redisService.unsubscribe(this.processKeywordChannel);
  }

  public onModuleInit() {
    this.redisService.subscribe(this.processKeywordChannel, (message: string) =>
      this.processMessage(message),
    );
  }

  private async processMessage(message: string) {
    try {
      const command: ProcessKeywordsCommand = JSON.parse(message);

      await this.commandBus.execute(
        new ProcessKeywordsCommand(command.body, command.userId),
      );
    } catch (error) {
      this.logger.error(`Error processing Redis message: ${error.message}`);
    }
  }
}
