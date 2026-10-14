import { CreateCatalogDto } from 'src/common/catalog/dto/create-catalog.dto';
import type {
  CatalogRepositoryInterface,
  CatalogSearchResult,
} from '../../../common/catalog/interfaces/catalog-repository.interface';
import { UpdateCatalogDto } from 'src/common/catalog/dto/update-catalog.dto';
import { CatalogFilterDto } from 'src/common/catalog/dto/catalog-filter.dto';
import { cat_position_type, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PositionTypeRepository implements CatalogRepositoryInterface<
  CreateCatalogDto,
  UpdateCatalogDto,
  CatalogFilterDto,
  cat_position_type,
  CatalogSearchResult<cat_position_type>
> {
  constructor(private readonly prisma: PrismaService) {}

  save(dto: CreateCatalogDto): Promise<{
    element_id: number;
    code: string;
    description: string;
    sort_order: number;
    status: boolean;
    registration_date: Date;
    update_date: Date | null;
  }> {
    return this.prisma.cat_position_type.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        description: dto.description,
        sort_order: dto.sortOrder ?? 0,
        status: dto.status ?? true,
      },
    });
  }
  update(
    id: number,
    dto: UpdateCatalogDto,
  ): Promise<{
    element_id: number;
    code: string;
    description: string;
    sort_order: number;
    status: boolean;
    registration_date: Date;
    update_date: Date | null;
  }> {
    return this.prisma.cat_position_type.update({
      where: { element_id: id },
      data: {
        code: dto.code,
        description: dto.description,
        sort_order: dto.sortOrder,
        status: dto.status,
        update_date: new Date(),
      },
    });
  }
  async findAll(
    filters: CatalogFilterDto,
  ): Promise<CatalogSearchResult<cat_position_type>> {
    const {
      element_id,
      code,
      description,
      status,
      page = 1,
      limit = 10,
    } = filters;
    const where: Prisma.cat_position_typeWhereInput = {
      element_id,
      code,
      ...(description !== undefined && {
        description: { contains: description, mode: 'insensitive' },
      }),
      status,
    };
    const entities = await this.prisma.cat_position_type.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ sort_order: 'asc' }, { element_id: 'asc' }],
    });
    return {
      items: entities,
      pagination: { page, limit },
    };
  }
  findById(id: number): Promise<cat_position_type | null> {
    return this.prisma.cat_position_type.findUnique({
      where: { element_id: id },
    });
  }
}
