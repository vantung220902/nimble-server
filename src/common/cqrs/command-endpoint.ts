import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ControllerBase } from './controller';

@Injectable()
export abstract class CommandEndpoint extends ControllerBase {
  constructor(protected readonly commandBus: CommandBus) {
    super();
  }
}
