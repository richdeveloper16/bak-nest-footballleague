import { Injectable } from '@nestjs/common';
import type { person, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update.person.dto';
import { PersonFilterDto } from '../dto/person-filter.dto';
import type { IPersonRepository } from '../interfaces/person-repository.interface';
import type { PaginatedResult } from '../../../common/interfaces/pagination/paginated-result.interface';

@Injectable()
export class PersonRepository implements IPersonRepository {
  constructor(private readonly prisma: PrismaService) {}

  save(data: CreatePersonDto): Promise<person> {
    return this.prisma.person.create({
      data: {
        ...data,
        birth_date:
          data.birth_date === undefined ? undefined : new Date(data.birth_date),
      },
    });
  }

  findAll(): Promise<person[]> {
    return this.prisma.person.findMany();
  }

  async findAllPaginated(
    filters: PersonFilterDto,
  ): Promise<PaginatedResult<person>> {
    const { page = 1, limit = 10 } = filters;
    const where = this.buildWhere(filters);
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.person.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { person_id: 'asc' },
      }),
      this.prisma.person.count({ where }),
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  findById(id: number): Promise<person | null> {
    return this.prisma.person.findUnique({ where: { person_id: id } });
  }

  update(id: number, dto: UpdatePersonDto): Promise<person> {
    const data: Prisma.personUpdateInput = {
      update_date: new Date(),
    };

    if (dto.first_name !== undefined) {
      data.first_name = dto.first_name;
    }

    if (dto.last_name !== undefined) {
      data.last_name = dto.last_name;
    }

    if (dto.second_last_name !== undefined) {
      data.second_last_name = dto.second_last_name || null;
    }

    if (dto.phone !== undefined) {
      data.phone = dto.phone?.trim() || null;
    }

    if (dto.curp !== undefined) {
      data.curp = dto.curp?.trim().toUpperCase() || null;
    }

    if (dto.email !== undefined) {
      data.email = dto.email.trim();
    }

    return this.prisma.person.update({
      where: {
        person_id: id,
      },
      data,
    });
  }

  async existsByMail(
    email: string,
    excludePersonId?: number,
  ): Promise<boolean> {
    const total = await this.prisma.person.count({
      where: {
        email: email.trim().toLowerCase(),

        ...(excludePersonId !== undefined && {
          person_id: {
            not: excludePersonId,
          },
        }),
      },
    });

    return total > 0;
  }

  async existsByCurp(curp: string, excludePersonId?: number): Promise<boolean> {
    const total = await this.prisma.person.count({
      where: {
        curp: curp.trim().toUpperCase(),

        ...(excludePersonId !== undefined && {
          person_id: {
            not: excludePersonId,
          },
        }),
      },
    });

    return total > 0;
  }

  remove(id: number): Promise<person> {
    return this.prisma.person.delete({ where: { person_id: id } });
  }

  private buildWhere(filters: PersonFilterDto): Prisma.personWhereInput {
    return {
      person_id: filters.person_id,
      first_name: filters.first_name,
      last_name: filters.last_name,
      gender: filters.gender,
      curp: filters.curp,
      rfc: filters.rfc,
      email: filters.email,
      phone: filters.phone,
      status: filters.status,
    };
  }

  async existsById(id: number): Promise<boolean> {
    const total = await this.prisma.person.count({
      where: {
        person_id: id,
      },
    });

    return total > 0;
  }
}
