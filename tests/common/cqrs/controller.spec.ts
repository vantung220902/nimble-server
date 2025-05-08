import { ControllerBase } from '@common/cqrs';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

class TestController extends ControllerBase {}

describe('ControllerBase', () => {
  let controller: ControllerBase;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [{ provide: ControllerBase, useClass: TestController }],
    }).compile();
    controller = moduleRef.get<ControllerBase>(ControllerBase);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(ControllerBase);
  });

  it('Should have logger instance exists', () => {
    expect(controller['logger']).toBeDefined();
    expect(controller['logger']).toBeInstanceOf(Logger);
  });
});
