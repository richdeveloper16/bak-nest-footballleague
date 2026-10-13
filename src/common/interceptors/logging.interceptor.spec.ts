import { ExecutionContext, Logger } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  const context = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', originalUrl: '/team?page=1' }),
      getResponse: () => ({ statusCode: 200 }),
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    logSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValue(1025);
  });
  afterEach(() => jest.restoreAllMocks());

  it('logs request, status and duration while preserving the response', async () => {
    const data = { teamId: 1 };
    const result = await lastValueFrom(
      new LoggingInterceptor().intercept(context, { handle: () => of(data) }),
    );
    expect(result).toBe(data);
    expect(logSpy).toHaveBeenCalledWith('→ GET /team?page=1');
    expect(logSpy).toHaveBeenCalledWith('← GET /team?page=1 200 - 25ms');
  });

  it.each([new Error('failure'), 'failure', { unexpected: true }])(
    'logs and propagates errors unchanged',
    async (error) => {
      await expect(
        lastValueFrom(
          new LoggingInterceptor().intercept(context, {
            handle: () => throwError(() => error),
          }),
        ),
      ).rejects.toBe(error);
      const message =
        typeof error === 'string'
          ? error
          : error instanceof Error
            ? error.message
            : 'Error desconocido';
      expect(errorSpy).toHaveBeenCalledWith(
        `✗ GET /team?page=1 - 25ms - ${message}`,
      );
    },
  );
});
