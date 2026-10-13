# API NestJS

API REST base, construida con NestJS, TypeScript, Prisma ORM y PostgreSQL.

## Tecnologías

- **Node.js**: entorno de ejecución.
- **TypeScript**: lenguaje principal con tipado estático.
- **NestJS 11**: framework modular para la API.
- **Prisma ORM 7**: ORM y cliente tipado.
- **PostgreSQL**: base de datos relacional.
- **Express**: plataforma HTTP utilizada por NestJS.
- **Swagger / OpenAPI**: documentación interactiva.
- **Winston**: logging estructurado y persistencia de registros.
- **RxJS**: flujo de respuestas e interceptores.
- **Jest y Supertest**: pruebas unitarias y end-to-end.
- **ESLint y Prettier**: calidad y formato del código.

## Arquitectura

El proyecto utiliza la arquitectura modular de NestJS y el patrón Repository:

```text
Solicitud HTTP
      |
      v
Controller  ->  DTO + ValidationPipe
      |
      v
Service     ->  lógica de aplicación + Mapper de respuesta
      |
      v
Repository  ->  abstracción de persistencia
      |
      v
PrismaService  ->  PostgreSQL
```

De forma transversal, todas las solicitudes pasan por:

- `LoggingInterceptor`, que registra método, ruta, estado y duración.
- `GlobalExceptionFilter`, que normaliza errores HTTP y errores conocidos de Prisma.
- Winston, que envía logs a consola y archivos con rotación diaria.

## Estructura del proyecto

