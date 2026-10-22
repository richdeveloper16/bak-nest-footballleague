import { person } from '@prisma/client';
import type { PersonResponseDto } from '../dto/person-response.dto';

export interface PersonEntity {
  person_id: number;
  first_name: string;
  last_name: string;
  second_last_name: string;
  birth_date: Date | null;
  gender: string;
  curp: string;
  rfc: string;
  email: string;
  phone: string;
  status: boolean;

  registration_date: Date | null;
}

export class PersonMapper {
  static toResponse<TEntity extends person>(
    entity: TEntity,
  ): PersonResponseDto {
    return {
      person_id: entity.person_id,
      first_name: entity.first_name,
      last_name: entity.last_name,
      second_last_name: entity.second_last_name,
      birth_date: entity.birth_date?.toISOString().slice(0, 10) ?? null,
      gender: entity.gender,
      curp: entity.curp,
      rfc: entity.rfc,
      email: entity.email,
      phone: entity.phone,
      status: entity.status,
      registration_date:
        entity.registration_date?.toISOString().slice(0, 10) ?? null,
    };
  }

  static toResponseList<TEntity extends person>(
    entities: readonly TEntity[],
  ): PersonResponseDto[] {
    return entities.map((entity) => PersonMapper.toResponse(entity));
  }
}
