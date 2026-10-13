# Guía para desarrollar módulos

Esta guía define el contrato de trabajo para que varios desarrolladores implementen dominios en paralelo sin modificar la infraestructura transversal.

## Alcance del desarrollador

Cada desarrollador trabaja únicamente dentro de:

```text
src/modules/<modulo>/
```

La carpeta debe contener:

```text
<modulo>/
|-- dto/
|   |-- create-<modulo>.dto.ts
|   `-- update-<modulo>.dto.ts
|-- interfaces/
|   `-- <modulo>-repository.interface.ts
|-- <modulo>.controller.ts
|-- <modulo>.module.ts
|-- <modulo>.repository.ts
|-- <modulo>.repository.spec.ts
|-- <modulo>.service.ts
`-- <modulo>.service.spec.ts
```

No se deben duplicar ni modificar desde un módulo:

- `PrismaService` o `PrismaModule`.
- Los filtros e interceptores globales.
- `ApiResponse` o `IBaseRepository`.
- La configuración de Winston, Swagger o ESLint.
- `AppModule` o `main.ts`.

## Contrato del repositorio

El contrato específico extiende `IBaseRepository` y declara todas las consultas adicionales. El token debe ser un `Symbol` para evitar colisiones.

```ts
import type { Entity } from '@prisma/client';
import type { IBaseRepository } from '../../../common/interfaces/base-repository.interface';
import type { CreateEntityDto } from '../dto/create-entity.dto';
import type { UpdateEntityDto } from '../dto/update-entity.dto';

export interface IEntityRepository extends IBaseRepository<
  Entity,
  CreateEntityDto,
  UpdateEntityDto
> {
  findActive(): Promise<Entity[]>;
}

export const ENTITY_REPOSITORY = Symbol('ENTITY_REPOSITORY');
```

La implementación es el único componente del módulo que accede directamente a `PrismaService`.

## Servicio

El servicio recibe el contrato, no la implementación concreta:

```ts
@Injectable()
export class EntityService {
  constructor(
    @Inject(ENTITY_REPOSITORY)
    private readonly repository: IEntityRepository,
  ) {}
}
```

La lógica de negocio, validaciones de existencia y coordinación de operaciones pertenecen al servicio.

Usa `Logger` de NestJS con el nombre del servicio como contexto. La configuración de Winston pertenece al arranque de la aplicación. Aplica el mapper a todos los equipos devueltos, incluida la eliminación, y declara los tipos de retorno.

## Contrato HTTP y Swagger

Documenta cada endpoint con `ApiCrud` y sus errores esperados. `responseType` describe el contenido de `data`, porque `ResponseInterceptor` agrega el contrato común de respuesta. Para listados paginados usa `isPaginated: true`; para rutas con `id`, usa `hasIdParam: true`.

Los DTO deben incluir `ApiProperty` o `ApiPropertyOptional`. Importa `PartialType` de `@nestjs/swagger` para conservar los metadatos de validación y documentación en los DTO de actualización.

Las pruebas HTTP deben ejecutar `configureApp()` de `src/config/app.config.ts` antes de `app.init()` para usar las mismas validaciones que el arranque.

## Módulo

No es necesario importar ni registrar `PrismaService`, porque `PrismaModule` es global.

```ts
@Module({
  controllers: [EntityController],
  providers: [
    EntityService,
    {
      provide: ENTITY_REPOSITORY,
      useClass: EntityRepository,
    },
  ],
})
export class EntityModule {}
```

## Integración

El desarrollador entrega su carpeta completa. El responsable de integración agrega el módulo a:

```text
src/modules/modules.module.ts
```

Los módulos funcionales nunca se agregan directamente a `AppModule`.

## Pruebas mínimas

Cada entrega debe incluir:

- Servicio probado con un repositorio simulado.
- Comportamiento cuando el registro no existe.
- Reglas de negocio propias del dominio.
- Repositorio probado con Prisma simulado.
- Verificación de filtros, campos y forma de las consultas.

Antes de entregar se debe ejecutar:

```bash
npm run verify
npm run test
npm run build
```

## Responsabilidad sobre el esquema

`prisma/schema.prisma` y las migraciones son recursos compartidos. Los cambios deben coordinarse con el responsable de base de datos para evitar migraciones incompatibles o conflictos entre ramas.
