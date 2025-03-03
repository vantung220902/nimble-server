import { EmailService } from '@email/services';
import { UserDto } from '@generated';
import { EXPIRATION_VERIFICATION_CODE_SECONDS } from '@modules/authentication/authentication.enum';
import { AuthenticationNotifyService } from '@modules/authentication/services/authentication-notify.service';
import { AuthenticationService } from '@modules/authentication/services/authentication.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';

describe('AuthenticationNotifyService', () => {
  let service: AuthenticationNotifyService;
  let cacheService: jest.MockedObject<Cache>;
  let emailService: jest.MockedObject<EmailService>;
  let authService: jest.MockedObject<AuthenticationService>;
  const mockId = '7e97e07f-843f-4ff4-b168-2854104118c7';
  const mockCode = '123456';
  const mockEmail = 'example@google.com';
  const mockVerificationCacheKey = `verification:${mockEmail}`;
  const mockVerificationLink = 'http://localhost:6688/verify';
  const mockHtml = '<html>Nimble</html>';

  const mockUser = {
    id: mockId,
    email: mockEmail,
    firstName: 'Tung',
    lastName: 'Nguyen',
    status: UserStatus.UNVERIFIED,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserDto;

  beforeEach(async () => {
    cacheService = {
      set: jest.fn(),
    } as jest.MockedObject<Cache>;

    emailService = {
      generateVerificationTemplate: jest.fn(),
      sendEmail: jest.fn(),
    } as jest.MockedObject<EmailService>;

    authService = {
      generateVerificationCode: jest.fn(),
      getVerificationCacheKey: jest.fn(),
      generateVerificationLink: jest.fn(),
    } as jest.MockedObject<AuthenticationService>;

    const testModule = await Test.createTestingModule({
      providers: [
        AuthenticationNotifyService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheService,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
        {
          provide: AuthenticationService,
          useValue: authService,
        },
      ],
    }).compile();

    service = testModule.get<AuthenticationNotifyService>(
      AuthenticationNotifyService,
    );
  });

  describe('sendVerificationCode', () => {
    it('should successfully send verification code', async () => {
      authService.generateVerificationCode.mockReturnValue(mockCode);
      authService.getVerificationCacheKey.mockReturnValue(
        mockVerificationCacheKey,
      );
      authService.generateVerificationLink.mockReturnValue(
        mockVerificationLink,
      );
      emailService.generateVerificationTemplate.mockReturnValue(mockHtml);

      await service.sendVerificationCode(mockUser);

      expect(authService.generateVerificationCode).toHaveBeenCalled();
      expect(authService.getVerificationCacheKey).toHaveBeenCalledWith(
        mockEmail,
      );
      expect(authService.generateVerificationLink).toHaveBeenCalledWith(
        mockEmail,
        mockCode,
      );

      expect(cacheService.set).toHaveBeenCalledWith(
        mockVerificationCacheKey,
        mockCode,
        EXPIRATION_VERIFICATION_CODE_SECONDS,
      );

      expect(emailService.generateVerificationTemplate).toHaveBeenCalledWith({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        code: mockCode,
        link: mockVerificationLink,
      });

      expect(emailService.sendEmail).toHaveBeenCalledWith({
        html: mockHtml,
        to: mockEmail,
        subject: 'Verify Your Email Address',
      });
    });

    it('should handle cache service error', async () => {
      const error = new Error('Somethings wrong');
      authService.generateVerificationCode.mockReturnValue(mockCode);
      cacheService.set.mockRejectedValue(error);

      await expect(service.sendVerificationCode(mockUser)).rejects.toThrow(
        error,
      );
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle email service error', async () => {
      const error = new Error('Somethings wrong');
      authService.generateVerificationCode.mockReturnValue(mockCode);
      emailService.sendEmail.mockRejectedValue(error);

      await expect(service.sendVerificationCode(mockUser)).rejects.toThrow(
        error,
      );
    });
  });
});
