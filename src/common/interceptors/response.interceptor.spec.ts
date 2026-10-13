import { ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  const context = {
    switchToHttp: () => ({
      getRequest: () => ({ url: '/team' }),
      getResponse: () => ({ statusCode: 201 }),
    }),
  } as unknown as ExecutionContext;

  it('wraps successful results without losing their data', async () => {
    const data = { teamId: 1 };
    const result = await lastValueFrom(
      new ResponseInterceptor().intercept(context, { handle: () => of(data) }),
    );
    expect(result).toEqual({
      success: true,
      code: 201,
      message: 'Operación exitosa',
      data,
      timestamp: expect.any(String) as unknown,
      path: '/team',
    });
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });

  it('uses null for an empty result', async () => {
    const result = await lastValueFrom(
      new ResponseInterceptor().intercept(context, {
        handle: () => of(undefined),
      }),
    );
    expect(result.data).toBeNull();
  });

  it('propagates errors to the exception filter', async () => {
    const error = new Error('failure');
    await expect(
      lastValueFrom(
        new ResponseInterceptor().intercept(context, {
          handle: () => throwError(() => error),
        }),
      ),
    ).rejects.toBe(error);
  });
});
