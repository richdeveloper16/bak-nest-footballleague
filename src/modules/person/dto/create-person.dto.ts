import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional({ format: 'date', example: '1990-05-20' })
  @IsOptional()
  @IsDateString()
  birth_date!: string;

  @ApiProperty({ minLength: 3 })
  @IsNotEmpty()
  @IsString()
  gender!: string;

  @ApiProperty({ maxLength: 18, minLength: 18 })
  @IsOptional()
  @IsString()
  curp!: string;

  @IsOptional()
  @IsString()
  rfc!: string;

  @IsOptional()
  @IsEmail()
  email!: string;

  @ApiProperty({ maxLength: 10, minLength: 10 })
  @IsOptional()
  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  address!: string;
}
