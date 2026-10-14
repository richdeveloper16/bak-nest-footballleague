import { Module } from '@nestjs/common';
import { InitModule } from './init/init.module';
import { UserTypeModule } from './user-type/user-type.module';

import { PositionTypeModule } from './position-type/position-type.module';

@Module({
  imports: [InitModule, UserTypeModule, PositionTypeModule],
})
export class ModulesModule {}
