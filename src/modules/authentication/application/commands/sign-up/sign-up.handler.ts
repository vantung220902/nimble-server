import { CommandHandlerBase } from '@common/cqrs';
import { UserDto } from '@generated';
import { EXPIRATION_VERIFICATION_ACCOUNT_SECONDS } from '@modules/authentication/authentication.enum';
import {
  AuthenticationNotifyService,
  AuthenticationService,
} from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';
import { SignUpCommand } from './sign-up.command';

@CommandHandler(SignUpCommand)
export class SignUpHandler extends CommandHandlerBase<SignUpCommand, void> {
  constructor(
    private readonly authService: AuthenticationService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    private readonly authNotifyService: AuthenticationNotifyService,
  ) {
    super();
  }

  public execute(command: SignUpCommand): Promise<void> {
    return this.signUp(command);
  }

  private async signUp({
    body: { email, password, firstName, lastName },
  }: SignUpCommand): Promise<void> {
    const isEmailExisted = await this.authService.isEmailExisted(email);

    if (isEmailExisted) {
      throw new BadRequestException('This email already exists in the system!');
    }

    const hashedPassword =
      await this.authService.generateHashPassword(password);

    await this.cacheService.set(
      email,
      {
        email,
        hashedPassword,
        firstName,
        lastName,
        status: UserStatus.UNVERIFIED,
      },
      EXPIRATION_VERIFICATION_ACCOUNT_SECONDS,
    );

    await this.authNotifyService.sendVerificationCode({
      email,
      hashedPassword,
      firstName,
      lastName,
      status: UserStatus.UNVERIFIED,
    } as UserDto);

    this.logger.log(`Email ${email} sign up successfully`);
  }
}
