import { AuthenticationCommandEndpoint } from '@modules/authentication/application';
import { RefreshCommand } from '@modules/authentication/application/commands/refresh/refresh.command';
import { ResendVerificationCommand } from '@modules/authentication/application/commands/resend-verification/resend-verification.command';
import { ResendVerificationRequestBody } from '@modules/authentication/application/commands/resend-verification/resend-verification.request-body';
import { SignInCommand } from '@modules/authentication/application/commands/sign-in/sign-in.command';
import { SignInRequestBody } from '@modules/authentication/application/commands/sign-in/sign-in.request-body';
import { SignInCommandResponse } from '@modules/authentication/application/commands/sign-in/sign-in.response';
import { SignOutCommand } from '@modules/authentication/application/commands/sign-out/sign-out.command';
import { SignUpCommand } from '@modules/authentication/application/commands/sign-up/sign-up.command';
import { SignUpRequestBody } from '@modules/authentication/application/commands/sign-up/sign-up.request-body';
import { VerifyUserCommand } from '@modules/authentication/application/commands/verify-user/verify-user.command';
import { VerifyUserRequestBody } from '@modules/authentication/application/commands/verify-user/verify-user.request-body';
import { CommandBus } from '@nestjs/cqrs';
import { anyOfClass, instance, mock, verify, when } from 'ts-mockito';

describe('AuthenticationCommandEndpoint', () => {
  let commandBus: CommandBus;
  let authenticationCommandEndpoint: AuthenticationCommandEndpoint;

  beforeEach(() => {
    commandBus = mock(CommandBus);
    authenticationCommandEndpoint = new AuthenticationCommandEndpoint(
      instance(commandBus),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/sign-in', () => {
    const body = instance(mock(SignInRequestBody));

    it('Should execute signIn on the CommandBus', async () => {
      const response = instance(mock(SignInCommandResponse));

      when(
        commandBus.execute<SignInCommand, SignInCommandResponse>(
          anyOfClass(SignInCommand),
        ),
      ).thenResolve(response);

      const signInResponse = await authenticationCommandEndpoint.signIn(body);

      expect(signInResponse).toEqual(response);
      verify(
        commandBus.execute<SignInCommand, SignInCommandResponse>(
          anyOfClass(SignInCommand),
        ),
      ).once();
    });

    it('Should throw error if CommandBus failed', async () => {
      when(
        commandBus.execute<SignInCommand, SignInCommandResponse>(
          anyOfClass(SignInCommand),
        ),
      ).thenReject(new Error('Something Wrong!'));

      await expect(authenticationCommandEndpoint.signIn(body)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
      verify(
        commandBus.execute<SignInCommand, SignInCommandResponse>(
          anyOfClass(SignInCommand),
        ),
      ).once();
    });
  });

  describe('/sign-up', () => {
    const body = instance(mock(SignUpRequestBody));

    it('Should execute signUp on the CommandBus', async () => {
      await authenticationCommandEndpoint.signUp(body);

      verify(
        commandBus.execute<SignUpRequestBody, void>(anyOfClass(SignUpCommand)),
      ).once();
    });

    it('Should throw error if CommandBus failed', async () => {
      when(
        commandBus.execute<SignUpCommand, void>(anyOfClass(SignUpCommand)),
      ).thenReject(new Error('Something Wrong!'));

      await expect(authenticationCommandEndpoint.signUp(body)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
      verify(
        commandBus.execute<SignUpRequestBody, void>(anyOfClass(SignUpCommand)),
      ).once();
    });
  });

  describe('/refresh', () => {
    const mockReq = instance(mock(Request));

    it('Should execute refresh on the CommandBus', async () => {
      await authenticationCommandEndpoint.refresh(mockReq);

      verify(
        commandBus.execute<RefreshCommand, void>(anyOfClass(RefreshCommand)),
      ).once();
    });

    it('Should throw error if CommandBus failed', async () => {
      when(
        commandBus.execute<RefreshCommand, void>(anyOfClass(RefreshCommand)),
      ).thenReject(new Error('Something Wrong!'));

      await expect(
        authenticationCommandEndpoint.refresh(mockReq),
      ).rejects.toThrow(new Error('Something Wrong!'));
      verify(
        commandBus.execute<RefreshCommand, void>(anyOfClass(RefreshCommand)),
      ).once();
    });
  });

  describe('/sign-out', () => {
    const mockReq = {
      ...instance(mock(Request)),
      headers: {
        authentication: 'Bearer access token',
      },
    };

    it('Should execute signOut on the CommandBus', async () => {
      await authenticationCommandEndpoint.signOut(mockReq);

      verify(
        commandBus.execute<SignOutCommand, void>(anyOfClass(SignOutCommand)),
      ).once();
    });

    it('Should throw error if CommandBus failed', async () => {
      when(
        commandBus.execute<SignOutCommand, void>(anyOfClass(SignOutCommand)),
      ).thenReject(new Error('Something Wrong!'));

      await expect(
        authenticationCommandEndpoint.signOut(mockReq),
      ).rejects.toThrow(new Error('Something Wrong!'));
      verify(
        commandBus.execute<SignOutCommand, void>(anyOfClass(SignOutCommand)),
      ).once();
    });
  });

  describe('/resend-verification', () => {
    const body = instance(mock(ResendVerificationRequestBody));

    it('Should execute resendVerification on the CommandBus', async () => {
      await authenticationCommandEndpoint.resendVerification(body);

      verify(
        commandBus.execute<ResendVerificationCommand, void>(
          anyOfClass(ResendVerificationCommand),
        ),
      ).once();
    });

    it('Should throw error if CommandBus failed', async () => {
      when(
        commandBus.execute<ResendVerificationCommand, void>(
          anyOfClass(ResendVerificationCommand),
        ),
      ).thenReject(new Error('Something Wrong!'));

      await expect(
        authenticationCommandEndpoint.resendVerification(body),
      ).rejects.toThrow(new Error('Something Wrong!'));
      verify(
        commandBus.execute<ResendVerificationCommand, void>(
          anyOfClass(ResendVerificationCommand),
        ),
      ).once();
    });
  });

  describe('/verify', () => {
    const body = instance(mock(VerifyUserRequestBody));

    it('Should execute resendVerification on the CommandBus', async () => {
      await authenticationCommandEndpoint.verify(body);

      verify(
        commandBus.execute<VerifyUserCommand, void>(
          anyOfClass(VerifyUserCommand),
        ),
      ).once();
    });

    it('Should throw error if CommandBus failed', async () => {
      when(
        commandBus.execute<VerifyUserCommand, void>(
          anyOfClass(VerifyUserCommand),
        ),
      ).thenReject(new Error('Something Wrong!'));

      await expect(authenticationCommandEndpoint.verify(body)).rejects.toThrow(
        new Error('Something Wrong!'),
      );
      verify(
        commandBus.execute<VerifyUserCommand, void>(
          anyOfClass(VerifyUserCommand),
        ),
      ).once();
    });
  });
});
