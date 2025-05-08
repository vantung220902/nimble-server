import { PrismaService } from '@database';
import { VerifyUserHandler } from '@modules/authentication/application';
import { VerifyUserCommand } from '@modules/authentication/application/commands/verify-user/verify-user.command';
import { AuthenticationService } from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';

describe('VerifyUserHandler', () => {
  let handler: VerifyUserHandler;
  let moduleRef: TestingModule;

  const mockCacheService = {
    get: jest.fn(),
    del: jest.fn(),
  };
  const mockPrismaService = {
    user: {
      create: jest.fn(),
    },
  };
  const mockAuthService = {
    getVerificationCacheKey: jest.fn(),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        VerifyUserHandler,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    handler = moduleRef.get(VerifyUserHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  it('Should handler be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const mockCommand = new VerifyUserCommand({
      email: 'test@gmail.com',
      code: '123456',
    });
    const mockCachedUser = {
      hashedPassword: 'hashedPassword',
      email: 'test@gmail.com',
      firstName: 'Tung',
      lastName: 'Nguyen',
    };

    it('Should verify user successfully', async () => {
      mockAuthService.getVerificationCacheKey.mockReturnValueOnce(
        `verification:${mockCommand.body.email}`,
      );
      mockCacheService.get
        .mockResolvedValueOnce(mockCommand.body.code)
        .mockResolvedValueOnce(mockCachedUser);

      await handler.execute(mockCommand);

      expect(mockAuthService.getVerificationCacheKey).toHaveBeenCalledTimes(1);
      expect(mockAuthService.getVerificationCacheKey).toHaveBeenCalledWith(
        mockCommand.body.email,
      );
      expect(mockCacheService.get).toHaveBeenCalledTimes(2);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        `verification:${mockCommand.body.email}`,
      );
      expect(mockCacheService.get).toHaveBeenCalledWith(mockCommand.body.email);
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: mockCachedUser.email,
          firstName: mockCachedUser.firstName,
          lastName: mockCachedUser.lastName,
          status: UserStatus.ACTIVE,
          hashedPassword: mockCachedUser.hashedPassword,
          emailVerified: expect.any(Date),
        },
      });
      expect(mockCacheService.del).toHaveBeenCalledTimes(2);
      expect(mockCacheService.del).toHaveBeenCalledWith(
        `verification:${mockCommand.body.email}`,
      );
      expect(mockCacheService.del).toHaveBeenCalledWith(mockCommand.body.email);
    });

    it('Should throw BadRequestException error if code does not match with cached code', async () => {
      mockAuthService.getVerificationCacheKey.mockReturnValueOnce(
        `verification:${mockCommand.body.email}`,
      );
      mockCacheService.get.mockResolvedValueOnce('123123');

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException('The verification code is invalid!'),
      );

      expect(mockCacheService.get).not.toHaveBeenCalledWith(
        mockCommand.body.email,
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(mockCacheService.del).not.toHaveBeenCalled();
    });

    it('Should throw BadRequestException if user does not exist in cache', async () => {
      mockAuthService.getVerificationCacheKey.mockReturnValueOnce(
        `verification:${mockCommand.body.email}`,
      );
      mockCacheService.get
        .mockResolvedValueOnce(mockCommand.body.code)
        .mockResolvedValueOnce(null);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException(
          'The user already expired! Please sign up again!',
        ),
      );

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(mockCacheService.del).not.toHaveBeenCalled();
    });

    it('Should throw error if cache service failed', async () => {
      mockAuthService.getVerificationCacheKey.mockReturnValueOnce(
        `verification:${mockCommand.body.email}`,
      );
      mockCacheService.get.mockRejectedValueOnce(new Error('Something Wrong!'));

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new Error('Something Wrong!'),
      );

      expect(mockCacheService.get).not.toHaveBeenCalledWith(
        mockCommand.body.email,
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(mockCacheService.del).not.toHaveBeenCalled();
    });

    it('Should throw error if prisma service failed', async () => {
      mockAuthService.getVerificationCacheKey.mockReturnValueOnce(
        `verification:${mockCommand.body.email}`,
      );
      mockAuthService.getVerificationCacheKey.mockReturnValueOnce(
        `verification:${mockCommand.body.email}`,
      );
      mockCacheService.get
        .mockResolvedValueOnce(mockCommand.body.code)
        .mockResolvedValueOnce(mockCachedUser);
      mockPrismaService.user.create.mockRejectedValueOnce(
        new Error('Something Wrong!'),
      );

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
    });
  });
});
