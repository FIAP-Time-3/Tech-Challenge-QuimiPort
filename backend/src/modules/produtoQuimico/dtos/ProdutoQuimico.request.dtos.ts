import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrUpdateProdutoQuimicoDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
