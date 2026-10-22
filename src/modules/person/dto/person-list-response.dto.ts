import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/pagination/pagination-meta.dto';
import { PersonResponseDto } from './person-response.dto';

export class PersonListResponseDto {
  @ApiProperty({ type: [PersonResponseDto] })
  items!: PersonResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination!: PaginationMetaDto;
}
