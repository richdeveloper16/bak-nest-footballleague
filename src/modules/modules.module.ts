import { Module } from '@nestjs/common';
import { TeamModule } from './team/team.module';
import { InitModule } from './init/init.module';
import { UserTypeModule } from './user-type/user-type.module';

@Module({
  imports: [TeamModule, InitModule, UserTypeModule],
})
export class ModulesModule {}
