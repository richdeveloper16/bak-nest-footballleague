import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBranDtcho {
  @ApiProperty()
  @IsNumber()
  branch_id!: number;
  @ApiProperty()
  @IsString()
  code!: string;
  @ApiProperty()
  @IsString()
  name!: string;
  @ApiProperty()
  @IsString()
  address!: string;
  @ApiProperty()
  @IsString()
  phone!: string;
  @ApiProperty()
  @IsString()
  email!: string;
  @ApiProperty()
  @IsNumber()
  fk_manager_user!: number;
  @ApiProperty()
  @IsNumber()
  latitude!: number;
  @ApiProperty()
  @IsNumber()
  longitude!: number;
  @ApiProperty()
  @IsString()
  schedule!: string;
  @ApiProperty()
  @IsString()
  description!: string;
  @ApiProperty()
  @IsBoolean()
  status!: boolean;
  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && /^\d{4}\/\d{2}\/\d{2}$/.test(value)
      ? value.replace(/\//g, '-')
      : value,
  )
  @IsOptional()
  @IsDateString({ strict: true })
  registration_date!: string;
  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && /^\d{4}\/\d{2}\/\d{2}$/.test(value)
      ? value.replace(/\//g, '-')
      : value,
  )
  @IsOptional()
  @IsDateString({ strict: true })
  update_date!: string;
}
