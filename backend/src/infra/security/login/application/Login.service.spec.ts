import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from './Login.service.js';
import { PrismaService } from '../../../database/prisma.service.js';

describe('TestService', () => {
  let service: LoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
