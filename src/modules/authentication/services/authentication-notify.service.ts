import { EmailService } from '@email/services';
import { UserDto } from '@generated';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { EXPIRATION_VERIFICATION_CODE_SECONDS } from '../authentication.enum';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticationNotifyService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    private readonly emailService: EmailService,
    private readonly authService: AuthenticationService,
  ) {}

  public async sendVerificationCode(user: UserDto) {
    const verificationCode = this.authService.generateVerificationCode();
    const verificationCacheKey = this.authService.getVerificationCacheKey(
      user.email,
    );
    const verificationLink = this.authService.generateVerificationLink(
      user.email,
      verificationCode,
    );

    await this.cacheService.set(
      verificationCacheKey,
      verificationCode,
      EXPIRATION_VERIFICATION_CODE_SECONDS,
    );

    const html = this.emailService.generateVerificationTemplate({
      firstName: user.firstName,
      lastName: user.lastName,
      code: verificationCode,
      link: verificationLink,
    });
    await this.emailService.sendEmail({
      html,
      to: user.email,
      subject: 'Verify Your Email Address',
    });
  }
}
