import { QueryHandlerBase } from '@common/cqrs';
import { PrismaService } from '@database';
import { BadRequestException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { GetMyProfileQuery } from './get-my-profile.query';
import { GetMyProfileQueryResponse } from './get-my-profile.response';

@QueryHandler(GetMyProfileQuery)
export class GetMyProfileHandler extends QueryHandlerBase<
  GetMyProfileQuery,
  GetMyProfileQueryResponse
> {
  constructor(private readonly dbContext: PrismaService) {
    super();
  }

  public async execute(
    query: GetMyProfileQuery,
  ): Promise<GetMyProfileQueryResponse> {
    return this.getMyProfile(query);
  }

  private async getMyProfile({ reqUser }: GetMyProfileQuery) {
    const foundUser = await this.dbContext.user.findUnique({
      where: {
        id: reqUser.sub,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    if (!foundUser) {
      throw new BadRequestException('User does not exist!');
    }

    return foundUser;
  }
}
