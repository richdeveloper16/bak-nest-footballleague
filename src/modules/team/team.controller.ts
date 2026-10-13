import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamFilterDto } from './dto/team-filter.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ApiCrud } from '../../common/decorators/api-endpoint.decorator';
import { TeamResponseDto } from './dto/team-response.dto';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiCrud({
    summary: 'Registrar un equipo',
    description: 'Registra un nuevo equipo.',
    responseType: TeamResponseDto,
    responseDescription: 'Equipo registrado correctamente.',
    badRequestDescription: 'Los datos del equipo no son válidos.',
    conflictDescription: 'Ya existe un equipo con los mismos valores únicos.',
    isCreated: true,
  })
  create(@Body() dto: CreateTeamDto) {
    return this.teamService.create(dto);
  }

  @Get()
  @ApiCrud({
    summary: 'Listar equipos',
    responseType: TeamResponseDto,
    responseDescription: 'Equipos paginados y filtrados.',
    badRequestDescription: 'Los filtros no son válidos.',
    isPaginated: true,
  })
  findAll(@Query() filters: TeamFilterDto) {
    return this.teamService.findAll(filters);
  }

  @Get(':id')
  @ApiCrud({
    summary: 'Consultar un equipo',
    responseType: TeamResponseDto,
    responseDescription: 'Equipo encontrado.',
    badRequestDescription: 'El identificador no es válido.',
    notFoundDescription: 'Equipo no encontrado.',
    hasIdParam: true,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teamService.findOne(id);
  }

  @Patch(':id')
  @ApiCrud({
    summary: 'Actualizar un equipo',
    responseType: TeamResponseDto,
    responseDescription: 'Equipo actualizado.',
    badRequestDescription: 'El identificador o los datos no son válidos.',
    notFoundDescription: 'Equipo no encontrado.',
    conflictDescription: 'Ya existe un equipo con los mismos valores únicos.',
    hasIdParam: true,
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTeamDto) {
    return this.teamService.update(id, dto);
  }

  @Delete(':id')
  @ApiCrud({
    summary: 'Eliminar un equipo',
    responseType: TeamResponseDto,
    responseDescription: 'Equipo eliminado.',
    badRequestDescription: 'Identificador inválido o registro relacionado.',
    notFoundDescription: 'Equipo no encontrado.',
    hasIdParam: true,
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teamService.remove(id);
  }
}
