import { QueryEndpoint } from '@common/cqrs';
import { ApiResponse } from '@common/decorators';
import { AuthenticationGuard } from '@common/guards';
import { ResponseInterceptor } from '@common/interceptors';
import {
  Controller,
  Get,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetMyProfileQuery } from './get-my-profile/get-my-profile.query';
import { GetMyProfileQueryResponse } from './get-my-profile/get-my-profile.response';

@ApiTags('User Access Management')
@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'uam',
})
@UseGuards(AuthenticationGuard)
@UseInterceptors(ResponseInterceptor)
export class UserAccessManagementQueryEndpoint extends QueryEndpoint {
  constructor(protected queryBus: QueryBus) {
    super(queryBus);
  }

  @ApiOperation({ description: 'Get My Profile Endpoint' })
  @ApiResponse()
  @Get('me')
  public getMyProfile(@Request() request): Promise<GetMyProfileQueryResponse> {
    return this.queryBus.execute<GetMyProfileQuery, GetMyProfileQueryResponse>(
      new GetMyProfileQuery(request.user),
    );
  }
}
