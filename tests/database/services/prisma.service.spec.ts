import { PrismaService } from '@database';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('PrismaService', () => {
  let prismaService: PrismaService;
  let app: INestApplication;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
    app = moduleRef.createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    await app.close();
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(app).toBeDefined();
  });

  it('Should connect to the database on module init', async () => {
    jest.spyOn(prismaService, '$connect').mockResolvedValue();
    await prismaService.onModuleInit();

    expect(prismaService.$connect).toHaveBeenCalled();
  });

  it('Should enable shutdown hooks before exit', async () => {
    jest
      .spyOn(prismaService, '$on')
      .mockImplementation(async () => await app.close());

    await prismaService.enableShutdownHooks(app);
    expect(prismaService.$on).toHaveBeenCalled();
    expect(prismaService.$on).toHaveBeenCalledWith(
      'beforeExit',
      expect.any(Function),
    );
  });
});
