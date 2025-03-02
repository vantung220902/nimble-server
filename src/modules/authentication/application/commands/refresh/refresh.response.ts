import { ApiProperty } from '@nestjs/swagger';

export class RefreshCommandResponse {
  @ApiProperty({
    description: 'Access Token',
  })
  accessToken: string;
}
