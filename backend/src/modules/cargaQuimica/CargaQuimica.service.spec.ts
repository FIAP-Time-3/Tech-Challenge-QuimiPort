import { Test, TestingModule } from '@nestjs/testing';
import { CargaQuimicaService } from './CargaQuimica.service.js';

describe('TestService', () => {
  let service: CargaQuimicaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CargaQuimicaService],
    }).compile();

    service = module.get<CargaQuimicaService>(CargaQuimicaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
