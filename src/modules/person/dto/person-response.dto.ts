import { ApiProperty } from '@nestjs/swagger';

export class PersonResponseDto {
  @ApiProperty({ example: 1 })
  person_id!: number;
  @ApiProperty({})
  first_name!: string;
  @ApiProperty({})
  last_name!: string;
  @ApiProperty({ type: String, nullable: true })
  second_last_name!: string | null;
  @ApiProperty({ type: String, format: 'date', nullable: true })
  birth_date!: string | null;
  @ApiProperty({ type: String, nullable: true })
  gender!: string | null;
  @ApiProperty({ type: String, nullable: true })
  curp!: string | null;
  @ApiProperty({ type: String, nullable: true })
  rfc!: string | null;
  @ApiProperty({ type: String, nullable: true })
  email!: string | null;
  @ApiProperty({ type: String, nullable: true })
  phone!: string | null;
  @ApiProperty({})
  status!: boolean;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  registration_date!: string;
}
