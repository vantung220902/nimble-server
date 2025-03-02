import { CommandHandlerBase } from '@common/cqrs';
import { PrismaService } from '@database';
import { EXPIRATION_REFRESH_TOKEN_SECONDS } from '@modules/authentication/authentication.enum';
import { AuthenticationService } from '@modules/authentication/services';
import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Cache } from 'cache-manager';
import { SignInCommand } from './sign-in.command';
import { SignInCommandResponse } from './sign-in.response';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@CommandHandler(SignInCommand)
export class SignInHandler extends CommandHandlerBase<
  SignInCommand,
  SignInCommandResponse
> {
  constructor(
    private readonly dbContext: PrismaService,
    private readonly authService: AuthenticationService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {
    super();
  }

  public execute(command: SignInCommand): Promise<SignInCommandResponse> {
    return this.signIn(command);
  }

  private async signIn({
    body: { email, password },
  }: SignInCommand): Promise<SignInCommandResponse> {
    const foundUser = await this.dbContext.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        id: true,
        hashedPassword: true,
        status: true,
      },
    });

    if (!foundUser) {
      throw new BadRequestException(
        'This account does not exist in the system!',
      );
    }

    const isMatchPassword = await this.authService.isValidPassword(
      password,
      foundUser.hashedPassword,
    );

    if (!isMatchPassword) {
      throw new BadRequestException(
        'Email or password is incorrect. Please try sign in again.',
      );
    }

    const { accessToken, refreshToken } = await this.authService.generateToken({
      email: foundUser.email,
      id: foundUser.id,
      status: foundUser.status,
    });

    const refreshTokenCacheKey =
      this.authService.getRefreshTokenCacheKey(email);
    await this.cacheService.set(
      refreshTokenCacheKey,
      refreshToken,
      EXPIRATION_REFRESH_TOKEN_SECONDS,
    );

    this.logger.log(
      `User with email ${email} sign in successfully at ${new Date()}`,
    );

    return { accessToken };
  }
}
