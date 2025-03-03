import { PrismaService } from '@database';
import { GetMyProfileHandler } from '@modules/user-access-management/me/application/queries/get-my-profile/get-my-profile.handler';
import { GetMyProfileQuery } from '@modules/user-access-management/me/application/queries/get-my-profile/get-my-profile.query';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';

describe('GetMyProfileHandler', () => {
  let handler: GetMyProfileHandler;
  let prismaService: jest.MockedObject<PrismaService>;

  const mockUserId = '7e97e07f-843f-4ff4-b168-2854104118c7';
  const mockReqUser = {
    sub: mockUserId,
    email: 'example@google.com',
    status: UserStatus.ACTIVE,
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    } as any as jest.MockedObject<PrismaService>;

    const module = await Test.createTestingModule({
      providers: [
        GetMyProfileHandler,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    handler = module.get<GetMyProfileHandler>(GetMyProfileHandler);
  });

  describe('execute', () => {
    const mockQuery = new GetMyProfileQuery(mockReqUser);

    it('should return user profile successfully', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(
        mockReqUser,
      );

      const getMyProfileResponse = await handler.execute(mockQuery);

      expect(getMyProfileResponse).toEqual(mockReqUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: {
          id: true,
          email: true,
          createdAt: true,
          firstName: true,
          lastName: true,
          status: true,
        },
      });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(handler.execute(mockQuery)).rejects.toThrow(
        new BadRequestException('User does not exist!'),
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: {
          id: true,
          email: true,
          createdAt: true,
          firstName: true,
          lastName: true,
          status: true,
        },
      });
    });

    it('should handle exception', async () => {
      const error = new Error('Somethings wrong');
      (prismaService.user.findUnique as jest.Mock).mockRejectedValue(error);

      await expect(handler.execute(mockQuery)).rejects.toThrow(error);
    });
  });
});
