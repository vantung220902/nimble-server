import { PrismaService } from '@database';
import { SignInCommand } from '@modules/authentication/application/commands/sign-in/sign-in.command';
import { SignInHandler } from '@modules/authentication/application/commands/sign-in/sign-in.handler';
import { EXPIRATION_REFRESH_TOKEN_SECONDS } from '@modules/authentication/authentication.enum';
import { AuthenticationService } from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';

describe('SignInHandler', () => {
  let handler: SignInHandler;
  let prismaService: jest.MockedObject<PrismaService>;
  let authService: jest.MockedObject<AuthenticationService>;
  let cacheService: jest.MockedObject<Cache>;

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    } as any as jest.MockedObject<PrismaService>;

    authService = {
      isValidPassword: jest.fn(),
      generateToken: jest.fn(),
      getRefreshTokenCacheKey: jest.fn(),
    } as jest.MockedObject<AuthenticationService>;

    cacheService = {
      set: jest.fn(),
    } as jest.MockedObject<Cache>;

    const testModule = await Test.createTestingModule({
      providers: [
        SignInHandler,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: AuthenticationService,
          useValue: authService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheService,
        },
      ],
    }).compile();

    handler = testModule.get<SignInHandler>(SignInHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const mockCommand = new SignInCommand({
      email: 'example@gmail.com',
      password: 'password',
    });
    const mockUser = {
      id: '7e97e07f-843f-4ff4-b168-2854104118c7',
      email: 'example@google.com',
      hashedPassword: 'hashedPassword',
      status: UserStatus.ACTIVE,
    };

    it('should successfully sign in user and return access token', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      authService.isValidPassword.mockResolvedValue(true);
      authService.generateToken.mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      authService.getRefreshTokenCacheKey.mockReturnValue(
        `refreshToken:${mockUser.email}`,
      );

      const commandResponse = await handler.execute(mockCommand);

      expect(commandResponse).toEqual({ accessToken: 'accessToken' });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockCommand.body.email },
        select: {
          email: true,
          id: true,
          hashedPassword: true,
          status: true,
        },
      });
      expect(authService.isValidPassword).toHaveBeenCalledWith(
        mockCommand.body.password,
        mockUser.hashedPassword,
      );
      expect(authService.generateToken).toHaveBeenCalledWith({
        email: mockUser.email,
        id: mockUser.id,
        status: mockUser.status,
      });
      expect(cacheService.set).toHaveBeenCalledWith(
        `refreshToken:${mockUser.email}`,
        'refreshToken',
        EXPIRATION_REFRESH_TOKEN_SECONDS,
      );
    });

    it('should throw BadRequestException if user does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException('This account does not exist in the system!'),
      );
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      authService.isValidPassword.mockResolvedValue(false);

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        new BadRequestException(
          'Email or password is incorrect. Please try sign in again.',
        ),
      );
    });

    it('should handle cache service errors', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      authService.isValidPassword.mockResolvedValue(true);
      authService.generateToken.mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      authService.getRefreshTokenCacheKey.mockReturnValue(
        `refreshToken:${mockUser.email}`,
      );
      cacheService.set.mockRejectedValue(new Error('Somethings wrong'));

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        'Somethings wrong',
      );
    });
  });
});
