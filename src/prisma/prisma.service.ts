
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';

import pkg from 'pg';
import { PrismaClient } from 'prisma/generated/prisma/client';
const { Pool } = pkg;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: pkg.Pool;

  constructor() {
    // Manually setup the connection pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    
    // Inject the adapter into the Prisma Client
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    // Prisma 7 connects via the adapter automatically, 
    // but calling $connect ensures the pool is ready.
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}