import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { ITeamRepository } from './interfaces/team-repository.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamFilterDto } from './dto/team-filter.dto';
import type { PaginatedResult } from '../../common/interfaces/pagination/paginated-result.interface';
import type { Prisma, Team } from '@prisma/client';

@Injectable()
export class TeamRepository implements ITeamRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTeamDto) {
    return this.prisma.team.create({ data });
  }

  findAll() {
    return this.prisma.team.findMany();
  }

  async findAllPaginated(
    filters: TeamFilterDto,
  ): Promise<PaginatedResult<Team>> {
    const { page, limit, code, status } = filters;
    const skip = (page - 1) * limit;
    const where: Prisma.TeamWhereInput = {
      ...(code !== undefined && { code }),
      ...(status !== undefined && { status }),
    };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { teamId: 'asc' },
      }),
      this.prisma.team.count({ where }),
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

  findById(teamId: number) {
    return this.prisma.team.findUnique({ where: { teamId } });
  }

  update(teamId: number, data: UpdateTeamDto) {
    return this.prisma.team.update({ where: { teamId }, data });
  }

  remove(teamId: number) {
    return this.prisma.team.delete({ where: { teamId } });
  }
}
