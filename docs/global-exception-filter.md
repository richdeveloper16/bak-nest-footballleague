# GlobalExceptionFilter

El componente [`GlobalExceptionFilter`](../src/common/filters/global-exception.filter.ts) centraliza el manejo de excepciones no resueltas durante las solicitudes HTTP. Convierte cada excepción en una respuesta JSON uniforme y registra el error para facilitar su diagnóstico.

## Organización del código

El manejo está separado en dos archivos:

- [`global-exception.filter.ts`](../src/common/filters/global-exception.filter.ts): obtiene el contexto HTTP, maneja las excepciones HTTP e inesperadas, registra el error y envía la respuesta JSON.
- [`prisma-exception.handler.ts`](../src/common/filters/prisma-exception.handler.ts): contiene `handlePrismaError()` y `getPrismaTarget()` para traducir errores conocidos y de validación de Prisma.

El filtro llama a `handlePrismaError()` únicamente cuando la excepción es una instancia de `PrismaClientKnownRequestError` o `PrismaClientValidationError`. Esta función devuelve `status` y `message` para construir la respuesta y no necesita registrarse como proveedor en `AppModule`.

## Registro y alcance

El decorador `@Catch()` no limita el filtro a una clase concreta de excepción. La clase implementa `ExceptionFilter` y obtiene la solicitud y la respuesta mediante `host.switchToHttp()`.

En [`AppModule`](../src/app.module.ts) ya está registrado como proveedor global:

```ts
{ provide: APP_FILTER, useClass: GlobalExceptionFilter }
```

Los módulos funcionales pueden lanzar excepciones sin registrar nuevamente el filtro. Su implementación utiliza `Request` y `Response` de Express y está diseñada para el contexto HTTP; no implementa manejo específico para WebSockets o microservicios.

## Flujo de manejo

1. Obtiene la solicitud y la respuesta HTTP.
2. Establece como valores iniciales el estado `500` y el mensaje `Error interno del servidor`.
3. Identifica la excepción y determina el estado y el mensaje correspondientes.
4. Registra método, URL, estado, mensaje y, cuando está disponible, la traza del error.
5. Envía la respuesta con `response.status(status).json(...)`.

Solo procesa excepciones que llegan al filtro. Un error capturado y resuelto dentro de un servicio no genera automáticamente esta respuesta.

## Formato de respuesta

La estructura coincide con los campos definidos en [`ApiResponse`](../src/common/interfaces/api-response.interface.ts):

| Campo       | Tipo                 | Valor o significado                                                   |
| ----------- | -------------------- | --------------------------------------------------------------------- |
| `success`   | `boolean`            | Siempre `false`.                                                      |
| `code`      | `number`             | Código HTTP; coincide con el estado de la respuesta.                  |
| `message`   | `string \| string[]` | Mensaje individual o lista de mensajes.                               |
| `data`      | `null`               | Siempre `null` en las respuestas del filtro.                          |
| `timestamp` | `string`             | Fecha de generación en formato ISO 8601 UTC.                          |
| `path`      | `string`             | Valor de `request.url`, incluida la cadena de consulta cuando existe. |

Ejemplo de respuesta para un recurso inexistente:

```json
{
  "success": false,
  "code": 404,
  "message": "Equipo 999 no encontrado",
  "data": null,
  "timestamp": "2026-10-09T18:00:00.000Z",
  "path": "/team/999"
}
```

La fecha del ejemplo es ilustrativa; el filtro la genera en cada respuesta.

## Excepciones HTTP

Para una instancia de `HttpException`, el filtro conserva el estado devuelto por `getStatus()` y extrae el mensaje de `getResponse()` mediante `getHttpMessage()`.

| Respuesta de la excepción                                           | Mensaje enviado               |
| ------------------------------------------------------------------- | ----------------------------- |
| Una cadena                                                          | La misma cadena.              |
| Un objeto con `message` de tipo cadena                              | El valor de `message`.        |
| Un objeto con `message` como arreglo formado únicamente por cadenas | El mismo arreglo.             |
| Un objeto sin `message`, o con un valor de otro tipo                | `Error interno del servidor`. |

