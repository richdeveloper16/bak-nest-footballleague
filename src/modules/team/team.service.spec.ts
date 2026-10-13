import { NotFoundException } from '@nestjs/common';
import type { Team } from '@prisma/client';
import type { ITeamRepository } from './interfaces/team-repository.interface';
import { TeamService } from './team.service';

describe('TeamService', () => {
  let service: TeamService;
  let repository: jest.Mocked<ITeamRepository>;

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

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    service = new TeamService(repository);
  });

  it('maps the created team to a response DTO', async () => {
    repository.create.mockResolvedValue(team);

    await expect(service.create({ name: team.name })).resolves.toEqual(team);
    expect(repository.create.mock.calls).toEqual([[{ name: team.name }]]);
  });

  it('maps all teams to response DTOs', async () => {
    repository.findAllPaginated.mockResolvedValue({
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

    const filters = { page: 2, limit: 10, status: true };

    await expect(service.findAll(filters)).resolves.toEqual({
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
    expect(repository.findAllPaginated.mock.calls).toEqual([[filters]]);
  });

  it('returns a team when it exists', async () => {
    repository.findById.mockResolvedValue(team);

    await expect(service.findOne(team.teamId)).resolves.toEqual(team);
  });

  it('throws NotFoundException when a team does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('checks existence before updating a team', async () => {
    repository.findById.mockResolvedValue(team);
    const updatedTeam = { ...team, name: 'Nuevo nombre' };
    repository.update.mockResolvedValue(updatedTeam);

    const result = await service.update(team.teamId, {
      name: 'Nuevo nombre',
    });

    expect(repository.findById.mock.calls).toEqual([[team.teamId]]);
    expect(repository.update.mock.calls).toEqual([
      [team.teamId, { name: 'Nuevo nombre' }],
    ]);
    expect(result).toEqual(updatedTeam);
  });

  it('checks existence before removing a team', async () => {
    repository.findById.mockResolvedValue(team);
    repository.remove.mockResolvedValue({
      ...team,
      internalField: 'private',
    } as Team);

    const result = await service.remove(team.teamId);
    expect(result).toEqual(team);
    expect(result).not.toHaveProperty('internalField');

    expect(repository.findById.mock.calls).toEqual([[team.teamId]]);
    expect(repository.remove.mock.calls).toEqual([[team.teamId]]);
  });
});
