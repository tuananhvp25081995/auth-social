import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  publicAddress: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  refCode?: string;
}
