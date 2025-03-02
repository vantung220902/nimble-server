import { AppConfig } from '@config';
import { PrismaService } from '@database';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Cache } from 'cache-manager';
import { getTokenFromHeader } from '@common/utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly dbContext: PrismaService,
    private readonly appConfig: AppConfig,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {
    super({
      secretOrKey: appConfig.jwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
    });
  }

  public async validate(req: Request, payload: JwtPayload) {
    const { sub } = payload;
    const accessToken = getTokenFromHeader(req.headers);

    const isTokenInBlacklist = await this.cacheService.get(
      `blacklist:${accessToken}`,
    );

    if (isTokenInBlacklist) {
      throw new UnauthorizedException('Token is banned!');
    }

    const foundUser = await this.dbContext.user.findUnique({
      where: {
        id: sub,
      },
      select: {
        email: true,
        status: true,
      },
    });

    if (!foundUser) {
      throw new UnauthorizedException('Token is invalid!');
    }

    return {
      ...payload,
      email: foundUser.email,
      status: foundUser.status,
    };
  }
}
