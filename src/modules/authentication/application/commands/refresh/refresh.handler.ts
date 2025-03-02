import { CommandHandlerBase } from '@common/cqrs';
import { EXPIRATION_REFRESH_TOKEN_SECONDS } from '@modules/authentication/authentication.enum';
import { AuthenticationService } from '@modules/authentication/services';
import { CommandHandler } from '@nestjs/cqrs';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';
import { RefreshCommand } from './refresh.command';
import { RefreshCommandResponse } from './refresh.response';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

@CommandHandler(RefreshCommand)
export class RefreshHandler extends CommandHandlerBase<
  RefreshCommand,
  RefreshCommandResponse
> {
  constructor(
    private readonly authService: AuthenticationService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {
    super();
  }

  public execute(command: RefreshCommand): Promise<RefreshCommandResponse> {
    return this.refresh(command);
  }

  private async refresh({
    reqUser,
  }: RefreshCommand): Promise<RefreshCommandResponse> {
    const { accessToken, refreshToken } = await this.authService.generateToken({
      email: reqUser.email,
      id: reqUser.sub,
      status: reqUser.status as UserStatus,
    });

    const refreshTokenCacheKey = this.authService.getRefreshTokenCacheKey(
      reqUser.email,
    );
    await this.cacheService.set(
      refreshTokenCacheKey,
      refreshToken,
      EXPIRATION_REFRESH_TOKEN_SECONDS,
    );

    this.logger.log(
      `User with email ${reqUser.email} refresh successfully at ${new Date()}`,
    );

    return { accessToken };
  }
}
