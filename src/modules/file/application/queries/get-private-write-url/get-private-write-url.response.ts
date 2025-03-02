import { ApiProperty } from '@nestjs/swagger';

export class GetPrivateWriteUrlQueryResponse {
  @ApiProperty({
    description: 'Presigned upload URL',
  })
  url: string;
}
