import { SignUpCommand } from '@modules/authentication/application/commands/sign-up/sign-up.command';
import { SignUpHandler } from '@modules/authentication/application/commands/sign-up/sign-up.handler';
import { SignUpRequestBody } from '@modules/authentication/application/commands/sign-up/sign-up.request-body';
import { EXPIRATION_VERIFICATION_ACCOUNT_SECONDS } from '@modules/authentication/authentication.enum';
import {
  AuthenticationNotifyService,
  AuthenticationService,
} from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';

describe('SignUpHandler', () => {
  let handler: SignUpHandler;
  let authService: jest.MockedObject<AuthenticationService>;
  let cacheService: jest.MockedObject<Cache>;
  let authNotifyService: jest.MockedObject<AuthenticationNotifyService>;

  beforeEach(async () => {
    authService = {
      isEmailExisted: jest.fn(),
      generateHashPassword: jest.fn(),
    } as jest.MockedObject<AuthenticationService>;

    cacheService = {
      set: jest.fn(),
    } as jest.MockedObject<Cache>;

    authNotifyService = {
      sendVerificationCode: jest.fn(),
    } as jest.MockedObject<AuthenticationNotifyService>;

    const testModule = await Test.createTestingModule({
      providers: [
        SignUpHandler,
        {
          provide: AuthenticationService,
          useValue: authService,
        },
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

    handler = testModule.get<SignUpHandler>(SignUpHandler);
  });

  describe('execute', () => {
    const mockEmail = 'example@google.com';
    const mockPassword = 'password';
    const mockRequestBody: SignUpRequestBody = {
      email: mockEmail,
      password: mockPassword,
      firstName: 'Tung',
      lastName: 'Nguyen',
      confirmPassword: mockPassword,
    };
    const mockHashedPassword = 'hashedPassword';
    const mockCommand = new SignUpCommand(mockRequestBody);

    it('should successfully sign up user', async () => {
      authService.isEmailExisted.mockResolvedValue(false);
      authService.generateHashPassword.mockResolvedValue(mockHashedPassword);
      cacheService.set.mockResolvedValue(undefined);
      authNotifyService.sendVerificationCode.mockResolvedValue(undefined);

      await handler.execute(mockCommand);

      expect(authService.isEmailExisted).toHaveBeenCalledWith(mockEmail);
      expect(authService.generateHashPassword).toHaveBeenCalledWith(
        mockPassword,
      );
      const mockCachedUser = {
        email: mockEmail,
        hashedPassword: mockHashedPassword,
        firstName: mockRequestBody.firstName,
        lastName: mockRequestBody.lastName,
        status: UserStatus.UNVERIFIED,
      };

      expect(cacheService.set).toHaveBeenCalledWith(
        mockEmail,
        mockCachedUser,
        EXPIRATION_VERIFICATION_ACCOUNT_SECONDS,
      );
      expect(authNotifyService.sendVerificationCode).toHaveBeenCalledWith(
        mockCachedUser,
      );
    });

    it('should throw BadRequestException if email already exists', async () => {
      authService.isEmailExisted.mockResolvedValue(true);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException('This email already exists in the system!'),
      );

      expect(authService.generateHashPassword).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
      expect(authNotifyService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('should handle password hashing error', async () => {
      const error = new Error('Somethings wrong');
      authService.isEmailExisted.mockResolvedValue(false);
      authService.generateHashPassword.mockRejectedValue(error);

      await expect(handler.execute(mockCommand)).rejects.toThrow(error);

      expect(cacheService.set).not.toHaveBeenCalled();
      expect(authNotifyService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('should handle cache service error', async () => {
      const error = new Error('Somethings wrong');
      authService.isEmailExisted.mockResolvedValue(false);
      authService.generateHashPassword.mockResolvedValue(mockHashedPassword);
      cacheService.set.mockRejectedValue(error);

      await expect(handler.execute(mockCommand)).rejects.toThrow(error);

      expect(authNotifyService.sendVerificationCode).not.toHaveBeenCalled();
    });
  });
});
