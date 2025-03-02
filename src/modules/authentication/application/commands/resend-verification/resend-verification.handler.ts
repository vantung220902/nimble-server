import { CommandHandlerBase } from '@common/cqrs';
import { UserDto } from '@generated';
import { AuthenticationNotifyService } from '@modules/authentication/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Cache } from 'cache-manager';
import { ResendVerificationCommand } from './resend-verification.command';

@CommandHandler(ResendVerificationCommand)
export class ResendVerificationHandler extends CommandHandlerBase<
  ResendVerificationCommand,
  void
> {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    private readonly authNotifyService: AuthenticationNotifyService,
  ) {
    super();
  }

  public execute(command: ResendVerificationCommand): Promise<void> {
    return this.resendVerification(command);
  }

  private async resendVerification({
    body: { email },
  }: ResendVerificationCommand): Promise<void> {
    const cachedUser = await this.cacheService.get<UserDto>(email);
    if (!cachedUser) {
      throw new BadRequestException(
        'The user already expired! Please sign up again!',
      );
    }

    await this.authNotifyService.sendVerificationCode(cachedUser);

    this.logger.log(`Verify email:${email} successfully!`);
  }
}