```text
api-nest/
|-- prisma/
|   `-- schema.prisma
|-- src/
|   |-- common/
|   |   |-- decorators/
|   |   |   `-- api-endpoint.decorator.ts
|   |   |-- dto/
|   |   |   |-- api-response.dto.ts
|   |   |   |-- pagination-meta.dto.ts
|   |   |   `-- pagination-query.dto.ts
|   |   |-- filters/
|   |   |   |-- global-exception.filter.ts
|   |   |   `-- prisma-exception.handler.ts
|   |   |-- interceptors/
|   |   |   |-- logging.interceptor.ts
|   |   |   `-- response.interceptor.ts
|   |   `-- interfaces/
|   |       |-- api-response.interface.ts
|   |       |-- base-repository.interface.ts
|   |       `-- paginated-result.interface.ts
|   |-- config/
|   |   |-- app.config.ts
|   |   |-- environment.config.ts
|   |   |-- swagger.config.ts
|   |   `-- winston.config.ts
|   |-- modules/
|   |   |-- modules.module.ts
|   |   `-- team/
|   |       |-- dto/
|   |       |   |-- create-team.dto.ts
|   |       |   |-- team-filter.dto.ts
|   |       |   |-- team-response.dto.ts
|   |       |   `-- update-team.dto.ts
|   |       |-- interfaces/
|   |       |   `-- team-repository.interface.ts
|   |       |-- team.controller.ts
|   |       |-- team.module.ts
|   |       |-- team.mapper.ts
|   |       |-- team.repository.ts
|   |       `-- team.service.ts
|   |-- prisma/
|   |   |-- prisma.module.ts
|   |   `-- prisma.service.ts
|   |-- app.controller.ts
|   |-- app.module.ts
|   |-- app.service.ts
|   `-- main.ts
|-- test/
|-- prisma.config.ts
|-- eslint.config.mjs
|-- package.json
`-- tsconfig.json
```

## Componentes

### Inicio de la aplicación

`main.ts` crea la aplicación con Winston como logger y configura Swagger. `configureApp()` aplica el `ValidationPipe` global y habilita el cierre ordenado; las pruebas e2e utilizan la misma función. La API escucha en `PORT`, cuyo valor predeterminado es `3000`.

El pipe global utiliza:

- `whitelist: true`: elimina propiedades no declaradas en los DTO.
- `transform: true`: transforma parámetros al tipo esperado cuando es posible.

### `AppModule`

Es el módulo raíz. Sus responsabilidades actuales son:

- Cargar `.env` mediante `ConfigModule` global.
- Importar `ModulesModule` y el `PrismaModule` global.
- Registrar `GlobalExceptionFilter` con `APP_FILTER`.
- Registrar `LoggingInterceptor` con `APP_INTERCEPTOR`.
- Registrar `ResponseInterceptor` para normalizar las respuestas exitosas.
- Registrar el controlador y servicio raíz.

### `PrismaService`

Extiende `PrismaClient`, crea el adaptador `PrismaPg` con `DATABASE_URL` y controla la conexión mediante `OnModuleInit` y `OnModuleDestroy`.

### `PrismaModule`

Proveedor global y único de `PrismaService`. Los módulos funcionales pueden inyectar el servicio sin registrarlo nuevamente, evitando clientes y conexiones duplicadas.

### `ModulesModule`

Punto único de integración de módulos funcionales. `AppModule` importa este agregador en lugar de conocer cada dominio. Para reducir conflictos entre ramas, su actualización corresponde al responsable de integración.

### `TeamModule`

Encapsula el dominio de equipos y registra:

- `TeamController`: endpoints REST.
- `TeamService`: lógica de aplicación y validación de existencia.
- `TeamRepository`: consultas y operaciones de Prisma.
- `TEAM_REPOSITORY`: token de inyección que desacopla el servicio de la implementación.

El repositorio utiliza el `PrismaService` exportado por el módulo global; `TeamModule` no lo registra nuevamente.

### `TeamController`

Recibe solicitudes para crear, listar, consultar, actualizar y eliminar equipos. Convierte los identificadores de ruta a números mediante `ParseIntPipe`.

### `TeamService`

Consume `ITeamRepository` a través del token `TEAM_REPOSITORY` y coordina el CRUD sin depender directamente de Prisma. Produce `NotFoundException` cuando `findOne` no encuentra un equipo y utiliza `TeamMapper` para construir los contratos de salida.

| Método    | Resultado                          | Comportamiento                                       |
| --------- | ---------------------------------- | ---------------------------------------------------- |
| `create`  | `TeamResponseDto`                  | Mapea el equipo creado                               |
| `findAll` | `PaginatedResult<TeamResponseDto>` | Mapea `items` y conserva los metadatos               |
| `findOne` | `TeamResponseDto`                  | Lanza `NotFoundException` si el equipo no existe     |
| `update`  | `TeamResponseDto`                  | Verifica la existencia y mapea el equipo actualizado |
| `remove`  | `TeamResponseDto`                  | Verifica la existencia y mapea el registro eliminado |

`update` y `remove` llaman primero a `findOne`, por lo que realizan una consulta de existencia antes de modificar la base de datos. Todas las operaciones que devuelven equipos aplican `TeamMapper`.

`TeamService` utiliza `Logger` de NestJS con el contexto `TeamService`. Winston se configura como logger de la aplicación en el arranque:

- `log`: creación, actualización y eliminación de equipos.
- `debug`: página consultada, cantidad de resultados y total de equipos.
- `warn`: búsqueda por ID sin resultados.

### `TeamRepository`

Implementa el acceso a datos mediante Prisma:

- Crear un equipo.
- Listar todos los equipos mediante el contrato base.
- Listar equipos paginados y filtrados con `findAllPaginated`.
- Buscar por ID.
- Actualizar y eliminar registros.

### DTO de equipos

- `CreateTeamDto`: define y valida campos como nombre, código, colores, estado y fecha de fundación.
- `TeamFilterDto`: extiende la paginación y permite filtrar el listado por `code` y `status`.
- `UpdateTeamDto`: utiliza `PartialType` para permitir actualizaciones parciales.
- `TeamResponseDto`: define el contrato de salida que recibe el frontend, sin exponer directamente el modelo generado por Prisma.

### `TeamMapper`

Separa el modelo de persistencia del contrato HTTP de salida:

- `TeamMapper.toResponse(team)`: convierte un modelo `Team` en `TeamResponseDto`.
- `TeamMapper.toResponseList(teams)`: convierte una colección de equipos en una colección de DTO de respuesta.

El flujo de salida es `TeamRepository -> TeamService -> TeamMapper -> TeamController -> frontend`.

### Interfaces compartidas

- `IBaseRepository`: contrato genérico para operaciones CRUD.
- `ITeamRepository`: extiende el contrato base con consultas propias de equipos.
- `ApiResponse`: contrato compartido para respuestas HTTP normalizadas.
- `PaginatedResult<T>`: contrato genérico con una colección `items` y metadatos de paginación.

### Paginación

`PaginationQueryDto` define y valida los parámetros comunes de paginación. `TeamFilterDto` lo extiende con filtros propios del módulo:

- `page`: página solicitada; su valor predeterminado es `1` y debe ser mayor o igual a `1`.
- `limit`: registros por página; su valor predeterminado es `10` y acepta como máximo `100`.
- `code`: código exacto del equipo; es opcional y acepta hasta 30 caracteres.
- `status`: estado opcional expresado como `true` o `false`.

`TeamRepository.findAllPaginated()` construye un único `where` con los filtros recibidos y lo aplica tanto a `findMany` como a `count`. Además utiliza `skip` y `take`, ordena los resultados por `teamId` y ejecuta ambas operaciones mediante una transacción de Prisma. `TeamService.findAll()` transforma los modelos de `items` con `TeamMapper`.

### `GlobalExceptionFilter`

La guía de registro, formato de respuesta, ejemplos y reglas de manejo está en [`docs/global-exception-filter.md`](docs/global-exception-filter.md).

Captura excepciones de toda la aplicación y devuelve una respuesta consistente con código HTTP, mensaje, ruta y fecha. Traduce errores comunes de Prisma:

| Código Prisma | Respuesta HTTP    | Descripción                         |
| ------------- | ----------------- | ----------------------------------- |
| `P2002`       | `409 Conflict`    | Violación de un valor único         |
| `P2025`       | `404 Not Found`   | Registro no encontrado              |
| `P2003`       | `400 Bad Request` | Referencia o llave foránea inválida |

### `LoggingInterceptor`

Registra el inicio y final de cada solicitud, incluyendo método HTTP, URL, código de respuesta, duración y mensaje de error cuando corresponde.

### Winston

La configuración genera tres salidas:

- Consola con formato legible de NestJS.
- `logs/application-%DATE%.log`, con todos los niveles y retención de 14 días.
- `logs/errors-%DATE%.log`, solo para errores y con retención de 30 días.

Los archivos rotan diariamente, se comprimen y tienen un tamaño máximo de 20 MB.

La instancia se configura globalmente en `main.ts` para los logs internos de NestJS. `TeamService`, adicionalmente, importa esa misma instancia para registrar directamente sus operaciones de dominio.

### Swagger

Publica documentación OpenAPI en `/api/docs` cuando `NODE_ENV` no es `production`. Incluye una definición de autenticación Bearer para la futura protección de rutas.

### Decorador `ApiCrud`

`src/common/decorators/api-endpoint.decorator.ts` centraliza la documentación Swagger habitual de los endpoints CRUD. Utiliza `applyDecorators` para combinar en una sola declaración:

- `ApiOperation`, con el resumen y la descripción de la operación.
- `ApiOkResponse` para respuestas exitosas normales, o `ApiCreatedResponse` cuando `isCreated` es `true`.
- `ApiParam` para documentar el parámetro numérico `id` cuando `hasIdParam` es `true`.
- `ApiBadRequestResponse`, `ApiNotFoundResponse` y `ApiConflictResponse` cuando se proporciona la descripción correspondiente.
- `ApiInternalServerErrorResponse` para errores inesperados.

Los esquemas incluyen el contrato completo (`success`, `code`, `message`, `data`, `timestamp` y `path`). `responseType` define el contenido de `data`; `isPaginated: true` documenta `data.items` y `data.meta`. Los DTO utilizan decoradores Swagger explícitos, por lo que también están disponibles al generar el documento desde las pruebas.

Opciones disponibles:

| Opción                  | Requerida | Descripción                                                             |
| ----------------------- | --------- | ----------------------------------------------------------------------- |
| `summary`               | Sí        | Resumen mostrado por Swagger para la operación.                         |
| `description`           | No        | Descripción ampliada del endpoint.                                      |
| `responseType`          | Sí        | DTO utilizado como esquema de la respuesta exitosa.                     |
| `responseDescription`   | Sí        | Descripción de la respuesta exitosa.                                    |
| `badRequestDescription` | No        | Agrega una respuesta HTTP `400 Bad Request`.                            |
| `notFoundDescription`   | No        | Agrega una respuesta HTTP `404 Not Found`.                              |
| `conflictDescription`   | No        | Agrega una respuesta HTTP `409 Conflict`.                               |
| `isCreated`             | No        | Usa HTTP `201 Created` en lugar de `200 OK`.                            |
| `isArray`               | No        | Indica que el esquema de respuesta es una colección.                    |
| `isPaginated`           | No        | Documenta una colección paginada con `items` y `meta` dentro de `data`. |
| `hasIdParam`            | No        | Documenta `id` como parámetro numérico de ruta, con el ejemplo `1`.     |

Ejemplo para un endpoint de creación:

```ts
@Post()
@ApiCrud({
  summary: 'Registrar un equipo',
  description: 'Registra un nuevo equipo.',
  responseType: TeamResponseDto,
  responseDescription: 'Equipo registrado correctamente.',
  badRequestDescription: 'Los datos del equipo no son válidos.',
  conflictDescription: 'Ya existe un equipo con los mismos datos únicos.',
  isCreated: true,
})
create(@Body() dto: CreateTeamDto) {
  return this.teamService.create(dto);
}
```

Para endpoints como `GET /team/:id`, debe utilizarse `hasIdParam: true`; si pueden responder con un recurso inexistente, también debe establecerse `notFoundDescription`.

## Dependencias de ejecución

| Dependencia                 | Función                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `@nestjs/common`            | Decoradores, pipes, filtros, interceptores y utilidades de NestJS |
| `@nestjs/core`              | Núcleo, contenedor de dependencias y arranque de NestJS           |
| `@nestjs/config`            | Variables de entorno y configuración global                       |
| `@nestjs/platform-express`  | Adaptador HTTP basado en Express                                  |
| `@nestjs/swagger`           | Generación de documentación OpenAPI                               |
| `@prisma/client`            | Cliente tipado generado por Prisma                                |
| `@prisma/adapter-pg`        | Adaptador PostgreSQL para Prisma 7                                |
| `pg`                        | Driver de PostgreSQL                                              |
| `class-validator`           | Validación declarativa de DTO                                     |
| `class-transformer`         | Transformación de datos recibidos                                 |
| `dotenv`                    | Carga de variables desde `.env`                                   |
| `nest-winston`              | Integración entre NestJS y Winston                                |
| `winston`                   | Motor de logging                                                  |
| `winston-daily-rotate-file` | Rotación diaria y retención de logs                               |
| `reflect-metadata`          | Metadatos usados por decoradores e inyección                      |
| `rxjs`                      | Observables utilizados por NestJS e interceptores                 |

## Dependencias de desarrollo

| Dependencia                                                        | Función                                                                |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `prisma`                                                           | CLI para generar el cliente, validar el esquema y ejecutar migraciones |
| `typescript`                                                       | Compilador de TypeScript                                               |
| `@nestjs/cli`                                                      | Compilación y ejecución desde la CLI de NestJS                         |
| `@nestjs/schematics`                                               | Generadores de componentes NestJS                                      |
| `@nestjs/testing`                                                  | Utilidades de pruebas de NestJS                                        |
| `jest`, `ts-jest`                                                  | Ejecución de pruebas TypeScript                                        |
| `supertest`                                                        | Pruebas HTTP y end-to-end                                              |
| `eslint`                                                           | Análisis estático                                                      |
| `typescript-eslint`                                                | Integración de TypeScript con ESLint                                   |
| `@typescript-eslint/parser`                                        | Parser TypeScript para ESLint                                          |
| `@typescript-eslint/eslint-plugin`                                 | Reglas adicionales para TypeScript                                     |
| `eslint-config-prettier`                                           | Evita conflictos entre ESLint y Prettier                               |
| `eslint-plugin-prettier`                                           | Ejecuta Prettier como regla de ESLint                                  |
| `prettier`                                                         | Formato automático                                                     |
| `globals`                                                          | Variables globales para ESLint                                         |
| `ts-node`, `ts-loader`, `tsconfig-paths`                           | Ejecución y resolución de TypeScript                                   |
| `source-map-support`                                               | Trazas de error vinculadas al código TypeScript                        |
| `@types/node`, `@types/express`, `@types/jest`, `@types/supertest` | Tipos para las librerías utilizadas                                    |
| `@eslint/js`, `@eslint/eslintrc`                                   | Configuración base y compatibilidad de ESLint                          |

Las versiones exactas están declaradas en `package.json` y bloqueadas en `package-lock.json`.

## Instalación

### Requisitos

- Node.js.
- npm.
- Una instancia accesible de PostgreSQL.

### Configuración local

1. Instala las dependencias:

```bash
npm install
```

2. Crea `.env` en la raíz:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_base?schema=public"
NODE_ENV="development"
PORT=3000
```

