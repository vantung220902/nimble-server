import { RefreshCommand } from '@modules/authentication/application/commands/refresh/refresh.command';
import { RefreshHandler } from '@modules/authentication/application/commands/refresh/refresh.handler';
import { EXPIRATION_REFRESH_TOKEN_SECONDS } from '@modules/authentication/authentication.enum';
import { AuthenticationService } from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';

describe('RefreshHandler', () => {
  let handler: RefreshHandler;
  let authService: jest.MockedObject<AuthenticationService>;
  let cacheService: jest.MockedObject<Cache>;

  beforeEach(async () => {
    authService = {
      generateToken: jest.fn(),
      getRefreshTokenCacheKey: jest.fn(),
    } as jest.MockedObject<AuthenticationService>;

    cacheService = {
      set: jest.fn(),
    } as jest.MockedObject<Cache>;

    const testModule = await Test.createTestingModule({
      providers: [
        RefreshHandler,
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

    handler = testModule.get<RefreshHandler>(RefreshHandler);
  });

  describe('execute', () => {
    const mockReqUser = {
      sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
      email: 'example@google.com',
      status: UserStatus.ACTIVE,
    };
    const mockCommand = new RefreshCommand(mockReqUser);
    const mockCacheKey = `refreshToken:${mockReqUser.email}`;
    const mockTokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };

    it('should successfully refresh tokens', async () => {
      authService.generateToken.mockResolvedValue(mockTokens);
      authService.getRefreshTokenCacheKey.mockReturnValue(mockCacheKey);

      const refreshResponse = await handler.execute(mockCommand);

      expect(refreshResponse).toEqual({ accessToken: mockTokens.accessToken });
      expect(authService.generateToken).toHaveBeenCalledWith({
        email: mockReqUser.email,
        id: mockReqUser.sub,
        status: mockReqUser.status,
      });
      expect(authService.getRefreshTokenCacheKey).toHaveBeenCalledWith(
        mockReqUser.email,
      );
      expect(cacheService.set).toHaveBeenCalledWith(
        mockCacheKey,
        mockTokens.refreshToken,
        EXPIRATION_REFRESH_TOKEN_SECONDS,
      );
    });

    it('should handle token generation failure', async () => {
      const error = new Error('Token generation failed');
      authService.generateToken.mockRejectedValue(error);

      await expect(handler.execute(mockCommand)).rejects.toThrow(error);
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('should handle cache service failure', async () => {
      const error = new Error('Somethings wrong');

      authService.generateToken.mockResolvedValue(mockTokens);
      authService.getRefreshTokenCacheKey.mockReturnValue(mockCacheKey);
      cacheService.set.mockRejectedValue(error);

      await expect(handler.execute(mockCommand)).rejects.toThrow(error);
    });
  });
});
