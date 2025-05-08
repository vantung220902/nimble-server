import { AppConfig } from '@config';
import { PrismaService } from '@database';
import { EXPIRATION_REFRESH_TOKEN_IN } from '@modules/authentication';
import { AuthenticationService } from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { JwtPayload } from 'jsonwebtoken';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let moduleRef: TestingModule;

  const mockReqUser = {
    id: '7e97e07f-843f-4ff4-b168-2854104118c7',
    email: 'example@google.com',
    status: UserStatus.ACTIVE,
  };

  const mockCacheService = {
    get: jest.fn(),
  };
  const mockJwtService = {
    signAsync: jest.fn(),
  };
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };
  const mockAppConfig = {
    webUrl: 'http://localhost:6688',
    jwtSecret: 'test-secret',
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: AppConfig,
          useValue: mockAppConfig,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = moduleRef.get<AuthenticationService>(AuthenticationService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  describe('generateHashPassword', () => {
    const password = 'Password@123';

    it('Should generate hashed password successfully', async () => {
      const hashedPassword = await service.generateHashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toEqual(password);
      await expect(bcrypt.compare(password, hashedPassword)).resolves.toEqual(
        true,
      );
    });

    it('Should throw throw error if bcrypt failed', async () => {
      service.generateHashPassword = jest
        .fn()
        .mockRejectedValueOnce(new Error('Something wrong!'));

      await expect(service.generateHashPassword(password)).rejects.toThrow(
        'Something wrong!',
      );
    });
  });

  describe('generateVerificationLink', () => {
    it('Should generate verification link correctly', () => {
      const verificationLink = service.generateVerificationLink(
        mockReqUser.email,
        '12345',
      );

      expect(verificationLink).toEqual(
        `${mockAppConfig.webUrl}/verify?email=example%40google.com&code=12345`,
      );
    });
  });

  describe('getVerificationCacheKey', () => {
    it('Should generate verification cache key correctly', () => {
      const verificationCacheKey = service.getVerificationCacheKey(
        mockReqUser.email,
      );

      expect(verificationCacheKey).toEqual('verification:example@google.com');
    });
  });

  describe('getRefreshTokenCacheKey', () => {
    it('Should generate refresh token cache key correctly', () => {
      const refreshTokenCacheKey = service.getRefreshTokenCacheKey(
        mockReqUser.email,
      );

      expect(refreshTokenCacheKey).toEqual('refreshToken:example@google.com');
    });
  });

  describe('generateToken', () => {
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    it('Should generate token successfully', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const payload: JwtPayload = {
        sub: mockReqUser.id,
        email: mockReqUser.email,
        status: mockReqUser.status,
      };
      const token = await service.generateToken(mockReqUser);

      expect(token).toEqual({
        accessToken,
        refreshToken,
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
        secret: mockAppConfig.jwtSecret,
        expiresIn: EXPIRATION_REFRESH_TOKEN_IN,
      });
    });

    it('Should throw error if jwt service failed', async () => {
      mockJwtService.signAsync.mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      await expect(service.generateToken(mockReqUser)).rejects.toThrow(
        'Something wrong!',
      );
    });
  });

  describe('generateVerificationCode', () => {
    it('Should generate verification code successfully', () => {
      const verificationCode = service.generateVerificationCode();

      expect(verificationCode).toBeDefined();
      expect(verificationCode.length).toEqual(6);
      expect(Number(verificationCode)).toBeGreaterThanOrEqual(100000);
      expect(Number(verificationCode)).toBeLessThanOrEqual(999999);
    });
  });

  describe('isEmailExisted', () => {
    it('Should return true if email existed in database', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockReqUser);
      mockCacheService.get.mockResolvedValueOnce(null);

      const isEmailExisted = await service.isEmailExisted(mockReqUser.email);

      expect(isEmailExisted).toEqual(true);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: mockReqUser.email,
        },
        select: {
          id: true,
        },
      });
      expect(mockCacheService.get).toHaveBeenCalledTimes(1);
      expect(mockCacheService.get).toHaveBeenCalledWith(mockReqUser.email);
    });

    it('Should return true if email existed in cache', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockCacheService.get.mockResolvedValueOnce(JSON.stringify(mockReqUser));

      const isEmailExisted = await service.isEmailExisted(mockReqUser.email);

      expect(isEmailExisted).toEqual(true);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: mockReqUser.email,
        },
        select: {
          id: true,
        },
      });
      expect(mockCacheService.get).toHaveBeenCalledTimes(1);
      expect(mockCacheService.get).toHaveBeenCalledWith(mockReqUser.email);
    });

    it('Should return false if email does not exist in cache and database', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockCacheService.get.mockResolvedValueOnce(null);

      const isEmailExisted = await service.isEmailExisted(mockReqUser.email);

      expect(isEmailExisted).toEqual(false);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: mockReqUser.email,
        },
        select: {
          id: true,
        },
      });
      expect(mockCacheService.get).toHaveBeenCalledTimes(1);
      expect(mockCacheService.get).toHaveBeenCalledWith(mockReqUser.email);
    });

    it('Should throw error if finding database failed', async () => {
      mockPrismaService.user.findUnique.mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      await expect(service.isEmailExisted(mockReqUser.email)).rejects.toThrow(
        'Something wrong!',
      );
      expect(mockCacheService.get).not.toHaveBeenCalled();
    });

    it('Should throw error if finding cache failed', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockReqUser);
      mockCacheService.get.mockRejectedValueOnce(new Error('Something wrong!'));

      await expect(service.isEmailExisted(mockReqUser.email)).rejects.toThrow(
        'Something wrong!',
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: mockReqUser.email,
        },
        select: {
          id: true,
        },
      });
    });
  });

  describe('isValidPassword', () => {
    const password = 'Password@123';

    it('Should return true if matching passwords', async () => {
      const hashedPassword = await service.generateHashPassword(password);
      const isValidPassword = await service.isValidPassword(
        password,
        hashedPassword,
      );

      expect(isValidPassword).toEqual(true);
    });

    it('Should return false if no-matching passwords', async () => {
      const isValidPassword = await service.isValidPassword(
        password,
        'hashed-password',
      );

      expect(isValidPassword).toEqual(false);
    });

    it('Should throw throw error if bcrypt failed', async () => {
      service.isValidPassword = jest
        .fn()
        .mockRejectedValueOnce(new Error('Something wrong!'));

      await expect(
        service.isValidPassword(password, 'hashed-password'),
      ).rejects.toThrow('Something wrong!');
    });
  });
});
