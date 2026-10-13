import { ApiProperty } from '@nestjs/swagger';

export class TeamResponseDto {
  @ApiProperty({ example: 1 })
  teamId!: number;

  @ApiProperty({ maxLength: 150 })
  name!: string;

  @ApiProperty({ type: String, nullable: true, maxLength: 50 })
  shortName!: string | null;

  @ApiProperty()
  status!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  registrationDate!: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updateDate!: Date | null;

  @ApiProperty({ type: String, nullable: true, maxLength: 30 })
  code!: string | null;

  @ApiProperty({ type: String, nullable: true })
  logoUrl!: string | null;

  @ApiProperty({ type: String, nullable: true, maxLength: 20 })
  primaryColor!: string | null;

  @ApiProperty({ type: String, nullable: true, maxLength: 20 })
  secondaryColor!: string | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  foundationDate!: Date | null;

  @ApiProperty({ type: String, nullable: true, maxLength: 500 })
  description!: string | null;

  @ApiProperty({ type: Number, nullable: true })
  fkHomeField!: number | null;
}
