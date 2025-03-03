import { SignOutCommand } from '@modules/authentication/application/commands/sign-out/sign-out.command';
import { SignOutHandler } from '@modules/authentication/application/commands/sign-out/sign-out.handler';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';

describe('SignOutHandler', () => {
  let handler: SignOutHandler;
  let jwtService: jest.MockedObject<JwtService>;
  let cacheService: jest.MockedObject<Cache>;

  beforeEach(async () => {
    jwtService = {
      decode: jest.fn(),
    } as jest.MockedObject<JwtService>;

    cacheService = {
      set: jest.fn(),
    } as jest.MockedObject<Cache>;

    const testModule = await Test.createTestingModule({
      providers: [
        SignOutHandler,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheService,
        },
      ],
    }).compile();

    handler = testModule.get<SignOutHandler>(SignOutHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const mockCommand = new SignOutCommand('accessToken', {
      sub: '7e97e07f-843f-4ff4-b168-2854104118c7',
      email: 'example@google.com',
      status: UserStatus.ACTIVE,
    });

    it('should blacklist token if it has not expired', async () => {
      const stillValidTokenTime = Math.floor(
        (Date.now() + Math.random() * 10000) / 1000,
      );
      jwtService.decode.mockReturnValue({ exp: stillValidTokenTime });

      await handler.execute(mockCommand);

      expect(jwtService.decode).toHaveBeenCalledWith(mockCommand.accessToken);
      expect(cacheService.set).toHaveBeenCalledWith(
        `blacklist:${mockCommand.accessToken}`,
        'block',
        expect.any(Number),
      );
    });

    it('should not blacklist token if it has expired', async () => {
      const expiredTokenTime = Math.floor(
        (Date.now() - Math.random() * 10000) / 1000,
      );

      jwtService.decode.mockReturnValue({ exp: expiredTokenTime });

      await handler.execute(mockCommand);

      expect(jwtService.decode).toHaveBeenCalledWith(mockCommand.accessToken);
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('should handle cache service errors', async () => {
      const stillValidTokenTime = Math.floor(
        (Date.now() + Math.random() * 10000) / 1000,
      );
      jwtService.decode.mockReturnValue({ exp: stillValidTokenTime });
      cacheService.set.mockRejectedValue(new Error('Somethings wrong'));

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        'Somethings wrong',
      );
    });

    it('should handle JWT decode errors', async () => {
      jwtService.decode.mockImplementation(() => {
        throw new Error('JWT decode error');
      });

      await expect(handler.execute(mockCommand)).rejects.toThrow(
        'JWT decode error',
      );
    });
  });
});
