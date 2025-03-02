import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: 1740646277 })
  timestamp: number;
}

export class ApiResponseDto<T = void> extends ResponseDto {
  constructor() {
    super();
  }

  @ApiPropertyOptional()
  data?: T;
}

export class ApiListResponseDto<T> extends ResponseDto {
  constructor() {
    super();
  }

  @ApiProperty({ isArray: true })
  data: T[];
}
