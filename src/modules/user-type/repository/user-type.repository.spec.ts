import { UserTypeRepository } from './user-type.repository';
import type { PrismaService } from '../../../prisma/prisma.service';

describe('UserTypeRepository', () => {
  it('should be defined', () => {
    expect(new UserTypeRepository({} as PrismaService)).toBeDefined();
  });

  it('returns null when the user type does not exist', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const repository = new UserTypeRepository({
      cat_user_type: { findUnique },
    } as unknown as PrismaService);

    await expect(repository.findById(42)).resolves.toBeNull();
    expect(findUnique).toHaveBeenCalledWith({ where: { element_id: 42 } });
  });

  it('preserves the inactive filter and applies pagination', async () => {
    const entity = {
      element_id: 1,
      code: 'ADMIN',
      description: 'Administrador',
      sort_order: 0,
      status: false,
      registration_date: new Date(),
      update_date: null,
    };
    const findMany = jest.fn().mockResolvedValue([entity]);
    const repository = new UserTypeRepository({
      cat_user_type: { findMany },
    } as unknown as PrismaService);

    await expect(
      repository.findAll({ status: false, page: 2, limit: 5 }),
    ).resolves.toEqual({ items: [entity], pagination: { page: 2, limit: 5 } });
    expect(findMany).toHaveBeenCalledWith({
      where: { element_id: undefined, code: undefined, status: false },
      skip: 5,
      take: 5,
      orderBy: [{ sort_order: 'asc' }, { element_id: 'asc' }],
    });
  });
});
