import { AppConfig } from '@config';
import { PrismaService } from '@database';
import { EXPIRATION_REFRESH_TOKEN_IN } from '@modules/authentication/authentication.enum';
import { AuthenticationService } from '@modules/authentication/services/authentication.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Cache } from 'cache-manager';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let jwtService: jest.MockedObject<JwtService>;
  let appConfig: jest.MockedObject<AppConfig>;
  let prismaService: jest.MockedObject<PrismaService>;
  let cacheService: jest.MockedObject<Cache>;

  const mockPassword = 'password';
  const mockEmail = 'example@google.com';
  const mockCode = '123456';
  const mockAccessToken = 'accessToken';
  const mockRefreshToken = 'refreshToken';
  const mockId = '7e97e07f-843f-4ff4-b168-2854104118c7';
  const mockUser = {
    id: mockId,
    email: mockEmail,
    status: UserStatus.ACTIVE,
  };

  beforeEach(async () => {
    jwtService = {
      signAsync: jest.fn(),
    } as jest.MockedObject<JwtService>;

    appConfig = {
      webUrl: 'http://localhost:6688',
      jwtSecret: 'test-secret',
    } as jest.MockedObject<AppConfig>;

    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    } as any as jest.MockedObject<PrismaService>;

    cacheService = {
      get: jest.fn(),
    } as jest.MockedObject<Cache>;

    const testModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: AppConfig,
          useValue: appConfig,
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheService,
        },
      ],
    }).compile();

    service = testModule.get<AuthenticationService>(AuthenticationService);
  });

  describe('generateHashPassword', () => {
    it('should generate hash password success', async () => {
      const hashedPassword = await service.generateHashPassword(mockPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(mockPassword);
      expect(await bcrypt.compare(mockPassword, hashedPassword)).toBe(true);
    });
  });

  describe('generateVerificationLink', () => {
    it('should generate correct verification link', () => {
      const expected = `${appConfig.webUrl}/verify?email=${encodeURIComponent(mockEmail)}&code=${mockCode}`;

      expect(service.generateVerificationLink(mockEmail, mockCode)).toBe(
        expected,
      );
    });
  });

  describe('getVerificationCacheKey', () => {
    it('should generate verification cache key', () => {
      expect(service.getVerificationCacheKey(mockEmail)).toBe(
        `verification:${mockEmail}`,
      );
    });
  });

  describe('getRefreshTokenCacheKey', () => {
    it('should generate refresh token cache key', () => {
      expect(service.getRefreshTokenCacheKey(mockEmail)).toBe(
        `refreshToken:${mockEmail}`,
      );
    });
  });

  describe('generateToken', () => {
    it('should generate access and refresh tokens', async () => {
      jwtService.signAsync
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);

      const generatedToken = await service.generateToken(mockUser);

      expect(generatedToken).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });

      const payloadToken = {
        sub: mockUser.id,
        email: mockUser.email,
        status: mockUser.status,
      };

      expect(jwtService.signAsync).toHaveBeenCalledWith(payloadToken);

      expect(jwtService.signAsync).toHaveBeenCalledWith(payloadToken, {
        secret: appConfig.jwtSecret,
        expiresIn: EXPIRATION_REFRESH_TOKEN_IN,
      });
    });
  });

  describe('generateVerificationCode', () => {
    it('should generate valid verification code', () => {
      const generatedCode = service.generateVerificationCode();

      expect(generatedCode).toMatch(/^\d{6}$/);
      expect(parseInt(generatedCode)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(generatedCode)).toBeLessThanOrEqual(999999);
    });
  });

  describe('isEmailExisted', () => {
    it('should return true if user exists in database', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockId,
      });
      cacheService.get.mockResolvedValue(null);

      expect(await service.isEmailExisted(mockEmail)).toBe(true);
    });

    it('should return true if user exists in cache', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      cacheService.get.mockResolvedValue({ id: '1' });

      expect(await service.isEmailExisted(mockEmail)).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      cacheService.get.mockResolvedValue(null);

      expect(await service.isEmailExisted(mockEmail)).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for matching passwords', async () => {
      const hashedPassword = await bcrypt.hash(mockPassword, 10);

      expect(await service.isValidPassword(mockPassword, hashedPassword)).toBe(
        true,
      );
    });

    it('should return false for non-matching passwords', async () => {
      const hashedPassword = await bcrypt.hash('differentPassword', 10);

      expect(await service.isValidPassword(mockPassword, hashedPassword)).toBe(
        false,
      );
    });
  });
});
