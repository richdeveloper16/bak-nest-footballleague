import { ApiProperty } from '@nestjs/swagger';

export class PersonResponseDto {
  @ApiProperty({ example: 1 })
  person_id!: number;
  @ApiProperty({})
  first_name!: string;
  @ApiProperty({})
  last_name!: string;
  @ApiProperty({})
  second_last_name!: string;
  @ApiProperty({ type: String, format: 'date-time' })
  birth_date!: string;
  @ApiProperty({})
  gender!: string;
  @ApiProperty({})
  curp!: string;
  @ApiProperty({})
  rfc!: string;
  @ApiProperty({})
  email!: string;
  @ApiProperty({})
  phone!: string;
  @ApiProperty({})
  status!: boolean;
  @ApiProperty({ type: String, format: 'date-time' })
  registration_date!: string;
}
