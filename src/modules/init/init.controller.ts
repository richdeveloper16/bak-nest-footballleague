import { Controller, Get } from '@nestjs/common';
import { InitService } from './init.service';
import { ApiCrud } from '../../common/decorators/api-endpoint.decorator';
import { ApiResponseDto } from '../../common/dto/api/api-response.dto';

@Controller('init')
export class InitController {
  constructor(private readonly teamService: InitService) {}

  @Get()
  @ApiCrud({
    summary: 'Metodo valida Api OK!',
    responseType: ApiResponseDto,
    responseDescription: 'Validación de api desplegada de forma correcta',
    badRequestDescription: 'Api no funcional',
    isPaginated: true,
  })
  getInit() {
    return this.teamService.getInit();
  }
}
