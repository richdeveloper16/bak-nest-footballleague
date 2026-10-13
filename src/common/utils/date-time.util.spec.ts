import { formatApiTimestamp } from './date-time.util';

describe('formatApiTimestamp', () => {
  it.each([
    ['2026-10-09T20:54:35.258Z', '2026-10-09 14:54:35'],
    ['2026-10-09T03:05:00.007Z', '2026-10-08 21:05:00'],
    ['2026-10-09T06:00:00.000Z', '2026-10-09 00:00:00'],
  ])('formats %s in Mexico City to second precision', (input, expected) => {
    const date = new Date(input);
    const result = formatApiTimestamp(date);

    expect(result).toBe(expected);
  });
});
