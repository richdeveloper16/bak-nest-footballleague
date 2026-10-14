import { CatalogResponseDto } from 'src/common/catalog/dto/catalog-response.dto';
import { CreateCatalogDto } from 'src/common/catalog/dto/create-catalog.dto';
import { CatalogMapper } from 'src/common/catalog/mapper/catalog.mapper';
import { PositionTypeRepository } from './repository/position-type.repository';
import { UpdateCatalogDto } from 'src/common/catalog/dto/update-catalog.dto';
import { CatalogSearchDto } from 'src/common/catalog/dto/catalog-search.dto';
import { CatalogListResponseDto } from 'src/common/catalog/dto/catalog-list-response.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PositionTypeService {
  constructor(private readonly positioTypeRepository: PositionTypeRepository) {}

  async save(dto: CreateCatalogDto): Promise<CatalogResponseDto> {
    const entity = await this.positioTypeRepository.save(dto);
    return CatalogMapper.toResponse(entity);
  }

  async update(id: number, dto: UpdateCatalogDto): Promise<CatalogResponseDto> {
    const entity = await this.positioTypeRepository.update(id, dto);
    return CatalogMapper.toResponse(entity);
  }

  async findAll(filters: CatalogSearchDto): Promise<CatalogListResponseDto> {
    const result = await this.positioTypeRepository.findAll(filters);
    return {
      items: CatalogMapper.toResponseList(result.items),
      pagination: result.pagination,
    };
  }

  async findById(id: number): Promise<CatalogResponseDto> {
    const entity = await this.positioTypeRepository.findById(id);

    if (!entity) {
      throw new NotFoundException(
        `Tipo de usuario con ID ${id} no encontrado.`,
      );
    }

    return CatalogMapper.toResponse(entity);
  }
}
