import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TEAM_REPOSITORY } from './interfaces/team-repository.interface';
import type { ITeamRepository } from './interfaces/team-repository.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import type { TeamResponseDto } from './dto/team-response.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamMapper } from './team.mapper';
import type { PaginatedResult } from '../../common/interfaces/pagination/paginated-result.interface';
import type { TeamFilterDto } from './dto/team-filter.dto';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: ITeamRepository,
  ) {}

  async create(dto: CreateTeamDto): Promise<TeamResponseDto> {
    const team = await this.teamRepository.create(dto);
    this.logger.log(`Equipo ${team.teamId} creado`);

    return TeamMapper.toResponse(team);
  }

  async findAll(
    filters: TeamFilterDto,
  ): Promise<PaginatedResult<TeamResponseDto>> {
    const result = await this.teamRepository.findAllPaginated(filters);
    this.logger.debug(
      `Equipos consultados: página ${result.meta.page}, resultados ${result.items.length}, total ${result.meta.totalItems}`,
    );

    return {
      ...result,
      items: TeamMapper.toResponseList(result.items),
    };
  }

  async findOne(id: number): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      this.logger.warn(`Equipo ${id} no encontrado`);
      throw new NotFoundException(`Equipo ${id} no encontrado`);
    }

    return TeamMapper.toResponse(team);
  }

  async update(id: number, dto: UpdateTeamDto): Promise<TeamResponseDto> {
    await this.findOne(id); // valida existencia antes de actualizar
    const updatedTeam = await this.teamRepository.update(id, dto);
    this.logger.log(`Equipo ${id} actualizado`);

    return TeamMapper.toResponse(updatedTeam);
  }

  async remove(id: number): Promise<TeamResponseDto> {
    await this.findOne(id); // valida existencia antes de eliminar
    const deletedTeam = await this.teamRepository.remove(id);
    this.logger.log(`Equipo ${id} eliminado`);

    return TeamMapper.toResponse(deletedTeam);
  }
}
