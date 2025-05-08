import { EXPIRATION_VERIFICATION_ACCOUNT_SECONDS } from '@modules/authentication';
import { SignUpHandler } from '@modules/authentication/application';
import { SignUpCommand } from '@modules/authentication/application/commands/sign-up/sign-up.command';
import {
  AuthenticationNotifyService,
  AuthenticationService,
} from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';

describe('SignUpHandler', () => {
  let handler: SignUpHandler;
  let moduleRef: TestingModule;

  const mockAuthService = {
    isEmailExisted: jest.fn(),
    generateHashPassword: jest.fn(),
  };
  const mockCacheService = {
    set: jest.fn(),
  };
  const mockAuthNotifyService = {
    sendVerificationCode: jest.fn(),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        SignUpHandler,
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheService,
        },
        {
          provide: AuthenticationNotifyService,
          useValue: mockAuthNotifyService,
        },
      ],
    }).compile();

    handler = moduleRef.get(SignUpHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const mockCommand = new SignUpCommand({
      confirmPassword: 'Abcd@123456',
      password: 'Abcd@123456',
      email: 'test@gmail.com',
      firstName: 'Tung',
      lastName: 'Nguyen',
    });

    it('Should sign up successfully', async () => {
      mockAuthService.isEmailExisted.mockResolvedValueOnce(false);
      mockAuthService.generateHashPassword.mockResolvedValueOnce(
        'hashedPassword',
      );

      await handler.execute(mockCommand);

      expect(mockAuthService.isEmailExisted).toHaveBeenCalledTimes(1);
      expect(mockAuthService.isEmailExisted).toHaveBeenCalledWith(
        mockCommand.body.email,
      );
      expect(mockAuthService.generateHashPassword).toHaveBeenCalledTimes(1);
      expect(mockAuthService.generateHashPassword).toHaveBeenCalledWith(
        mockCommand.body.password,
      );
      expect(mockCacheService.set).toHaveBeenCalledTimes(1);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        mockCommand.body.email,
        {
          email: mockCommand.body.email,
          hashedPassword: 'hashedPassword',
          firstName: mockCommand.body.firstName,
          lastName: mockCommand.body.lastName,
          status: UserStatus.UNVERIFIED,
        },
        EXPIRATION_VERIFICATION_ACCOUNT_SECONDS,
      );
      expect(mockAuthNotifyService.sendVerificationCode).toHaveBeenCalledTimes(
        1,
      );
      expect(mockAuthNotifyService.sendVerificationCode).toHaveBeenCalledWith({
        email: mockCommand.body.email,
        hashedPassword: 'hashedPassword',
        firstName: mockCommand.body.firstName,
        lastName: mockCommand.body.lastName,
        status: UserStatus.UNVERIFIED,
      });
    });

    it('Should throw BadRequestException if email already existed', async () => {
      mockAuthService.isEmailExisted.mockResolvedValueOnce(true);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException('This email already exists in the system!'),
      );
      expect(mockAuthService.generateHashPassword).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(mockAuthNotifyService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('Should throw error if isEmailExisted failed', async () => {
      mockAuthService.isEmailExisted.mockRejectedValueOnce(
        new Error('Something Wrong!'),
      );

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
      expect(mockAuthService.generateHashPassword).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(mockAuthNotifyService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('Should throw error if generateHashPassword failed', async () => {
      mockAuthService.isEmailExisted.mockResolvedValueOnce(false);
      mockAuthService.generateHashPassword.mockRejectedValueOnce(
        new Error('Something Wrong!'),
      );

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
      expect(mockAuthService.isEmailExisted).toHaveBeenCalledTimes(1);
      expect(mockAuthService.isEmailExisted).toHaveBeenCalledWith(
        mockCommand.body.email,
      );
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(mockAuthNotifyService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('Should throw error if cache set failed', async () => {
      mockAuthService.isEmailExisted.mockResolvedValueOnce(false);
      mockAuthService.generateHashPassword.mockResolvedValueOnce(
        'hashedPassword',
      );
      mockCacheService.set.mockRejectedValueOnce(new Error('Something Wrong!'));

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
      expect(mockAuthService.isEmailExisted).toHaveBeenCalledTimes(1);
      expect(mockAuthService.isEmailExisted).toHaveBeenCalledWith(
        mockCommand.body.email,
      );
      expect(mockAuthService.generateHashPassword).toHaveBeenCalledTimes(1);
      expect(mockAuthService.generateHashPassword).toHaveBeenCalledWith(
        mockCommand.body.password,
      );
      expect(mockAuthNotifyService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('Should throw error if sendVerificationCode failed', async () => {
      mockAuthService.isEmailExisted.mockResolvedValueOnce(false);
      mockAuthService.generateHashPassword.mockResolvedValueOnce(
        'hashedPassword',
      );
      mockAuthNotifyService.sendVerificationCode.mockRejectedValueOnce(
        new Error('Something Wrong!'),
      );

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
      expect(mockAuthService.isEmailExisted).toHaveBeenCalledTimes(1);
      expect(mockAuthService.isEmailExisted).toHaveBeenCalledWith(
        mockCommand.body.email,
      );
      expect(mockAuthService.generateHashPassword).toHaveBeenCalledTimes(1);
      expect(mockAuthService.generateHashPassword).toHaveBeenCalledWith(
        mockCommand.body.password,
      );
      expect(mockCacheService.set).toHaveBeenCalledTimes(1);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        mockCommand.body.email,
        {
          email: mockCommand.body.email,
          hashedPassword: 'hashedPassword',
          firstName: mockCommand.body.firstName,
          lastName: mockCommand.body.lastName,
          status: UserStatus.UNVERIFIED,
        },
        EXPIRATION_VERIFICATION_ACCOUNT_SECONDS,
      );
    });
  });
});
