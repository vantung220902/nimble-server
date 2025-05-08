import { AuthenticationGuard } from '@common/guards';
import { ExecutionContext, HttpArgumentsHost } from '@nestjs/common/interfaces';
import { AuthGuard } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { instance, mock, reset, when } from 'ts-mockito';

describe('AuthenticationGuard', () => {
  let authenticationGuard: AuthenticationGuard;
  let moduleRef: TestingModule;

  const mockReq = mock<Request>();
  const mockRes = mock<Response>();
  const mockHttpHost = mock<HttpArgumentsHost>();
  const mockContext = mock<ExecutionContext>();

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [AuthenticationGuard],
    }).compile();

    authenticationGuard =
      moduleRef.get<AuthenticationGuard>(AuthenticationGuard);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  beforeAll(() => {
    when(mockContext.switchToHttp()).thenReturn(instance(mockHttpHost));
    when(mockHttpHost.getRequest()).thenReturn(instance(mockReq));
    when(mockHttpHost.getResponse()).thenReturn(instance(mockRes));
  });

  afterAll(() => {
    reset<any>(mockRes, mockReq, mockContext, mockHttpHost);
  });

  it('Should be defined', () => {
    expect(authenticationGuard).toBeDefined();
  });

  it('Should inherit AuthGuard', () => {
    expect(authenticationGuard).toBeInstanceOf(AuthGuard('jwt'));
    expect(authenticationGuard.canActivate).toBeDefined();
  });

  it('Should handle canActivate correctly', async () => {
    const mockCanActivate = jest.fn().mockResolvedValue(true);

    const spy = jest.spyOn(AuthGuard('jwt').prototype, 'canActivate');
    spy.mockImplementation(mockCanActivate);

    const result = await authenticationGuard.canActivate(instance(mockContext));

    expect(result).toEqual(true);
    expect(mockCanActivate).toHaveBeenCalledTimes(1);
    expect(mockCanActivate).toHaveBeenCalled();
  });

  it('Should throws unauthorized error', async () => {
    const mockCanActivate = jest
      .fn()
      .mockRejectedValue(new Error('Unauthorized'));

    const spy = jest.spyOn(AuthGuard('jwt').prototype, 'canActivate');
    spy.mockImplementation(mockCanActivate);

    await expect(() =>
      authenticationGuard.canActivate(instance(mockContext)),
    ).rejects.toThrow('Unauthorized');
  });
});
