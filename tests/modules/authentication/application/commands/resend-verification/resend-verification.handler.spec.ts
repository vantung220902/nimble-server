import { ResendVerificationHandler } from '@modules/authentication/application';
import { ResendVerificationCommand } from '@modules/authentication/application/commands/resend-verification/resend-verification.command';
import { AuthenticationNotifyService } from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';

describe('ResendVerificationHandler', () => {
  let handler: ResendVerificationHandler;
  let moduleRef: TestingModule;

  const mockCacheService = {
    get: jest.fn(),
  };
  const mockAuthenticationNotifyService = {
    sendVerificationCode: jest.fn(),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        ResendVerificationHandler,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheService,
        },
        {
          provide: AuthenticationNotifyService,
          useValue: mockAuthenticationNotifyService,
        },
      ],
    }).compile();

    handler = moduleRef.get<ResendVerificationHandler>(
      ResendVerificationHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const mockEmail = 'example@google.com';
    const mockCommand = new ResendVerificationCommand({
      email: mockEmail,
    });

    const mockCachedUser = {
      email: mockEmail,
      hashedPassword: 'hashedPassword',
      firstName: 'Tung',
      lastName: 'Nguyen',
      status: UserStatus.UNVERIFIED,
    };
    it('Should resend verification code successfully', async () => {
      mockCacheService.get.mockResolvedValueOnce(mockCachedUser);

      await handler.execute(mockCommand);

      expect(mockCacheService.get).toHaveBeenCalledTimes(1);
      expect(mockCacheService.get).toHaveBeenCalledWith(mockEmail);

      expect(
        mockAuthenticationNotifyService.sendVerificationCode,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockAuthenticationNotifyService.sendVerificationCode,
      ).toHaveBeenCalledWith(mockCachedUser);
    });

    it('Should should BadRequestException if user does not exist in cache', async () => {
      mockCacheService.get.mockResolvedValueOnce(null);
      await expect(handler.execute(mockCommand)).rejects.toThrow(
        'The user already expired! Please sign up again!',
      );
      expect(
        mockAuthenticationNotifyService.sendVerificationCode,
      ).not.toHaveBeenCalled();
    });

    it('Should throw error if cache service failed', async () => {
      mockCacheService.get.mockRejectedValueOnce(new Error('Something wrong!'));

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        'Something wrong!',
      );
      expect(
        mockAuthenticationNotifyService.sendVerificationCode,
      ).not.toHaveBeenCalled();
    });

    it('Should throw error if cache service failed', async () => {
      mockCacheService.get.mockResolvedValueOnce(mockCachedUser);
      mockAuthenticationNotifyService.sendVerificationCode.mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        'Something wrong!',
      );
      expect(mockCacheService.get).toHaveBeenCalledTimes(1);
      expect(mockCacheService.get).toHaveBeenCalledWith(mockEmail);
    });
  });
});
