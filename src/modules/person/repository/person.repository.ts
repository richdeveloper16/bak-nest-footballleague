import { person } from '@prisma/client';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update.person.dto';

export class UserTypeRepository implements CatalogRepositoryInterface<
  CreatePersonDto,
  UpdatePersonDto,
  CatalogSearchDto,
  person,
  CatalogSearchResult<cat_user_type>
> {}
