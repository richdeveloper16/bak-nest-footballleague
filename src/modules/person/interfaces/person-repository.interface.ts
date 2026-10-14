import { person } from '@prisma/client';
import { IBaseRepository } from 'src/common/interfaces/repository/base-repository.interface';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update.person.dto';
import { PersonFilterDto } from '../dto/person-filter.dto';
import { PaginatedResult } from 'src/common/interfaces/pagination/paginated-result.interface';

export interface IPersonRepository extends IBaseRepository<
  person,
  CreatePersonDto,
  UpdatePersonDto
> {
  findAllPaginated(filters: PersonFilterDto): Promise<PaginatedResult<person>>;
}
