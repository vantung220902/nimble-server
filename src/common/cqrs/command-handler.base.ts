import { Injectable, Logger } from '@nestjs/common';
import { ICommand, ICommandHandler } from '@nestjs/cqrs';

@Injectable()
export abstract class CommandHandlerBase<
  TCommand extends ICommand,
  TUseCaseResponse,
> implements ICommandHandler<TCommand, TUseCaseResponse>
{
  protected readonly logger: Logger = new Logger(this.constructor.name);

  public abstract execute(command: TCommand): Promise<TUseCaseResponse>;
}
