import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Traduce un error conocido o de validación de Prisma a un estado y mensaje.
 * P2002 indica un valor único duplicado (409), P2025 un registro no
 * encontrado (404) y P2003 una referencia relacionada inválida (400).
 * Los demás códigos reciben un error de base de datos genérico (500).
 * Los errores de validación del cliente reciben un estado 400.
 *
 * @param error Error de Prisma que contiene el código y los metadatos.
 * @returns Estado HTTP y mensaje que se incluirán en la respuesta.
 */
export function handlePrismaError(
  error:
    Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
): { status: HttpStatus; message: string } {
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: 'Datos inválidos enviados a la base de datos',
    };
  }

  switch (error.code) {
    case 'P2002':
      return {
        status: HttpStatus.CONFLICT,
        message: `Ya existe un registro con ese valor único (${getPrismaTarget(error.meta?.target)})`,
      };
    case 'P2025':
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Registro no encontrado',
      };
    case 'P2003':
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Referencia inválida a un registro relacionado',
      };
    default:
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error en la base de datos',
      };
  }
}

/**
 * Obtiene el texto del campo o los campos afectados por un valor duplicado.
 * Conserva una cadena directa; en arreglos, filtra las cadenas y las une
 * con comas. Devuelve "campo desconocido" si no hay campos utilizables.
 *
 * @param target Valor de meta.target del error P2002 de Prisma.
 * @returns Texto que identifica los campos para el mensaje de conflicto.
 */
function getPrismaTarget(target: unknown): string {
  if (typeof target === 'string') return target;
  if (Array.isArray(target)) {
    const fields = target.filter(
      (field): field is string => typeof field === 'string',
    );
    if (fields.length > 0) return fields.join(', ');
  }
  return 'campo desconocido';
}
