// src/redis/redis.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl =
      this.configService.get<string>('redis.url') ||
      `redis://${this.configService.get<string>('redis.host') || 'localhost'}:${this.configService.get<number>('redis.port') || 6379}`;

    this.redis = new Redis(redisUrl);
  }

  async set(key: string, value: string) {
    await this.redis.set(key, value);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async hSet(hash: string, key: string, value: string) {
    await this.redis.hset(hash, key, value);
  }

  async hGet(hash: string, key: string) {
    return this.redis.hget(hash, key);
  }

  async hDel(hash: string, key: string) {
    await this.redis.hdel(hash, key);
  }

  async hGetAll(hash: string) {
    return this.redis.hgetall(hash);
  }
}
