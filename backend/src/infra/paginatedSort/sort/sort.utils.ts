import { BadRequestException } from '@nestjs/common';

export function adjustSortOption({
  column,
  order,
  fields,
}: {
  column: string;
  order: string;
  fields: Record<string, string>;
}) {
  if (!Object.values(fields).includes(column)) {
    throw new BadRequestException(`Coluna de ordenação inválida: ${column}`);
  }
  return {
    orderBy: { [column]: order },
  };
}
