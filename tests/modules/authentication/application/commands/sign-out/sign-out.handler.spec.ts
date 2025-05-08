import { SignOutHandler } from '@modules/authentication/application';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';

describe('SignOutHandler', () => {
  let handler: SignOutHandler;
  let moduleRef: TestingModule;

  const mockJwtService = {
    decode: jest.fn(),
  };
  const mockCacheService = {
    set: jest.fn(),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        SignOutHandler,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    handler = moduleRef.get(SignOutHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleRef.close();
  });

  describe('execute', () => {
    const mockAccessToken = 'accessToken';
    const mockReqUser = {
      sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
      email: 'example@google.com',
      status: UserStatus.ACTIVE,
    };

    it('Should sign out successfully', async () => {
      mockJwtService.decode.mockResolvedValueOnce({ exp: 0 });

      await handler.execute({
        accessToken: mockAccessToken,
        reqUser: mockReqUser,
      });

      expect(mockJwtService.decode).toHaveBeenCalledTimes(1);
      expect(mockJwtService.decode).toHaveBeenCalledWith(mockAccessToken);
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it('Should set signed out access token into blacklist', async () => {
      mockJwtService.decode.mockResolvedValueOnce({ exp: Date.now() });

      await handler.execute({
        accessToken: mockAccessToken,
        reqUser: mockReqUser,
      });

      expect(mockJwtService.decode).toHaveBeenCalledTimes(1);
      expect(mockJwtService.decode).toHaveBeenCalledWith(mockAccessToken);
      expect(mockCacheService.set).toHaveBeenCalledTimes(1);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `blacklist:${mockAccessToken}`,
        'block',
        expect.any(Number),
      );
    });

    it('Should throw error if jwt service failed', async () => {
      mockJwtService.decode.mockRejectedValueOnce(
        new Error('Something Wrong!'),
      );

      await expect(
        handler.execute({
          accessToken: mockAccessToken,
          reqUser: mockReqUser,
        }),
      ).rejects.toThrow('Something Wrong!');
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });
  });
});
