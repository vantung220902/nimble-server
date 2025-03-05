import { PrismaService } from '@database';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('PrismaService', () => {
  let prismaService: PrismaService;
  let app: INestApplication;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = testModule.get<PrismaService>(PrismaService);
    app = testModule.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should connect to the database on module init', async () => {
    jest.spyOn(prismaService, '$connect').mockResolvedValue(undefined);
    await prismaService.onModuleInit();
    expect(prismaService.$connect).toHaveBeenCalled();
  });
});
