import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination/pagination-query.dto';

export class BranchFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ type: Number, example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  branch_id?: number;

  @ApiPropertyOptional({ type: Number, example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => String)
  @IsString()
  code?: string;

  @ApiPropertyOptional({ type: Number, example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => String)
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: Number, example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fk_manager_user?: number;
}
