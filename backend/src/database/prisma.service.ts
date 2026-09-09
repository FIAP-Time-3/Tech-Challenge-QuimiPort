import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import configuration from '../configuration/configuration.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: configuration().database.url,
    });
    console.log(configuration().database.url);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
