import type { cat_user_type } from '@prisma/client';
import type { IBaseRepository } from '../../../common/interfaces/repository/base-repository.interface';
import type { PaginatedResult } from '../../../common/interfaces/pagination/paginated-result.interface';
import type { CreateCatalogDto } from '../../../common/catalog/dto/create-catalog.dto';
import type { CatalogFilterDto } from '../../../common/catalog/dto/catalog-filter.dto';
import type { UpdateCatalogDto } from '../../../common/catalog/dto/update-catalog.dto';

export interface IUserTypeRepository extends IBaseRepository<
  cat_user_type,
  CreateCatalogDto,
  UpdateCatalogDto
> {
  // métodos específicos de team que NO están en el base
  findAllPaginated(
    filters: CatalogFilterDto,
  ): Promise<PaginatedResult<cat_user_type>>;
}
