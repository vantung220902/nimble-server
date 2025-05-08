import { EXPIRATION_REFRESH_TOKEN_SECONDS } from '@modules/authentication';
import { RefreshHandler } from '@modules/authentication/application';
import { RefreshCommand } from '@modules/authentication/application/commands/refresh/refresh.command';
import { AuthenticationService } from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';

describe('RefreshHandler', () => {
  let handler: RefreshHandler;
  let moduleRef: TestingModule;

  const mockAuthService = {
    generateToken: jest.fn(),
    getRefreshTokenCacheKey: jest.fn(),
  };
  const mockCacheService = {
    set: jest.fn(),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        RefreshHandler,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    handler = moduleRef.get<RefreshHandler>(RefreshHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const mockReqUser = {
      sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
      email: 'example@google.com',
      status: UserStatus.ACTIVE,
    };
    const refreshCommand = new RefreshCommand(mockReqUser);

    it('Should refresh token correctly', async () => {
      mockAuthService.generateToken.mockResolvedValueOnce({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      mockAuthService.getRefreshTokenCacheKey.mockReturnValue(
        `refreshToken:${mockReqUser.email}`,
      );

      const refreshResponse = await handler.execute(refreshCommand);

      expect(refreshResponse).toBeDefined();
      expect(refreshResponse).toEqual({
        accessToken: 'access-token',
      });
      expect(mockAuthService.generateToken).toHaveBeenCalledTimes(1);
      expect(mockAuthService.generateToken).toHaveBeenCalledWith({
        email: mockReqUser.email,
        id: mockReqUser.sub,
        status: mockReqUser.status as UserStatus,
      });
      expect(mockAuthService.getRefreshTokenCacheKey).toHaveBeenCalledTimes(1);
      expect(mockAuthService.getRefreshTokenCacheKey).toHaveBeenCalledWith(
        mockReqUser.email,
      );
      expect(mockCacheService.set).toHaveBeenCalledTimes(1);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `refreshToken:${mockReqUser.email}`,
        'refresh-token',
        EXPIRATION_REFRESH_TOKEN_SECONDS,
      );
    });

    it('Should throw error if authentication service generate token failed', async () => {
      mockAuthService.generateToken.mockRejectedValueOnce(
        new Error('Something wrong!'),
      );

      await expect(handler.execute(refreshCommand)).rejects.toThrow(
        'Something wrong!',
      );

      expect(mockAuthService.getRefreshTokenCacheKey).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it('Should throw error if cache service failed', async () => {
      mockAuthService.generateToken.mockResolvedValueOnce({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      mockAuthService.getRefreshTokenCacheKey.mockReturnValue(
        `refreshToken:${mockReqUser.email}`,
      );
      mockCacheService.set.mockRejectedValueOnce(new Error('Something wrong!'));

      await expect(handler.execute(refreshCommand)).rejects.toThrow(
        'Something wrong!',
      );

      expect(mockAuthService.generateToken).toHaveBeenCalledTimes(1);
      expect(mockAuthService.generateToken).toHaveBeenCalledWith({
        email: mockReqUser.email,
        id: mockReqUser.sub,
        status: mockReqUser.status as UserStatus,
      });
      expect(mockAuthService.getRefreshTokenCacheKey).toHaveBeenCalledTimes(1);
      expect(mockAuthService.getRefreshTokenCacheKey).toHaveBeenCalledWith(
        mockReqUser.email,
      );
    });
  });
});