3. Genera Prisma Client:

```bash
npx prisma generate
```

4. Aplica las migraciones de desarrollo:

```bash
npx prisma migrate dev
```

5. Inicia la API:

```bash
npm run start:dev
```

La API estará disponible en `http://localhost:3000`.

También puedes copiar `.env.example` como punto de partida. Al arrancar, la aplicación valida que `DATABASE_URL` sea una URL PostgreSQL, que `PORT` sea un entero entre `1` y `65535`, y que `NODE_ENV` sea `development`, `test` o `production`. Los errores de configuración no muestran la cadena de conexión.

Las pruebas e2e sustituyen `PrismaService` y `TeamService` por proveedores simulados y no requieren una base de datos. Cubren el contrato HTTP, la validación, la transformación de filtros y la documentación Swagger. Las pruebas del repositorio actuales usan Prisma simulado; no verifican operaciones contra PostgreSQL real.

## Endpoints

### Aplicación

| Método | Ruta | Descripción                      |
| ------ | ---- | -------------------------------- |
| `GET`  | `/`  | Comprueba que la API está activa |

### Equipos

| Método   | Ruta        | Descripción                      |
| -------- | ----------- | -------------------------------- |
| `POST`   | `/team`     | Crea un equipo                   |
| `GET`    | `/team`     | Lista equipos de forma paginada  |
| `GET`    | `/team/:id` | Obtiene un equipo por ID         |
| `PATCH`  | `/team/:id` | Actualiza parcialmente un equipo |
| `DELETE` | `/team/:id` | Elimina un equipo                |

