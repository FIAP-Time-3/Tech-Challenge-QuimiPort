export function gerarCodigoCarga(id: number): string {
  return `CQ-${String(id).padStart(6, '0')}`;
}
