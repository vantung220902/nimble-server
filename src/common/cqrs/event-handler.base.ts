import { Injectable, Logger } from '@nestjs/common';
import { IEvent, IEventHandler } from '@nestjs/cqrs';

@Injectable()
export abstract class EventHandlerBase<TEvent extends IEvent>
  implements IEventHandler<TEvent>
{
  protected readonly logger: Logger = new Logger(this.constructor.name);

  protected abstract handleEvent(event: TEvent): Promise<void>;

  public async handle(event: TEvent): Promise<void> {
    try {
      await this.handleEvent(event);
    } catch (err) {
      this.logger.error(err, 'Failed to handle event');
    }
  }
}
