import { CommandEndpoint } from '@common/cqrs';
import { ApiResponse } from '@common/decorators';
import { AuthenticationGuard } from '@common/guards';
import { ResponseInterceptor } from '@common/interceptors';
import { getTokenFromHeader } from '@common/utils';
import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RefreshCommand } from './refresh/refresh.command';
import { ResendVerificationCommand } from './resend-verification/resend-verification.command';
import { ResendVerificationRequestBody } from './resend-verification/resend-verification.request-body';
import { SignInCommand } from './sign-in/sign-in.command';
import { SignInRequestBody } from './sign-in/sign-in.request-body';
import { SignInCommandResponse } from './sign-in/sign-in.response';
import { SignOutCommand } from './sign-out/sign-out.command';
import { SignUpCommand } from './sign-up/sign-up.command';
import { SignUpRequestBody } from './sign-up/sign-up.request-body';
import { VerifyUserCommand } from './verify-user/verify-user.command';
import { VerifyUserRequestBody } from './verify-user/verify-user.request-body';

@ApiTags('Authentication')
@Controller({
  version: '1',
})
@UseInterceptors(ResponseInterceptor)
export class AuthenticationCommandEndpoint extends CommandEndpoint {
  constructor(protected commandBus: CommandBus) {
    super(commandBus);
  }

  @ApiOperation({ description: 'Sign in endpoint' })
  @ApiResponse()
  @Post('sign-in')
  public signIn(
    @Body() body: SignInRequestBody,
  ): Promise<SignInCommandResponse> {
    return this.commandBus.execute<SignInCommand, SignInCommandResponse>(
      new SignInCommand(body),
    );
  }

  @ApiOperation({ description: 'Sign up endpoint' })
  @ApiResponse()
  @Post('sign-up')
  public signUp(@Body() body: SignUpRequestBody): Promise<void> {
    return this.commandBus.execute<SignInCommand, void>(
      new SignUpCommand(body),
    );
  }

  @ApiOperation({ description: 'Refresh endpoint' })
  @ApiResponse()
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  @Post('refresh')
  public refresh(@Request() request): Promise<void> {
    return this.commandBus.execute<RefreshCommand, void>(
      new RefreshCommand(request.user),
    );
  }

  @ApiOperation({ description: 'Logout endpoint' })
  @ApiResponse()
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  @Post('sign-out')
  public signOut(@Request() request): Promise<void> {
    const accessToken = getTokenFromHeader(request.headers);

    return this.commandBus.execute<SignOutCommand, void>(
      new SignOutCommand(accessToken, request.user),
    );
  }

  @ApiOperation({ description: 'Refresh endpoint' })
  @ApiResponse()
  @Post('resend-verification')
  public resendVerification(
    @Body() body: ResendVerificationRequestBody,
  ): Promise<void> {
    return this.commandBus.execute<ResendVerificationCommand, void>(
      new ResendVerificationCommand(body),
    );
  }

  @ApiOperation({ description: 'Verify user endpoint' })
  @ApiResponse()
  @Post('verify')
  public verify(@Body() body: VerifyUserRequestBody): Promise<void> {
    return this.commandBus.execute<VerifyUserCommand, void>(
      new VerifyUserCommand(body),
    );
  }
}
