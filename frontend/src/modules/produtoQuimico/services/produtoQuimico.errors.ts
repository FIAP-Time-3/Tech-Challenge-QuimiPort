import axios from 'axios';

export function mensagemErroProdutoQuimico(
  error: unknown,
  fallback: string,
): string {
  if (!axios.isAxiosError(error)) return fallback;
  if (!error.response)
    return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.';
  if (error.response.status === 403)
    return 'Seu perfil não tem permissão para realizar esta operação.';
  if (error.response.status === 404)
    return 'O produto não foi encontrado. Ele pode ter sido removido.';
  if (error.response.status === 409) {
    const message: unknown = error.response.data?.message;
    return typeof message === 'string'
      ? message
      : 'A operação não pôde ser concluída por um conflito nos dados.';
  }
  if (error.response.status === 400)
    return 'Confira os campos informados. A classe de risco deve estar entre 1 e 9.';
  return fallback;
}
