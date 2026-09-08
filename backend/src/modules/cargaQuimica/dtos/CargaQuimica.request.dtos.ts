import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrUpdateCargaQuimicaDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
