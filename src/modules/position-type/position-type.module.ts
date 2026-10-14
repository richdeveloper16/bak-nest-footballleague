import { Module } from '@nestjs/common';
import { PositionTypeController } from './position-type.controller';
import { PositionTypeService } from './position-type.service';
import { PositionTypeRepository } from './repository/position-type.repository';

@Module({
  controllers: [PositionTypeController],
  providers: [PositionTypeService, PositionTypeRepository],
})
export class PositionTypeModule {}
