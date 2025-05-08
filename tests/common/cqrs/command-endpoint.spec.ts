import { CommandEndpoint, ControllerBase } from '@common/cqrs';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

class MockCommandBus {}

class TestCommandEndpoint extends CommandEndpoint {}

describe('CommandEndpoint', () => {
  let commandEndpoint: TestCommandEndpoint;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        { provide: CommandBus, useClass: MockCommandBus },
        { provide: CommandEndpoint, useClass: TestCommandEndpoint },
      ],
    }).compile();
    commandEndpoint = moduleRef.get<CommandEndpoint>(CommandEndpoint);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(commandEndpoint).toBeDefined();
    expect(commandEndpoint).toBeInstanceOf(CommandEndpoint);
  });

  it('Should extends ControllerBase', () => {
    expect(commandEndpoint).toBeInstanceOf(ControllerBase);
  });
});
