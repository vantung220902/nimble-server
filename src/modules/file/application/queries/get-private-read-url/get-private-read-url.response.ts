import { ApiProperty } from '@nestjs/swagger';

export class GetPrivateReadUrlQueryResponse {
  @ApiProperty({
    description: 'Presigned download URL',
  })
  url: string;
}
