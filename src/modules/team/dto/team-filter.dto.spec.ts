import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TeamFilterDto } from './team-filter.dto';

describe('TeamFilterDto', () => {
  it('uses the pagination defaults', async () => {
    const dto = plainToInstance(TeamFilterDto, {});

    await expect(validate(dto)).resolves.toEqual([]);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it.each([
    ['true', true],
    ['false', false],
  ])('transforms status %s to %s', async (value, expected) => {
    const dto = plainToInstance(TeamFilterDto, { status: value });

    await expect(validate(dto)).resolves.toEqual([]);
    expect(dto.status).toBe(expected);
  });

  it('rejects an invalid status', async () => {
    const dto = plainToInstance(TeamFilterDto, { status: 'active' });

    await expect(validate(dto)).resolves.not.toEqual([]);
  });
});
