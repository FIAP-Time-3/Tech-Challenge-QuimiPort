import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ApiService {
  async getPublicFile({ filename }: { filename: string }) {
    const filePath = join(process.cwd(), 'public', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const file = createReadStream(filePath);

    return new StreamableFile(file, {
      type: 'application/json',
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