El mensaje de respaldo no cambia el estado HTTP de la excepción. Los otros campos de su respuesta, como `error` o datos personalizados, no se copian al JSON final.

Ejemplo de uso en un servicio:

```ts
import { NotFoundException } from '@nestjs/common';

if (!team) {
  throw new NotFoundException(`Equipo ${id} no encontrado`);
}
```

El filtro devuelve `404` con el mensaje indicado. No es necesario construir manualmente el objeto de respuesta de error.

El `ValidationPipe` global de [`main.ts`](../src/main.ts) también puede producir excepciones HTTP con varios mensajes. El filtro conserva el arreglo para que el cliente pueda mostrar cada error de validación:

```json
{
  "success": false,
  "code": 400,
  "message": ["El nombre es obligatorio", "El código es obligatorio"],
  "data": null,
  "timestamp": "2026-10-09T18:00:00.000Z",
  "path": "/team"
}
```

Los mensajes de este ejemplo son ilustrativos; los reales dependen de las validaciones de los DTO.

## Errores de Prisma

Para instancias de `Prisma.PrismaClientKnownRequestError`, `handlePrismaError()` aplica las siguientes reglas:

| Código                             | Estado HTTP                 | Mensaje                                                |
| ---------------------------------- | --------------------------- | ------------------------------------------------------ |
| `P2002`                            | `409 Conflict`              | `Ya existe un registro con ese valor único (<campos>)` |
| `P2025`                            | `404 Not Found`             | `Registro no encontrado`                               |
| `P2003`                            | `400 Bad Request`           | `Referencia inválida a un registro relacionado`        |
| Cualquier otro código de esa clase | `500 Internal Server Error` | `Error en la base de datos`                            |

En `P2002`, `getPrismaTarget()` obtiene el texto de `error.meta?.target`:

- Si es una cadena, la utiliza directamente.
- Si es un arreglo, conserva sus elementos de tipo cadena y los une con `, `.
- Si no hay un valor utilizable, devuelve `campo desconocido`.

Por ejemplo, un `target` igual a `["code"]` produce el mensaje `Ya existe un registro con ese valor único (code)`.

Las instancias de `Prisma.PrismaClientValidationError` reciben estado `400 Bad Request` y el mensaje `Datos inválidos enviados a la base de datos`. Esta rama corresponde a la validación del cliente Prisma; la validación HTTP de los DTO se procesa en la rama de `HttpException`.

La identificación depende de `instanceof`. Un objeto que solo contenga `code: 'P2002'` no activa el tratamiento de errores conocidos de Prisma.

## Excepciones inesperadas y logs

Las excepciones que no coinciden con las clases anteriores reciben estado `500` y el mensaje `Error interno del servidor`. Su mensaje original y su traza no se incluyen en la respuesta.

El filtro utiliza `Logger` de NestJS con el contexto `GlobalExceptionFilter`. La aplicación configura Winston como logger al arrancar. Cada excepción procesada se registra con nivel `error`, incluso si su estado HTTP es `400`, `404` o `409`.

El texto del registro tiene este formato:

```text
<método> <URL> - <estado> - <mensaje>
```

Cuando el mensaje es un arreglo, sus elementos se unen con `, ` únicamente para el log; la respuesta JSON conserva el arreglo. La traza se pasa al logger si `exception instanceof Error`.

## Mantenimiento

Para agregar una traducción de un error conocido de Prisma, incorpora un caso en `handlePrismaError()` con su estado y mensaje. Conserva el formato común de respuesta y revisa que el mensaje sea adecuado para el cliente, porque los mensajes aceptados de `HttpException` y los campos únicos de `P2002` se envían directamente.

Al revisar cambios del filtro, comprueba los estados, mensajes y campos del JSON para excepciones HTTP, validaciones con varios mensajes, cada código de Prisma contemplado y errores inesperados. Incluye los valores ausentes o no utilizables de `meta.target` y de `message` para verificar los mensajes de respaldo.
