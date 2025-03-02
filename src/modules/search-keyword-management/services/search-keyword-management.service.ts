import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@redis/services';
import { Observable } from 'rxjs';

@Injectable()
export class SearchKeywordManagementService {
  private readonly logger = new Logger(SearchKeywordManagementService.name);

  constructor(private readonly redisService: RedisService) {}

  public getProcessingKeywordChannel(connectionId: string) {
    return `keywordsConnectionId:${connectionId}`;
  }

  public getTriggerProcessKeywordChannel() {
    return 'triggerKeyword';
  }

  public subscribeKeywordStream(connectionId: string): Observable<string> {
    const processingKeywordChannel =
      this.getProcessingKeywordChannel(connectionId);

    return new Observable((observer) => {
      this.redisService.subscribe(processingKeywordChannel, (message) => {
        observer.next(message);
      });

      return () => {
        this.logger.log(`subscribeKeywordStream finish ${connectionId}`);
      };
    });
  }
}
