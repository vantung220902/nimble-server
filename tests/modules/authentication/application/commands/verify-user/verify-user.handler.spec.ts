import { PrismaService } from '@database';
import { VerifyUserCommand } from '@modules/authentication/application/commands/verify-user/verify-user.command';
import { VerifyUserHandler } from '@modules/authentication/application/commands/verify-user/verify-user.handler';
import { AuthenticationService } from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';

describe('VerifyUserHandler', () => {
  let handler: VerifyUserHandler;
  let cacheService: jest.MockedObject<Cache>;
  let prismaService: jest.MockedObject<PrismaService>;
  let authService: jest.MockedObject<AuthenticationService>;

  beforeEach(async () => {
    cacheService = {
      get: jest.fn(),
      del: jest.fn(),
    } as jest.MockedObject<Cache>;

    prismaService = {
      user: {
        create: jest.fn(),
      },
    } as any as jest.MockedObject<PrismaService>;

    authService = {
      getVerificationCacheKey: jest.fn(),
    } as jest.MockedObject<AuthenticationService>;

    const testModule = await Test.createTestingModule({
      providers: [
        VerifyUserHandler,
        {
          provide: CACHE_MANAGER,
          useValue: cacheService,
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: AuthenticationService,
          useValue: authService,
        },
      ],
    }).compile();

    handler = testModule.get<VerifyUserHandler>(VerifyUserHandler);
  });

  describe('execute', () => {
    const mockEmail = 'example@google.com';
    const mockCode = '123456';
    const mockRequestBody = { email: mockEmail, code: mockCode };
    const mockCommand = new VerifyUserCommand(mockRequestBody);

    const mockVerificationKey = `verification:${mockEmail}`;
    const mockCachedUser = {
      email: mockEmail,
      hashedPassword: 'hashedPassword',
      firstName: 'Tung',
      lastName: 'Nguyen',
      status: UserStatus.UNVERIFIED,
    };

    it('should successfully verify user', async () => {
      authService.getVerificationCacheKey.mockReturnValue(mockVerificationKey);
      cacheService.get.mockImplementation((key) => {
        if (key === mockVerificationKey) return Promise.resolve(mockCode);
        if (key === mockEmail) return Promise.resolve(mockCachedUser);
        return Promise.resolve(null);
      });

      await handler.execute(mockCommand);

      expect(authService.getVerificationCacheKey).toHaveBeenCalledWith(
        mockEmail,
      );
      expect(cacheService.get).toHaveBeenCalledWith(mockVerificationKey);
      expect(cacheService.get).toHaveBeenCalledWith(mockEmail);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: mockCachedUser.email,
          firstName: mockCachedUser.firstName,
          lastName: mockCachedUser.lastName,
          status: UserStatus.ACTIVE,
          hashedPassword: mockCachedUser.hashedPassword,
          emailVerified: expect.any(Date),
        },
      });
      expect(cacheService.del).toHaveBeenCalledWith(mockVerificationKey);
      expect(cacheService.del).toHaveBeenCalledWith(mockEmail);
    });

    it('should throw BadRequestException if verification code is invalid', async () => {
      authService.getVerificationCacheKey.mockReturnValue(mockVerificationKey);
      cacheService.get.mockImplementation((key) => {
        if (key === mockVerificationKey) return Promise.resolve('invalidCode');
        return Promise.resolve(null);
      });

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException('The verification code is invalid!'),
      );
    });

    it('should throw BadRequestException if user is not found in cache', async () => {
      authService.getVerificationCacheKey.mockReturnValue(mockVerificationKey);
      cacheService.get.mockImplementation((key) => {
        if (key === mockVerificationKey) return Promise.resolve(mockCode);
        return Promise.resolve(null);
      });

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException(
          'The user already expired! Please sign up again!',
        ),
      );
    });

    it('should handle database errors', async () => {
      const error = new Error('Somethings wrong');
      authService.getVerificationCacheKey.mockReturnValue(mockVerificationKey);
      cacheService.get.mockImplementation((key) => {
        if (key === mockVerificationKey) return Promise.resolve(mockCode);
        if (key === mockEmail) return Promise.resolve(mockCachedUser);
        return Promise.resolve(null);
      });

      (prismaService.user.create as jest.Mock).mockRejectedValue(error);

      await expect(handler.execute(mockCommand)).rejects.toThrow(error);
    });
  });
});
