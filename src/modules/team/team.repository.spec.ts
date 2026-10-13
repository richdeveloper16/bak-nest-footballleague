import type { Team } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import { TeamRepository } from './team.repository';

describe('TeamRepository', () => {
  const team: Team = {
    teamId: 1,
    name: 'Equipo de prueba',
    shortName: null,
    status: true,
    registrationDate: new Date('2026-01-01T00:00:00.000Z'),
    updateDate: null,
    code: 'TEST',
    logoUrl: null,
    primaryColor: null,
    secondaryColor: null,
    foundationDate: null,
    description: null,
    fkHomeField: null,
  };

  const prismaMock = {
    team: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const repository = new TeamRepository(prismaMock as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a team using the received data', async () => {
    prismaMock.team.create.mockResolvedValue(team);

    await repository.create({ name: team.name });

    expect(prismaMock.team.create).toHaveBeenCalledWith({
      data: { name: team.name },
    });
  });

  it('finds a team by its unique identifier', async () => {
    prismaMock.team.findUnique.mockResolvedValue(team);

    await repository.findById(team.teamId);

    expect(prismaMock.team.findUnique).toHaveBeenCalledWith({
      where: { teamId: team.teamId },
    });
  });

  it('returns a paginated list of teams', async () => {
    const findManyOperation = Promise.resolve([team]);
    const countOperation = Promise.resolve(15);
    prismaMock.team.findMany.mockReturnValue(findManyOperation);
    prismaMock.team.count.mockReturnValue(countOperation);
    prismaMock.$transaction.mockResolvedValue([[team], 15]);

    await expect(
      repository.findAllPaginated({
        page: 2,
        limit: 10,
        code: 'TEST',
        status: true,
      }),
    ).resolves.toEqual({
      items: [team],
      meta: {
        page: 2,
        limit: 10,
        totalItems: 15,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });
    expect(prismaMock.team.findMany.mock.calls).toEqual([
      [
        {
          where: { code: 'TEST', status: true },
          skip: 10,
          take: 10,
          orderBy: { teamId: 'asc' },
        },
      ],
    ]);
    expect(prismaMock.team.count.mock.calls).toEqual([
      [{ where: { code: 'TEST', status: true } }],
    ]);
    expect(prismaMock.$transaction.mock.calls).toEqual([
      [[findManyOperation, countOperation]],
    ]);
  });
});
