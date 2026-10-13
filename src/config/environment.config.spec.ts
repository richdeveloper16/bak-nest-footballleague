import { validateEnvironment } from './environment.config';

describe('validateEnvironment', () => {
  const DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

  it('provides defaults and converts the port to a number', () => {
    expect(validateEnvironment({ DATABASE_URL })).toEqual({
      DATABASE_URL,
      PORT: 3000,
      NODE_ENV: 'development',
    });
    expect(validateEnvironment({ DATABASE_URL, PORT: '4000' }).PORT).toBe(4000);
  });

  it.each([undefined, '', 'invalid', 'https://localhost/test'])(
    'rejects invalid database URLs without exposing them',
    (value) => {
      expect(() => validateEnvironment({ DATABASE_URL: value })).toThrow(
        /DATABASE_URL/,
      );
    },
  );

  it.each(['', 'abc', '1.5', 0, 65536, true])(
    'rejects invalid ports: %s',
    (PORT) => {
      expect(() => validateEnvironment({ DATABASE_URL, PORT })).toThrow(/PORT/);
    },
  );

  it('rejects unsupported environments', () => {
    expect(() =>
      validateEnvironment({ DATABASE_URL, NODE_ENV: 'unknown' }),
    ).toThrow(/NODE_ENV/);
  });

  it('does not include credentials in configuration errors', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'https://user:secret-password@localhost/test',
      }),
    ).toThrow('DATABASE_URL debe ser una URL válida de PostgreSQL');
  });
});
