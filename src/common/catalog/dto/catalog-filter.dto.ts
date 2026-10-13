import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination/pagination-query.dto';

export class CatalogFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  code?: string;
  @IsOptional()
  @IsNumber()
  element_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform((params: TransformFnParams) => {
    const value: unknown = params.value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  status?: boolean;
}
