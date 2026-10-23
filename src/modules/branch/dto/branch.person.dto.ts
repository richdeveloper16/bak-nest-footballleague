import { ApiProperty } from '@nestjs/swagger';

export class BranchResponseDto {
  @ApiProperty({ example: 1 })
  branch_id!: number;
  @ApiProperty({ type: String, nullable: true })
  code!: string | null;
  @ApiProperty({ type: String, nullable: true })
  name!: string | null;
  @ApiProperty({ type: String, nullable: true })
  address!: string | null;
  @ApiProperty({ type: String, nullable: true })
  phone!: string | null;
  @ApiProperty({ type: String, nullable: true })
  email!: string | null;
  @ApiProperty({ type: String, nullable: true })
  manager_user!: string | null;
  @ApiProperty({ type: String, nullable: true })
  schedule!: string | null;
  @ApiProperty({ type: String, nullable: true })
  description!: string | null;
  @ApiProperty()
  status!: boolean;
}
