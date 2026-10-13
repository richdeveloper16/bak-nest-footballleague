import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from './prisma-exception.handler';
import { formatApiTimestamp } from '../utils/date-time.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  /**
   * Procesa una excepción no resuelta durante una solicitud HTTP.
   * Conserva el estado y mensaje de las excepciones HTTP, traduce errores de
   * Prisma y usa un error 500 genérico para las excepciones inesperadas.
   * Registra el error y envía un JSON con success, code, message, data,
   * timestamp y path. La traza se registra, pero no se envía al cliente.
   *
   * @param exception Excepción recibida por el filtro global.
   * @param host Contexto de NestJS del que se obtienen request y response.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = this.getHttpMessage(exception.getResponse(), message);
    } else if (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      exception instanceof Prisma.PrismaClientValidationError
    ) {
      const prismaError = handlePrismaError(exception);
      status = prismaError.status;
      message = prismaError.message;
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${Array.isArray(message) ? message.join(', ') : message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      code: status,
      message,
      data: null,
      timestamp: formatApiTimestamp(),
      path: request.url,
    });
  }

  /**
   * Extrae el mensaje de una excepción HTTP como cadena o arreglo de cadenas.
   *
   * @param response Respuesta obtenida mediante HttpException.getResponse().
   * @param fallback Mensaje de respaldo si no hay un message válido.
   * @returns Mensaje extraído o el valor de respaldo.
   */
  private getHttpMessage(
    response: string | object,
    fallback: string | string[],
  ): string | string[] {
    if (typeof response === 'string') return response;
    if (!('message' in response)) return fallback;

    const responseMessage = response.message;
    if (typeof responseMessage === 'string') return responseMessage;
    if (
      Array.isArray(responseMessage) &&
      responseMessage.every((item): item is string => typeof item === 'string')
    ) {
      return responseMessage;
    }

    return fallback;
  }
}
