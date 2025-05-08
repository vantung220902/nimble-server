import { EmailService } from '@email/services';
import { UserDto } from '@generated';
import { EXPIRATION_VERIFICATION_CODE_SECONDS } from '@modules/authentication';
import {
  AuthenticationNotifyService,
  AuthenticationService,
} from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';

describe('AuthenticationNotifyService', () => {
  let service: AuthenticationNotifyService;
  let moduleRef: TestingModule;

  const mockReqUser = {
    id: '7e97e07f-843f-4ff4-b168-2854104118c7',
    email: 'example@google.com',
    firstName: 'Tung',
    lastName: 'Nguyen',
    status: UserStatus.UNVERIFIED,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserDto;
  const code = '123456';
  const verificationCacheKey = `verification:${mockReqUser.email}`;
  const verificationLink = 'http://localhost:6688/verify';
  const html = '<html>Nimble</html>';

  const mockCacheService = {
    set: jest.fn(),
  };
  const mockEmailService = {
    generateVerificationTemplate: jest.fn(),
    sendEmail: jest.fn(),
  };
  const mockAuthService = {
    generateVerificationCode: jest.fn().mockReturnValue(code),
    getVerificationCacheKey: jest.fn().mockReturnValue(verificationCacheKey),
    generateVerificationLink: jest.fn().mockReturnValue(verificationLink),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        AuthenticationNotifyService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = moduleRef.get<AuthenticationNotifyService>(
      AuthenticationNotifyService,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  describe('sendVerificationCode', () => {
    it('Should successfully send verification code', async () => {
      mockEmailService.generateVerificationTemplate.mockReturnValueOnce(html);

      await service.sendVerificationCode(mockReqUser);

      expect(mockAuthService.generateVerificationCode).toHaveBeenCalled();
      expect(mockAuthService.getVerificationCacheKey).toHaveBeenCalled();
      expect(mockAuthService.getVerificationCacheKey).toHaveBeenCalledWith(
        mockReqUser.email,
      );
      expect(mockAuthService.generateVerificationLink).toHaveBeenCalled();
      expect(mockAuthService.generateVerificationLink).toHaveBeenCalledWith(
        mockReqUser.email,
        code,
      );
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith(
        verificationCacheKey,
        code,
        EXPIRATION_VERIFICATION_CODE_SECONDS,
      );
      expect(mockEmailService.generateVerificationTemplate).toHaveBeenCalled();
      expect(
        mockEmailService.generateVerificationTemplate,
      ).toHaveBeenCalledWith({
        firstName: mockReqUser.firstName,
        lastName: mockReqUser.lastName,
        code,
        link: verificationLink,
      });
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        html,
        to: mockReqUser.email,
        subject: 'Verify Your Email Address',
      });
    });

    it('Should throw error when cache service failed', async () => {
      mockCacheService.set.mockRejectedValueOnce(new Error('Something wrong!'));

      await expect(service.sendVerificationCode(mockReqUser)).rejects.toThrow(
        'Something wrong!',
      );

      expect(mockAuthService.generateVerificationCode).toHaveBeenCalled();
      expect(mockAuthService.getVerificationCacheKey).toHaveBeenCalled();
      expect(mockAuthService.getVerificationCacheKey).toHaveBeenCalledWith(
        mockReqUser.email,
      );
      expect(mockAuthService.generateVerificationLink).toHaveBeenCalled();
      expect(mockAuthService.generateVerificationLink).toHaveBeenCalledWith(
        mockReqUser.email,
        code,
      );
      expect(
        mockEmailService.generateVerificationTemplate,
      ).not.toHaveBeenCalled();
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('Should throw error when email service failed', async () => {
      mockEmailService.sendEmail.mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      await expect(service.sendVerificationCode(mockReqUser)).rejects.toThrow(
        'Something wrong!',
      );

      expect(mockAuthService.generateVerificationCode).toHaveBeenCalled();
      expect(mockAuthService.getVerificationCacheKey).toHaveBeenCalled();
      expect(mockAuthService.getVerificationCacheKey).toHaveBeenCalledWith(
        mockReqUser.email,
      );
      expect(mockAuthService.generateVerificationLink).toHaveBeenCalled();
      expect(mockAuthService.generateVerificationLink).toHaveBeenCalledWith(
        mockReqUser.email,
        code,
      );
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith(
        verificationCacheKey,
        code,
        EXPIRATION_VERIFICATION_CODE_SECONDS,
      );
      expect(mockEmailService.generateVerificationTemplate).toHaveBeenCalled();
      expect(
        mockEmailService.generateVerificationTemplate,
      ).toHaveBeenCalledWith({
        firstName: mockReqUser.firstName,
        lastName: mockReqUser.lastName,
        code,
        link: verificationLink,
      });
    });
  });
});
