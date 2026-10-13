import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../dto/pagination/pagination-query.dto';
import { CatalogResponseDto } from './catalog-response.dto';

export class CatalogListResponseDto {
  @ApiProperty({
    type: [CatalogResponseDto],
  })
  items: CatalogResponseDto[] | undefined;

  @ApiProperty({
    type: PaginationQueryDto,
  })
  pagination: PaginationQueryDto | undefined;
}
