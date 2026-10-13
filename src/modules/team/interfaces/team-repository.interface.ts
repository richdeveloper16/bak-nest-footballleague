import type { Team } from '@prisma/client';
import type { IBaseRepository } from '../../../common/interfaces/repository/base-repository.interface';
import type { PaginatedResult } from '../../../common/interfaces/pagination/paginated-result.interface';
import type { CreateTeamDto } from '../dto/create-team.dto';
import type { TeamFilterDto } from '../dto/team-filter.dto';
import type { UpdateTeamDto } from '../dto/update-team.dto';

export interface ITeamRepository extends IBaseRepository<
  Team,
  CreateTeamDto,
  UpdateTeamDto
> {
  // métodos específicos de team que NO están en el base
  findAllPaginated(filters: TeamFilterDto): Promise<PaginatedResult<Team>>;
}

export const TEAM_REPOSITORY = Symbol('TEAM_REPOSITORY');
