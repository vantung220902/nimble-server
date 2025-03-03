import { CommandHandlerBase } from '@common/cqrs';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

class MockCommandBus {}

class TCommand {}
class TResponse {}

class CommandHandler extends CommandHandlerBase<TCommand, TResponse> {
  public execute(_command: TCommand): Promise<TResponse> {
    return;
  }
}

describe('CommandHandlerCQRS', () => {
  let commandHandler: CommandHandler;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      providers: [
        CommandHandler,
        { provide: CommandBus, useClass: MockCommandBus },
      ],
    }).compile();

    commandHandler = testModule.get<CommandHandler>(CommandHandler);
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
    expect(commandHandler).toBeInstanceOf(CommandHandler);
  });
});
