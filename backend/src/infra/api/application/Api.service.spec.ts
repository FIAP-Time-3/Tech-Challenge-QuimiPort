import { NotFoundException, StreamableFile } from '@nestjs/common';
import { mkdtemp, mkdir, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { ApiService } from './Api.service.js';

describe('ApiService', () => {
  let service: ApiService;
  let temporaryDirectory: string;

  beforeEach(async () => {
    service = new ApiService();
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'quimiport-api-test-'));
    await mkdir(join(temporaryDirectory, 'public'));
    await writeFile(
      join(temporaryDirectory, 'public', 'collection.json'),
      JSON.stringify({ openapi: '3.0.0' }),
    );
    vi.spyOn(process, 'cwd').mockReturnValue(temporaryDirectory);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(temporaryDirectory, { recursive: true, force: true });
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
