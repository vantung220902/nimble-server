import { CommandHandlerBase } from '@common/cqrs';
import { PrismaService } from '@database';
import { UserDto } from '@generated';
import { AuthenticationService } from '@modules/authentication/services';
import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';
import { VerifyUserCommand } from './verify-user.command';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@CommandHandler(VerifyUserCommand)
export class VerifyUserHandler extends CommandHandlerBase<
  VerifyUserCommand,
  void
> {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    private readonly dbContext: PrismaService,
    private readonly authService: AuthenticationService,
  ) {
    super();
  }

  public execute(command: VerifyUserCommand): Promise<void> {
    return this.verifyUser(command);
  }

  private async verifyUser({
    body: { email, code },
  }: VerifyUserCommand): Promise<void> {
    const verificationCacheKey =
      this.authService.getVerificationCacheKey(email);
    const cachedCode = await this.cacheService.get(verificationCacheKey);
    if (!cachedCode || cachedCode !== code) {
      throw new BadRequestException('The verification code is invalid!');
    }

    const cachedUser = await this.cacheService.get<UserDto>(email);
    if (!cachedUser) {
      throw new BadRequestException(
        'The user already expired! Please sign up again!',
      );
    }

    await Promise.all([
      this.dbContext.user.create({
        data: {
          email: cachedUser.email,
          firstName: cachedUser.firstName,
          lastName: cachedUser.lastName,
          status: UserStatus.ACTIVE,
          hashedPassword: cachedUser.hashedPassword,
          emailVerified: new Date(),
        },
      }),
      this.cacheService.del(verificationCacheKey),
      this.cacheService.del(email),
    ]);

    this.logger.log(`Verify email:${email} successfully!`);
  }
}
