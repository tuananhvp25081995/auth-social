import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddressAvailabilityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  publicAddress: string;
}
