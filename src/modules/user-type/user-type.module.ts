import { Module } from '@nestjs/common';
import { UserTypeController } from './user-type.controller';
import { UserTypeService } from './user-type.service';
import { UserTypeRepository } from './repository/user-type.repository';

@Module({
  controllers: [UserTypeController],
  providers: [UserTypeService, UserTypeRepository],
})
export class UserTypeModule {}
