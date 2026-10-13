import { Injectable } from '@nestjs/common';
import type { cat_user_type, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  CatalogRepositoryInterface,
  CatalogSearchResult,
} from '../../../common/catalog/interfaces/catalog-repository.interface';
import type { CreateCatalogDto } from '../../../common/catalog/dto/create-catalog.dto';
import type { UpdateCatalogDto } from '../../../common/catalog/dto/update-catalog.dto';
import type { CatalogSearchDto } from '../../../common/catalog/dto/catalog-search.dto';

@Injectable()
export class UserTypeRepository implements CatalogRepositoryInterface<
  CreateCatalogDto,
  UpdateCatalogDto,
  CatalogSearchDto,
  cat_user_type,
  CatalogSearchResult<cat_user_type>
> {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(filters: CatalogSearchDto): Promise<
    CatalogSearchResult<{
      code: string;
      description: string;
      status: boolean;
      element_id: number;
      sort_order: number;
      registration_date: Date;
      update_date: Date | null;
    }>
  > {
    const {
      element_id,
      code,
      description,
      status,
      page = 1,
      limit = 10,
    } = filters;
    const where: Prisma.cat_user_typeWhereInput = {
      element_id,
      code,
      ...(description !== undefined && {
        description: { contains: description, mode: 'insensitive' },
      }),
      status,
    };
    const entities = await this.prisma.cat_user_type.findMany({
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

  save(dto: CreateCatalogDto): Promise<cat_user_type> {
    return this.prisma.cat_user_type.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        description: dto.description,
        sort_order: dto.sortOrder ?? 0,
        status: dto.status ?? true,
      },
    });
  }

  update(id: number, dto: UpdateCatalogDto): Promise<cat_user_type> {
    return this.prisma.cat_user_type.update({
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

  findById(id: number): Promise<cat_user_type | null> {
    return this.prisma.cat_user_type.findUnique({
      where: { element_id: id },
    });
  }
}
