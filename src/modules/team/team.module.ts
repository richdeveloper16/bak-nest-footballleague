import { Module } from '@nestjs/common';
import { TEAM_REPOSITORY } from './interfaces/team-repository.interface';
import { TeamController } from './team.controller';
import { TeamRepository } from './team.repository';
import { TeamService } from './team.service';

@Module({
  controllers: [TeamController],
  providers: [
    TeamService,
    {
      provide: TEAM_REPOSITORY,
      useClass: TeamRepository,
    },
  ],
})
export class TeamModule {}
