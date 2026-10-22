import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePersonDto {
  @ApiProperty({ maxLength: 50, minLength: 2 })
  @IsNotEmpty()
  @IsString()
  first_name!: string;

  @ApiProperty({ maxLength: 50, minLength: 2 })
  @IsNotEmpty()
  @IsString()
  last_name!: string;

  @ApiProperty({ maxLength: 50, minLength: 2 })
  @IsNotEmpty()
  @IsString()
  second_last_name!: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento en formato YYYY/MM/DD o YYYY-MM-DD.',
    example: '1984/01/16',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && /^\d{4}\/\d{2}\/\d{2}$/.test(value)
      ? value.replace(/\//g, '-')
      : value,
  )
  @IsOptional()
  @IsDateString({ strict: true })
  birth_date!: string;

  @ApiProperty({ minLength: 3 })
  @IsNotEmpty()
  @IsString()
  gender!: string;

  @ApiProperty({ maxLength: 18, minLength: 18 })
  @IsOptional()
  @IsString()
  curp!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  rfc!: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email!: string;

  @ApiProperty({ maxLength: 10, minLength: 10 })
  @IsOptional()
  @IsString()
  phone!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address!: string;
}
