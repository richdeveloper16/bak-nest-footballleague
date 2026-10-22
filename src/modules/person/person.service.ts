import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PersonRepository } from './repository/person.repository';
import { CreatePersonDto } from './dto/create-person.dto';
import { PersonResponseDto } from './dto/person-response.dto';
import { PersonListResponseDto } from './dto/person-list-response.dto';
import { PersonMapper } from './mapper/person.mapper';
import { UpdatePersonDto } from './dto/update.person.dto';
import { PersonFilterDto } from './dto/person-filter.dto';

@Injectable()
export class PersonService {
  constructor(private readonly personRepository: PersonRepository) {}

  async save(dto: CreatePersonDto): Promise<PersonResponseDto> {
    await this.validateUniqueFields({
      email: dto.email,
      curp: dto.curp,
    });
    const entity = await this.personRepository.save(dto);
    return PersonMapper.toResponse(entity);
  }

  async update(id: number, dto: UpdatePersonDto): Promise<PersonResponseDto> {
    await this.validateExists(id);
    const entity = await this.personRepository.update(id, dto);
    return PersonMapper.toResponse(entity);
  }

  async findAll(filters: PersonFilterDto): Promise<PersonListResponseDto> {
    const result = await this.personRepository.findAllPaginated(filters);
    return {
      items: PersonMapper.toResponseList(result.items),
      pagination: result.meta,
    };
  }

  async findForCombo(filters: PersonFilterDto): Promise<PersonResponseDto[]> {
    const result = await this.personRepository.findAllPaginated(filters);
    return PersonMapper.toResponseList(result.items);
  }

  async findById(id: number): Promise<PersonResponseDto> {
    const entity = await this.personRepository.findById(id);

    if (!entity) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada.`);
    }

    return PersonMapper.toResponse(entity);
  }

  private async validateUniqueFields(params: {
    email?: string;
    curp?: string;
    excludePersonId?: number;
  }): Promise<void> {
    const { email, curp, excludePersonId } = params;

    if (
      email &&
      (await this.personRepository.existsByMail(email, excludePersonId))
    ) {
      throw new ConflictException(
        `El correo electrónico ya está registrado ${email}`,
      );
    }

    if (
      curp &&
      (await this.personRepository.existsByCurp(curp, excludePersonId))
    ) {
      throw new ConflictException(`La CURP ya está registrada ${curp}`);
    }
  }

  private async validateExists(id: number): Promise<void> {
    const exists = await this.personRepository.existsById(id);

    if (!exists) {
      throw new NotFoundException(`No se encontró la persona con id ${id}`);
    }
  }
}
