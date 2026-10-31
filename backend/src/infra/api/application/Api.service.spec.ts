import { NotFoundException, StreamableFile } from '@nestjs/common';
import { ApiService } from './Api.service.js';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    service = new ApiService();
  });

  it('retorna arquivo público existente como StreamableFile', async () => {
    const file = await service.getPublicFile({ filename: 'collection.json' });

    expect(file).toBeInstanceOf(StreamableFile);
    const content = [];
    for await (const chunk of file.getStream()) {
      content.push(chunk.toString());
    }
    expect(content.join('')).toContain('openapi');
  });

  it('devolve 404 quando o arquivo público não existe', async () => {
    await expect(
      service.getPublicFile({ filename: 'arquivo-inexistente.json' }),
    ).rejects.toThrow(NotFoundException);
  });
});