Ejemplo para `POST /team`:

```json
{
  "name": "Club Deportivo Central",
  "shortName": "Central",
  "code": "CDC",
  "primaryColor": "#0057B8",
  "secondaryColor": "#FFFFFF",
  "foundationDate": "1990-05-20",
  "description": "Equipo de la liga local",
  "status": true
}
```

Ejemplo para obtener la segunda página de equipos:

```http
GET /team?page=2&limit=10
```

Los filtros pueden utilizarse individualmente o combinarse:

```http
GET /team?code=TEST
GET /team?status=true
GET /team?code=TEST&status=true&page=1&limit=10
```

El contenido de `data` tendrá esta estructura:

```json
{
  "items": [],
  "meta": {
    "page": 2,
    "limit": 10,
    "totalItems": 15,
    "totalPages": 2,
    "hasNextPage": false,
    "hasPreviousPage": true
  }
}
```

## Documentación Swagger

En desarrollo:

```text
http://localhost:3000/api/docs
```

Swagger se desactiva cuando `NODE_ENV=production`.

## Scripts disponibles

### Ejecución y pruebas

| Script                | Qué hace                                    |
| --------------------- | ------------------------------------------- |
| `npm run build`       | Compila el proyecto con Nest CLI            |
| `npm run start`       | Inicia la aplicación                        |
| `npm run start:dev`   | Inicia en modo watch con recarga automática |
| `npm run start:debug` | Inicia en modo debug y watch                |
| `npm run start:prod`  | Ejecuta la compilación ubicada en `dist`    |
| `npm run test`        | Ejecuta las pruebas unitarias               |
| `npm run test:watch`  | Ejecuta pruebas en modo watch               |
| `npm run test:cov`    | Ejecuta pruebas y genera cobertura          |
| `npm run test:debug`  | Ejecuta Jest con el inspector de Node.js    |
| `npm run test:e2e`    | Ejecuta las pruebas end-to-end              |

