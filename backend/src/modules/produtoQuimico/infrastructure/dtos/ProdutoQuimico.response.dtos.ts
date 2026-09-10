import { Expose } from 'class-transformer';

export class ProdutoQuimicoResponseDto {
  @Expose()
  name: string;
}
