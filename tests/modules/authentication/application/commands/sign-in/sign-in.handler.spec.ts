import { PrismaService } from '@database';
import { EXPIRATION_REFRESH_TOKEN_SECONDS } from '@modules/authentication';
import { SignInHandler } from '@modules/authentication/application';
import { SignInCommand } from '@modules/authentication/application/commands/sign-in/sign-in.command';
import { AuthenticationService } from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';

describe('SignInHandler', () => {
  let handler: SignInHandler;
  let moduleRef: TestingModule;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };
  const mockCacheService = {
    set: jest.fn(),
  };
  const mockAuthService = {
    generateToken: jest.fn(),
    getRefreshTokenCacheKey: jest.fn(),
    isValidPassword: jest.fn(),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        SignInHandler,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    handler = moduleRef.get<SignInHandler>(SignInHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const mockCommand = new SignInCommand({
      email: 'example@google.com',
      password: 'password',
    });
    const mockUser = {
      id: '7e97e07f-843f-4ff4-b168-2854104118c7',
      email: 'example@google.com',
      hashedPassword: 'hashedPassword',
      status: UserStatus.ACTIVE,
    };

    it('Should sign in successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockAuthService.isValidPassword.mockResolvedValueOnce(true);
      mockAuthService.generateToken.mockResolvedValueOnce({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      mockAuthService.getRefreshTokenCacheKey.mockReturnValueOnce(
        `refreshToken:${mockUser.email}`,
      );

      const response = await handler.execute(mockCommand);

      expect(response).toBeDefined();
      expect(response).toEqual({
        accessToken: 'access-token',
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: mockCommand.body.email,
        },
        select: {
          email: true,
          id: true,
          hashedPassword: true,
          status: true,
        },
      });
      expect(mockAuthService.isValidPassword).toHaveBeenCalledTimes(1);
      expect(mockAuthService.isValidPassword).toHaveBeenCalledWith(
        mockCommand.body.password,
        mockUser.hashedPassword,
      );
      expect(mockAuthService.generateToken).toHaveBeenCalledTimes(1);
      expect(mockAuthService.generateToken).toHaveBeenCalledWith({
        email: mockUser.email,
        id: mockUser.id,
        status: mockUser.status,
      });
      expect(mockAuthService.getRefreshTokenCacheKey).toHaveBeenCalledTimes(1);
      expect(mockAuthService.getRefreshTokenCacheKey).toHaveBeenCalledWith(
        mockUser.email,
      );
      expect(mockCacheService.set).toHaveBeenCalledTimes(1);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `refreshToken:${mockUser.email}`,
        'refresh-token',
        EXPIRATION_REFRESH_TOKEN_SECONDS,
      );
    });

    it('Should throw BadRequestException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException('This account does not exist in the system!'),
      );
      expect(mockAuthService.isValidPassword).not.toHaveBeenCalled();
      expect(mockAuthService.generateToken).not.toHaveBeenCalled();
      expect(mockAuthService.getRefreshTokenCacheKey).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it('Should throw BadRequestException if password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockAuthService.isValidPassword.mockResolvedValueOnce(false);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException(
          'Email or password is incorrect. Please try sign in again.',
        ),
      );
      expect(mockAuthService.generateToken).not.toHaveBeenCalled();
      expect(mockAuthService.getRefreshTokenCacheKey).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it('Should throw error if database failed', async () => {
      mockPrismaService.user.findUnique.mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        'Something wrong!',
      );
      expect(mockAuthService.isValidPassword).not.toHaveBeenCalled();
      expect(mockAuthService.generateToken).not.toHaveBeenCalled();
      expect(mockAuthService.getRefreshTokenCacheKey).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it('Should throw error if authentication service failed', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockAuthService.isValidPassword.mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        'Something wrong!',
      );
      expect(mockAuthService.generateToken).not.toHaveBeenCalled();
      expect(mockAuthService.getRefreshTokenCacheKey).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it('Should throw error if cache service failed', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockAuthService.isValidPassword.mockResolvedValueOnce(true);
      mockAuthService.generateToken.mockResolvedValueOnce({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      mockAuthService.getRefreshTokenCacheKey.mockReturnValueOnce(
        `refreshToken:${mockUser.email}`,
      );
      mockCacheService.set.mockRejectedValueOnce(new Error('Something wrong!'));

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        'Something wrong!',
      );
    });
  });
});