### Uso de cada script de calidad

| Script                             | Qué hace                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `npm run lint`                     | Revisa errores de código sin modificar archivos                               |
| `npm run lint:fix`                 | Revisa y corrige automáticamente lo que sea posible                           |
| `npm run lint:file -- <archivo>`   | Ejecuta ESLint sobre un archivo específico                                    |
| `npm run format`                   | Formatea todo el proyecto con Prettier                                        |
| `npm run format:check`             | Verifica el formato sin modificar archivos; útil en CI                        |
| `npm run format:file -- <archivo>` | Formatea un archivo específico                                                |
| `npm run fix`                      | Ejecuta formato y corrección de lint en un solo comando                       |
| `npm run verify`                   | Verificación estricta de formato y lint sin modificar archivos; ideal para CI |

Ejemplos sobre un archivo concreto:

```bash
npm run lint:file -- src/modules/team/team.service.ts
npm run format:file -- src/modules/team/team.service.ts
```

## Convención para nuevos módulos

### Generar archivos con Nest CLI

Ejecuta estos comandos desde la raíz del proyecto, sustituyendo `team` por el nombre del nuevo módulo:

```powershell
nest g module modules/team
nest g controller modules/team --spec
nest g service modules/team --spec
nest g class modules/team/team.repository --spec
nest g class modules/team/team.mapper --no-spec
```

