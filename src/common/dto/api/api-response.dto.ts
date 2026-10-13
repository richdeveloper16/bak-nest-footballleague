import { ApiProperty } from '@nestjs/swagger';

/** Campos comunes del contrato HTTP; el decorador define el tipo de data. */
export class ApiResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty({ example: 200 })
  code!: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message!: string | string[];

  @ApiProperty({
    type: String,
    example: '2026-10-09 14:54:35',
    description: 'Fecha y hora de Ciudad de México (YYYY-MM-DD HH:mm:ss).',
  })
  timestamp!: string;

  @ApiProperty({ example: '/team' })
  path!: string;
}
