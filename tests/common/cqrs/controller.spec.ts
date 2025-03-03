import { ControllerBase } from '@common/cqrs';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

class TestController extends ControllerBase {}

describe('ControllerBaseCQRS', () => {
  let controllerBase: TestController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TestController],
    }).compile();

    controllerBase = moduleRef.get<TestController>(TestController);
  });

  it('should create an instance of ControllerBase', () => {
    expect(controllerBase).toBeInstanceOf(TestController);
  });

  it('should have a logger instance', () => {
    expect(controllerBase['logger']).toBeInstanceOf(Logger);
  });
});