La opción `--spec` genera el archivo de pruebas `.spec.ts`; `--no-spec` lo omite. El repositorio y el mapper se crean como clases vacías que debes implementar.

Si PowerShell no reconoce `nest`, utiliza el CLI local reemplazando `nest` por `node node_modules/@nestjs/cli/bin/nest.js`. Por ejemplo:

```powershell
node node_modules/@nestjs/cli/bin/nest.js g service modules/team --spec
```

### Solución: PowerShell no reconoce `nest`

Para utilizar directamente `nest g ...` sin instalar el CLI globalmente, pega esta función en la terminal:

```powershell
function nest {
  node "C:\workspace\12-liga-futbol\nest\back-footballleague\node_modules\@nestjs\cli\bin\nest.js" @args
}
```

Ajusta la ruta si el proyecto está en otra ubicación. `@args` pasa los argumentos al CLI local. Después puedes ejecutar, desde la raíz del proyecto:

```powershell
nest g module modules/user-type
```

La función permanece disponible durante la sesión actual. Para conservarla al abrir nuevas terminales, agrega la misma función a tu perfil de PowerShell (`$PROFILE`). Puedes crear el archivo si no existe y abrirlo así:

```powershell
if (!(Test-Path -LiteralPath $PROFILE)) {
  New-Item -ItemType File -Path $PROFILE -Force | Out-Null
}
notepad $PROFILE
```

Guarda la función en el archivo sin borrar su contenido existente. Luego carga el perfil en la terminal actual:

```powershell
. $PROFILE
```

Esta alternativa también permite usar el CLI local cuando NVM bloquea `npm` o `npx`. En el entorno revisado, `nvm reshim` falló porque la configuración apuntaba a una carpeta de Herd donde faltaba `settings.txt`; la función no requiere modificar esa configuración.

### Estructura y responsabilidades

```text
nombre-modulo/
|-- dto/
|   |-- create-nombre.dto.ts
|   |-- nombre-response.dto.ts
|   `-- update-nombre.dto.ts
|-- interfaces/
|   `-- nombre-repository.interface.ts
|-- nombre.controller.ts
|-- nombre.mapper.ts
|-- nombre.module.ts
|-- nombre.repository.ts
`-- nombre.service.ts
```

Cada módulo nuevo debe:

1. Definir sus DTO de entrada, sus validaciones y el DTO de respuesta.
2. Crear un contrato de repositorio.
3. Implementar el repositorio mediante Prisma.
4. Inyectar el repositorio en el servicio usando un token y mapear los resultados antes de exponerlos.
5. Registrar controladores y proveedores en su módulo.
6. Entregar pruebas unitarias del servicio y repositorio.
7. Solicitar al responsable de integración su registro en `ModulesModule`.

La convención completa y los límites de responsabilidad están documentados en [`docs/module-development.md`](docs/module-development.md).
