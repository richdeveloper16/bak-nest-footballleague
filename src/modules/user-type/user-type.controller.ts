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
import { UserTypeService } from './user-type.service';
import { CreateCatalogDto } from 'src/common/catalog/dto/create-catalog.dto';
import { ApiCrud } from 'src/common/decorators/api-endpoint.decorator';
import { UpdateCatalogDto } from 'src/common/catalog/dto/update-catalog.dto';
import { CatalogFilterDto } from 'src/common/catalog/dto/catalog-filter.dto';
import { CatalogResponseDto } from 'src/common/catalog/dto/catalog-response.dto';

@Controller('user-type')
export class UserTypeController {
  constructor(private readonly userTypeService: UserTypeService) {}

  @Post()
  @ApiCrud({
    summary: 'Registrar un tipo de usuario',
    description: 'Registra un nuevo tipo de usuario.',
    responseType: CreateCatalogDto,
    responseDescription: 'Tipo de Usuario registrado correctamente.',
    badRequestDescription: 'Los datos del Tipo de usuario no son válidos.',
    conflictDescription:
      'Ya existe un tipo de usuario con los mismos valores únicos.',
    isCreated: true,
  })
  create(@Body() dto: CreateCatalogDto) {
    return this.userTypeService.save(dto);
  }

  @Get()
  @ApiCrud({
    summary: 'Listar tipo de usuario',
    responseType: CatalogFilterDto,
    responseDescription: 'Tipos de usuarios paginados y filtrados.',
    badRequestDescription: 'Los filtros no son válidos.',
    isPaginated: true,
  })
  findAll(@Query() filters: CatalogFilterDto) {
    return this.userTypeService.findAll(filters);
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
    return this.userTypeService.findById(id);
  }

  @Patch(':id')
  @ApiCrud({
    summary: 'Actualizar un equipo',
    responseType: UpdateCatalogDto,
    responseDescription: 'Equipo actualizado.',
    badRequestDescription: 'El identificador o los datos no son válidos.',
    notFoundDescription: 'Equipo no encontrado.',
    conflictDescription: 'Ya existe un equipo con los mismos valores únicos.',
    hasIdParam: true,
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCatalogDto) {
    return this.userTypeService.update(id, dto);
  }
}
