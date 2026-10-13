import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserTypeRepository } from './repository/user-type.repository';
import type { CreateCatalogDto } from '../../common/catalog/dto/create-catalog.dto';
import type { CatalogResponseDto } from '../../common/catalog/dto/catalog-response.dto';
import type { UpdateCatalogDto } from '../../common/catalog/dto/update-catalog.dto';
import type { CatalogSearchDto } from '../../common/catalog/dto/catalog-search.dto';
import type { CatalogListResponseDto } from '../../common/catalog/dto/catalog-list-response.dto';
import { CatalogMapper } from '../../common/catalog/mapper/catalog.mapper';

@Injectable()
export class UserTypeService {
  private readonly logger = new Logger(UserTypeService.name);

  constructor(private readonly userTypeRepository: UserTypeRepository) {}

  async save(dto: CreateCatalogDto): Promise<CatalogResponseDto> {
    const entity = await this.userTypeRepository.save(dto);
    return CatalogMapper.toResponse(entity);
  }

  async update(id: number, dto: UpdateCatalogDto): Promise<CatalogResponseDto> {
    const entity = await this.userTypeRepository.update(id, dto);
    return CatalogMapper.toResponse(entity);
  }

  async findAll(filters: CatalogSearchDto): Promise<CatalogListResponseDto> {
    const result = await this.userTypeRepository.findAll(filters);
    return {
      items: CatalogMapper.toResponseList(result.items),
      pagination: result.pagination,
    };
  }

  async findById(id: number): Promise<CatalogResponseDto> {
    const entity = await this.userTypeRepository.findById(id);

    if (!entity) {
      throw new NotFoundException(
        `Tipo de usuario con ID ${id} no encontrado.`,
      );
    }

    return CatalogMapper.toResponse(entity);
  }
}
