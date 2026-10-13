export interface CatalogSearchResult<TEntity> {
  items: TEntity[];
  pagination: { page: number; limit: number };
}

export interface CatalogRepositoryInterface<
  TCreate,
  TUpdate,
  TSearch,
  TEntity,
  TSearchResult,
> {
  save(dto: TCreate): Promise<TEntity>;

  update(id: number, dto: TUpdate): Promise<TEntity>;

  findAll(filters: TSearch): Promise<TSearchResult>;

  findById(id: number): Promise<TEntity | null>;
}
