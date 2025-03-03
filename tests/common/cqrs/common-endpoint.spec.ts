import {
  CommandEndpoint as CommandEndpointBase,
  ControllerBase,
} from '@common/cqrs';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

class MockCommandBus {}

class CommandEndpoint extends CommandEndpointBase {}

describe('CommandEndpointCQRS', () => {
  let commandEndpoint: CommandEndpoint;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CommandEndpoint,
        { provide: CommandBus, useClass: MockCommandBus },
      ],
    }).compile();

    commandEndpoint = moduleRef.get<CommandEndpoint>(CommandEndpoint);
  });

  it('should be defined', () => {
    expect(commandEndpoint).toBeDefined();
    expect(commandEndpoint).toBeInstanceOf(CommandEndpoint);
  });

  it('should extend ControllerBase', () => {
    expect(commandEndpoint).toBeInstanceOf(ControllerBase);
  });
});
