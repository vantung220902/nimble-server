import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetKeywordRequestParam {
  @ApiProperty({
    description: 'Keyword id',
    example: '277c15d3-374d-4601-adf2-027fe0ac968a',
  })
  @IsUUID()
  id: string;
}
