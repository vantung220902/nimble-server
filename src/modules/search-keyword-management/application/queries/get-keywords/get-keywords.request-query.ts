import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class GetKeywordsRequestQuery {
  @ApiPropertyOptional({
    description: 'File keywords upload id',
    example: '277c15d3-374d-4601-adf2-027fe0ac968a',
  })
  @IsOptional()
  @IsUUID()
  fileUploadId?: string;

  @ApiPropertyOptional({
    description: 'Search',
    example: 'Nimble',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  search?: string;

  @ApiPropertyOptional({
    description: 'Number of records to skip and then return the remainder',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @ApiPropertyOptional({
    description: 'Number of records to return and then skip over the remainder',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 10;
}
