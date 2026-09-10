import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrUpdateCargaQuimicaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
