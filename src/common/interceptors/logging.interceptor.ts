import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Registra la actividad de las solicitudes HTTP con el contexto de log `HTTP`.
 * Emite un registro de entrada y registra cada respuesta emitida o el error
 * del flujo, junto con el tiempo transcurrido en milisegundos.
 * Se registra globalmente mediante APP_INTERCEPTOR en AppModule.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  /**
   * Registra el método y la URL original al recibir una solicitud HTTP.
   * Por cada emisión del flujo, registra el estado actual de la respuesta
   * y la duración desde el inicio. Si el flujo falla, registra la duración
   * y el mensaje del error; su estado HTTP final lo determina el filtro.
   * El operador tap observa el flujo sin modificar sus valores ni resolver
   * sus errores, que continúan hacia el manejo de excepciones de NestJS.
   *
   * @param context Contexto del que se obtienen request y response de Express.
   * @param next Manejador que ejecuta el siguiente paso del flujo de NestJS.
   * @returns Flujo de respuesta con los efectos de registro incorporados.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, originalUrl } = request;
    const start = Date.now();

    this.logger.log(`→ ${method} ${originalUrl}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.logger.log(
            `← ${method} ${originalUrl} ${response.statusCode} - ${duration}ms`,
          );
        },
        error: (error: unknown) => {
          const duration = Date.now() - start;
          this.logger.error(
            `✗ ${method} ${originalUrl} - ${duration}ms - ${this.getErrorMessage(error)}`,
          );
        },
      }),
    );
  }

  /**
   * Obtiene un mensaje legible para registrar un error del flujo HTTP.
   * Usa message para instancias de Error, conserva cadenas y devuelve
   * `Error desconocido` para cualquier otro valor.
   *
   * @param error Valor emitido por el canal de error del observable.
   * @returns Mensaje que se incluirá en el registro de error.
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Error desconocido';
  }
}
