import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export abstract class ControllerBase {
  protected readonly logger = new Logger(this.constructor.name);
}
