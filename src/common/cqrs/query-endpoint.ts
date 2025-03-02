import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ControllerBase } from './controller';

@Injectable()
export abstract class QueryEndpoint extends ControllerBase {
  constructor(protected readonly queryBus: QueryBus) {
    super();
  }
}
