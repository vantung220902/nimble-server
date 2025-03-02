import { ApiProperty } from '@nestjs/swagger';

export class SignInCommandResponse {
  @ApiProperty({
    description: 'Access Token',
  })
  accessToken: string;
}
