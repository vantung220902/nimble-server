import { JwtStrategy } from '@common/strategies';
import { AppConfig } from '@config';
import { PrismaService } from '@database';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let moduleRef: TestingModule;

  const mockAppConfig = {
    jwtSecret: 'test-secret',
  };
  const mockDbContext = {
    user: {
      findUnique: jest.fn(),
    },
  };
  const mockCacheService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: mockDbContext },
        { provide: AppConfig, useValue: mockAppConfig },
        { provide: CACHE_MANAGER, useValue: mockCacheService },
      ],
    }).compile();

    jwtStrategy = moduleRef.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('Should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('Should validate user token is valid', async () => {
    const mockRequest = {
      headers: { authorization: 'Bearer test-token' },
    } as Request;

    const mockPayload = {
      sub: '1',
      email: 'test@gmail.com',
    };
    const mockUser = {
      email: 'test@gmail.com',
      status: 'Active',
    };

    mockCacheService.get.mockResolvedValueOnce(null);
    mockDbContext.user.findUnique.mockResolvedValueOnce(mockUser);

    const response = await jwtStrategy.validate(mockRequest, mockPayload);
    expect(response).toEqual({
      ...mockPayload,
      email: mockUser.email,
      status: mockUser.status,
    });
    expect(mockCacheService.get).toHaveBeenCalledWith('blacklist:test-token');
    expect(mockDbContext.user.findUnique).toHaveBeenLastCalledWith({
      where: {
        id: mockPayload.sub,
      },
      select: {
        email: true,
        status: true,
      },
    });
  });

  it('Should throw UnauthorizedException when token is in blacklist', async () => {
    const mockRequest = {
      headers: { authorization: 'Bearer test-token' },
    } as Request;
    const mockPayload = {
      sub: '1',
      email: 'test@gmail.com',
    };

    mockCacheService.get.mockResolvedValueOnce('true');
    mockDbContext.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      jwtStrategy.validate(mockRequest, mockPayload),
    ).rejects.toThrow(new UnauthorizedException('Token is banned!'));
    expect(mockCacheService.get).toHaveBeenCalledWith('blacklist:test-token');
    expect(mockDbContext.user.findUnique).not.toHaveBeenCalled();
  });

  it('Should throw UnauthorizedException when user not found', async () => {
    const mockRequest = {
      headers: { authorization: 'Bearer test-token' },
    } as Request;
    const mockPayload = {
      sub: '1',
      email: 'test@gmail.com',
    };

    mockCacheService.get.mockResolvedValueOnce(null);
    mockDbContext.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      jwtStrategy.validate(mockRequest, mockPayload),
    ).rejects.toThrow(new UnauthorizedException('Token is invalid!'));
    expect(mockCacheService.get).toHaveBeenCalledWith('blacklist:test-token');
    expect(mockDbContext.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: mockPayload.sub,
      },
      select: {
        email: true,
        status: true,
      },
    });
  });
});
