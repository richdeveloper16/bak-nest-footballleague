import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let errorSpy: jest.SpyInstance;
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', url: '/team?code=TEST' }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it.each<[unknown, number, string | string[]]>([
    [new HttpException('No encontrado', 404), 404, 'No encontrado'],
    [
      new HttpException({ message: 'Datos inválidos' }, 400),
      400,
      'Datos inválidos',
    ],
    [
      new HttpException({ message: ['Error A', 'Error B'] }, 400),
      400,
      ['Error A', 'Error B'],
    ],
    [
      new HttpException({ message: [123] }, 400),
      400,
      'Error interno del servidor',
    ],
    [
      new HttpException({ error: 'ignored' }, 403),
      403,
      'Error interno del servidor',
    ],
    [new Error('private details'), 500, 'Error interno del servidor'],
    [{ code: 'P2002' }, 500, 'Error interno del servidor'],
    [
      new Prisma.PrismaClientValidationError('private query', {
        clientVersion: 'test',
      }),
      400,
      'Datos inválidos enviados a la base de datos',
    ],
  ])(
    'normalizes errors without exposing internal details',
    (exception, code, message) => {
      new GlobalExceptionFilter().catch(exception, host);
      expect(status).toHaveBeenCalledWith(code);
      expect(json).toHaveBeenCalledWith({
        success: false,
        code,
        message,
        data: null,
        timestamp: expect.any(String) as unknown,
        path: '/team?code=TEST',
      });
      expect(errorSpy).toHaveBeenCalled();
    },
  );

  it.each<[string, number, string]>([
    ['P2002', 409, 'Ya existe un registro con ese valor único (code)'],
    ['P2025', 404, 'Registro no encontrado'],
    ['P2003', 400, 'Referencia inválida a un registro relacionado'],
    ['P9999', 500, 'Error en la base de datos'],
  ])('translates Prisma %s', (code, httpStatus, message) => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'private query',
      {
        code,
        clientVersion: 'test',
        meta: { target: ['code'] },
      },
    );
    new GlobalExceptionFilter().catch(exception, host);
    expect(status).toHaveBeenCalledWith(httpStatus);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ message }));
  });

  it.each<[unknown, string]>([
    ['code', 'code'],
    [['code', 123, 'name'], 'code, name'],
    [undefined, 'campo desconocido'],
    [[], 'campo desconocido'],
  ])('normalizes unique constraint metadata', (target, fields) => {
    const exception = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target },
    });
    new GlobalExceptionFilter().catch(exception, host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: `Ya existe un registro con ese valor único (${fields})`,
      }),
    );
  });
});
