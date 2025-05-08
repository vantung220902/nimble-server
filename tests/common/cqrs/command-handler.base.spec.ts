import { CommandHandlerBase } from '@common/cqrs';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

class MockICommand {}

class MockIUseCaseResponse {}

class TestCommandHandlerBase extends CommandHandlerBase<
  MockICommand,
  MockIUseCaseResponse
> {
  public execute(_command: MockICommand): Promise<MockIUseCaseResponse> {
    return;
  }
}

describe('CommandHandlerBase', () => {
  let commandHandlerBase: TestCommandHandlerBase;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        { provide: CommandHandlerBase, useClass: TestCommandHandlerBase },
      ],
    }).compile();
    commandHandlerBase =
      moduleRef.get<TestCommandHandlerBase>(CommandHandlerBase);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(commandHandlerBase).toBeDefined();
    expect(commandHandlerBase).toBeInstanceOf(CommandHandlerBase);
  });

  it('Should have logger instance exists', () => {
    expect(commandHandlerBase['logger']).toBeDefined();
    expect(commandHandlerBase['logger']).toBeInstanceOf(Logger);
  });
});
