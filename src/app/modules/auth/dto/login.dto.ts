import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  publicAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signature: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  remember: boolean;
}
