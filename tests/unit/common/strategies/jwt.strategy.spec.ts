import { JwtStrategy } from '@common/strategies/jwt.strategy';
import { AppConfig } from '@config';
import { PrismaService } from '@database';
import { UnauthorizedException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Request } from 'express';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaService: jest.MockedObject<PrismaService>;
  let cacheService: jest.MockedObject<Cache>;
  let appConfig: jest.MockedObject<AppConfig>;

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    } as any as jest.MockedObject<PrismaService>;

    cacheService = {
      get: jest.fn(),
    } as jest.MockedObject<Cache>;

    appConfig = {
      jwtSecret: 'test-secret',
    } as jest.MockedObject<AppConfig>;

    strategy = new JwtStrategy(prismaService, appConfig, cacheService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user data when token is valid', async () => {
    const mockRequest = {
      headers: { authorization: 'Bearer test-token' },
    } as Request;

    const mockPayload = {
      sub: '1',
      email: 'test@example.com',
    };

    const mockUser = {
      email: 'test@example.com',
      status: 'ACTIVE',
    };

    cacheService.get.mockResolvedValue(null);
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await strategy.validate(mockRequest, mockPayload);

    expect(result).toEqual({
      ...mockPayload,
      email: mockUser.email,
      status: mockUser.status,
    });
    expect(cacheService.get).toHaveBeenCalledWith('blacklist:test-token');
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockPayload.sub },
      select: { email: true, status: true },
    });
  });

  it('should throw UnauthorizedException when token is in blacklist', async () => {
    const mockRequest = {
      headers: { authorization: 'Bearer test-token' },
    } as Request;

    const mockPayload = {
      sub: '1',
      email: 'test@example.com',
    };

    cacheService.get.mockResolvedValue('true');

    await expect(strategy.validate(mockRequest, mockPayload)).rejects.toThrow(
      new UnauthorizedException('Token is banned!'),
    );
    expect(cacheService.get).toHaveBeenCalledWith('blacklist:test-token');
    expect(prismaService.user.findUnique).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when user not found', async () => {
    const mockRequest = {
      headers: { authorization: 'Bearer test-token' },
    } as Request;

    const mockPayload = {
      sub: '1',
      email: 'test@example.com',
    };

    cacheService.get.mockResolvedValue(null);
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(strategy.validate(mockRequest, mockPayload)).rejects.toThrow(
      new UnauthorizedException('Token is invalid!'),
    );
    expect(cacheService.get).toHaveBeenCalledWith('blacklist:test-token');
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockPayload.sub },
      select: { email: true, status: true },
    });
  });
});
