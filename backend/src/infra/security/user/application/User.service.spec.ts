import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './User.service.js';
import { PrismaService } from '../../../database/prisma.service.js';

describe('TestService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
