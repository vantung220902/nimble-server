import { ResendVerificationCommand } from '@modules/authentication/application/commands/resend-verification/resend-verification.command';
import { ResendVerificationHandler } from '@modules/authentication/application/commands/resend-verification/resend-verification.handler';
import { ResendVerificationRequestBody } from '@modules/authentication/application/commands/resend-verification/resend-verification.request-body';
import { AuthenticationNotifyService } from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';

describe('ResendVerificationHandler', () => {
  let handler: ResendVerificationHandler;
  let cacheService: jest.MockedObject<Cache>;
  let authNotifyService: jest.MockedObject<AuthenticationNotifyService>;

  beforeEach(async () => {
    cacheService = {
      get: jest.fn(),
    } as jest.MockedObject<Cache>;

    authNotifyService = {
      sendVerificationCode: jest.fn(),
    } as jest.MockedObject<AuthenticationNotifyService>;

    const testModule = await Test.createTestingModule({
      providers: [
        ResendVerificationHandler,
        {
          provide: CACHE_MANAGER,
          useValue: cacheService,
        },
        {
          provide: AuthenticationNotifyService,
          useValue: authNotifyService,
        },
      ],
    }).compile();

    handler = testModule.get<ResendVerificationHandler>(
      ResendVerificationHandler,
    );
  });

  describe('execute', () => {
    const mockEmail = 'example@google.com';
    const mockRequestBody: ResendVerificationRequestBody = {
      email: 'example@google.com',
    };
    const mockCommand = new ResendVerificationCommand(mockRequestBody);

    const mockCachedUser = {
      email: mockEmail,
      hashedPassword: 'hashedPassword',
      firstName: 'Tung',
      lastName: 'Nguyen',
      status: UserStatus.UNVERIFIED,
    };

    it('should successfully resend verification code', async () => {
      cacheService.get.mockResolvedValue(mockCachedUser);
      authNotifyService.sendVerificationCode.mockResolvedValue(undefined);

      await handler.execute(mockCommand);

      expect(cacheService.get).toHaveBeenCalledWith(mockEmail);
      expect(authNotifyService.sendVerificationCode).toHaveBeenCalledWith(
        mockCachedUser,
      );
    });

    it('should throw BadRequestException if user is not found in cache', async () => {
      cacheService.get.mockResolvedValue(null);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException(
          'The user already expired! Please sign up again!',
        ),
      );

      expect(cacheService.get).toHaveBeenCalledWith(mockEmail);
      expect(authNotifyService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('should handle notify service errors', async () => {
      const error = new Error('Notification service error');
      cacheService.get.mockResolvedValue(mockCachedUser);
      authNotifyService.sendVerificationCode.mockRejectedValue(error);

      await expect(handler.execute(mockCommand)).rejects.toThrow(error);

      expect(cacheService.get).toHaveBeenCalledWith(mockEmail);
      expect(authNotifyService.sendVerificationCode).toHaveBeenCalledWith(
        mockCachedUser,
      );
    });

    it('should handle cache service errors', async () => {
      const error = new Error('Somethings wrong!');
      cacheService.get.mockRejectedValue(error);

      await expect(handler.execute(mockCommand)).rejects.toThrow(error);

      expect(cacheService.get).toHaveBeenCalledWith(mockEmail);
      expect(authNotifyService.sendVerificationCode).not.toHaveBeenCalled();
    });
  });
});
