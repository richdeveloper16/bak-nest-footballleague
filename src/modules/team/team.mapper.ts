import type { Team } from '@prisma/client';

import type { TeamResponseDto } from './dto/team-response.dto';

export class TeamMapper {
  static toResponse(team: Team): TeamResponseDto {
    return {
      teamId: team.teamId,
      name: team.name,
      shortName: team.shortName,
      status: team.status,
      registrationDate: team.registrationDate,
      updateDate: team.updateDate,
      code: team.code,
      logoUrl: team.logoUrl,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
      foundationDate: team.foundationDate,
      description: team.description,
      fkHomeField: team.fkHomeField,
    };
  }

  static toResponseList(teams: Team[]): TeamResponseDto[] {
    return teams.map((team) => TeamMapper.toResponse(team));
  }
}
