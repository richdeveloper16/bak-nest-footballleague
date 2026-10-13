import { Test, TestingModule } from '@nestjs/testing';
import { UserTypeService } from './user-type.service';
import { UserTypeRepository } from './repository/user-type.repository';

describe('UserTypeService', () => {
  let service: UserTypeService;
  const repository = {
    save: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  };
  const entity = {
    element_id: 1,
    code: 'ADMIN',
    description: 'Administrador',
    sort_order: 0,
    status: true,
    registration_date: new Date(),
    update_date: null,
  };
  const response = {
    id: entity.element_id,
    code: entity.code,
    description: entity.description,
    sortOrder: entity.sort_order,
    status: entity.status,
    registrationDate: entity.registration_date,
    updateDate: entity.update_date,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTypeService,
        { provide: UserTypeRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<UserTypeService>(UserTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('maps the saved entity to a catalog response', async () => {
    const dto = { code: 'ADMIN', description: 'Administrador' };
    repository.save.mockResolvedValue(entity);

    await expect(service.save(dto)).resolves.toEqual(response);
    expect(repository.save).toHaveBeenCalledWith(dto);
  });

  it('maps the updated entity to a catalog response', async () => {
    repository.update.mockResolvedValue(entity);
    await expect(service.update(1, { status: true })).resolves.toEqual(
      response,
    );
    expect(repository.update).toHaveBeenCalledWith(1, { status: true });
  });

  it('maps search entities and preserves pagination', async () => {
    const filters = { page: 2, limit: 5 };
    repository.findAll.mockResolvedValue({
      items: [entity],
      pagination: filters,
    });
    await expect(service.findAll(filters)).resolves.toEqual({
      items: [response],
      pagination: filters,
    });
    expect(repository.findAll).toHaveBeenCalledWith(filters);
  });

  it('maps an entity found by id', async () => {
    repository.findById.mockResolvedValue(entity);
    await expect(service.findById(1)).resolves.toEqual(response);
    expect(repository.findById).toHaveBeenCalledWith(1);
  });

  it('returns a 404 with a message when an entity is not found', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.findById(42)).rejects.toMatchObject({
      status: 404,
      message: 'Tipo de usuario con ID 42 no encontrado.',
    });
  });
});
