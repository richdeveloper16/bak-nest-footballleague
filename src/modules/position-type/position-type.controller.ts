import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PositionTypeService } from './position-type.service';
import { CreateCatalogDto } from 'src/common/catalog/dto/create-catalog.dto';
import { ApiCrud } from 'src/common/decorators/api-endpoint.decorator';
import { CatalogFilterDto } from 'src/common/catalog/dto/catalog-filter.dto';
import { UpdateCatalogDto } from 'src/common/catalog/dto/update-catalog.dto';
import { CatalogResponseDto } from 'src/common/catalog/dto/catalog-response.dto';

@Controller('position-type')
export class PositionTypeController {
  constructor(private readonly positionTypeService: PositionTypeService) {}

  @Post()
  @ApiCrud({
    summary: 'Registrar Posicion de jugador',
    description: 'Registra una nueva posición de jugador',
    responseType: CreateCatalogDto,
    responseDescription: 'Posición registrado correctamente.',
    badRequestDescription: 'Los datos de la posicipon no son válidos.',
    conflictDescription:
      'Ya existe una Posición con los mismos valores únicos.',
    isCreated: true,
  })
  create(@Body() dto: CreateCatalogDto) {
    return this.positionTypeService.save(dto);
  }

  @Patch(':id')
  @ApiCrud({
    summary: 'Actualizar una posoción',
    responseType: UpdateCatalogDto,
    responseDescription: 'Posición actualizada.',
    badRequestDescription: 'El identificador o los datos no son válidos.',
    notFoundDescription: 'Posición no encontrada.',
    conflictDescription:
      'Ya existe una posición con los mismos valores únicos.',
    hasIdParam: true,
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCatalogDto) {
    return this.positionTypeService.update(id, dto);
  }

  @Get()
  @ApiCrud({
    summary: 'Listar tipo de posiciones',
    responseType: CatalogFilterDto,
    responseDescription: 'Posiciones paginados y filtrados.',
    badRequestDescription: 'Los filtros no son válidos.',
    isPaginated: true,
  })
  findAll(@Query() filters: CatalogFilterDto) {
    return this.positionTypeService.findAll(filters);
  }

  @Get(':id')
  @ApiCrud({
    summary: 'Consultar un tipo de usuario',
    responseType: CatalogResponseDto,
    responseDescription: 'Tipo de usuario encontrado.',
    badRequestDescription: 'El identificador no es válido.',
    notFoundDescription: 'Tipo de usuario no encontrado.',
    hasIdParam: true,
  })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.positionTypeService.findById(id);
  }
}
