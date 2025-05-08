import { LoggerModule } from '@logger';
import { LoggerConfig } from '@logger/logger.config';
import { RequestMethod } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('LoggerModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    process.env.LOG_LEVEL = 'info';
    process.env.LOG_EXCLUDE = `GET::/test,POST::/foo,PUT::/foo`;

    moduleRef = await Test.createTestingModule({
      imports: [LoggerModule],
    }).compile();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('Should provide loggerConfig', () => {
    const config = moduleRef.get<LoggerConfig>(LoggerConfig);

    expect(config).toBeDefined();
    expect(config.level).toEqual('info');
    expect(config.exclude).toHaveLength(3);
    process.env.LOG_EXCLUDE.split(',').forEach((exclude, index) => {
      const [method, path] = exclude.split('::');

      expect(config.exclude[`${index}`]).toEqual({
        method: RequestMethod[`${method}`],
        path,
      });
    });
  });
});
