import { AppConfig } from '@config';
import { PrismaService } from '@database';
import { UserDto } from '@generated';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { JwtPayload } from 'jsonwebtoken';
import { EXPIRATION_REFRESH_TOKEN_IN } from '../authentication.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfig,
    private readonly dbContext: PrismaService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  public async generateHashPassword(password: string) {
    const salt = await bcrypt.genSalt();

    return bcrypt.hash(password, salt);
  }

  public generateVerificationLink(email: string, code: string) {
    return `${this.appConfig.webUrl}/verify?email=${encodeURIComponent(email)}&code=${code}`;
  }

  public getVerificationCacheKey(email: string) {
    return `verification:${email}`;
  }

  public getRefreshTokenCacheKey(email: string) {
    return `refreshToken:${email}`;
  }

  public async generateToken(user: Pick<UserDto, 'email' | 'status' | 'id'>) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      status: user.status,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.appConfig.jwtSecret,
        expiresIn: EXPIRATION_REFRESH_TOKEN_IN,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  public generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  public async isEmailExisted(email: string) {
    const foundUser = await this.dbContext.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    const cachedUser = await this.cacheService.get(email);

    return Boolean(foundUser?.id) || Boolean(cachedUser);
  }

  public async isValidPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password.trim(), hashedPassword.trim());
  }
}
