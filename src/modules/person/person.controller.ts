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
import { PersonService } from './person.service';
import { ApiCrud } from 'src/common/decorators/api-endpoint.decorator';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update.person.dto';
import { PersonFilterDto } from './dto/person-filter.dto';
import { PersonResponseDto } from './dto/person-response.dto';

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  @ApiCrud({
    summary: 'Registrar una persona',
    description: 'Registra una nueva persona',
    responseType: CreatePersonDto,
    responseDescription: 'Persona registrada de forma correctamente.',
    badRequestDescription: 'Los datos de la persona no son válidos.',
    conflictDescription: 'Ya existe una persona con los mismos valores únicos.',
    isCreated: true,
  })
  create(@Body() dto: CreatePersonDto) {
    return this.personService.save(dto);
  }

  @Patch(':id')
  @ApiCrud({
    summary: 'Actualizar Persoan',
    responseType: UpdatePersonDto,
    responseDescription: 'Persona actualizada.',
    badRequestDescription: 'El identificador o los datos no son válidos.',
    notFoundDescription: 'Persona no encontrado.',
    conflictDescription: 'Ya existe una Persona con los mismos valores únicos.',
    hasIdParam: true,
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePersonDto) {
    return this.personService.update(id, dto);
  }

  @Get()
  @ApiCrud({
    summary: 'Listar Personas',
    responseType: PersonFilterDto,
    responseDescription: 'Personas paginados y filtrados.',
    badRequestDescription: 'Los filtros no son válidos.',
    isPaginated: true,
  })
  findAll(@Query() filters: PersonFilterDto) {
    return this.personService.findAll(filters);
  }

  @Get(':id')
  @ApiCrud({
    summary: 'Consultar una Persona',
    responseType: PersonResponseDto,
    responseDescription: 'Registro de persona encontrada.',
    badRequestDescription: 'El identificador no es válido.',
    notFoundDescription: 'Persona no encontrado.',
    hasIdParam: true,
  })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.personService.findById(id);
  }
}
