import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prismaService: PrismaService,
    private redisService: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Comprehensive health check' })
  @ApiResponse({ status: 200, description: 'Health check results' })
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      async () => {
        const isHealthy = await this.prismaService.healthCheck();
        return {
          database: {
            status: isHealthy ? 'up' : 'down',
          },
        };
      },

      // Redis health
      async () => {
        const isHealthy = await this.redisService.ping();
        return {
          redis: {
            status: isHealthy ? 'up' : 'down',
          },
        };
      },

      // Memory health
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),

      // Disk health
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @HealthCheck()
  ready() {
    return this.health.check([
      // Only check critical dependencies for readiness
      async () => {
        const isHealthy = await this.prismaService.healthCheck();
        return {
          database: {
            status: isHealthy ? 'up' : 'down',
          },
        };
      },
      async () => {
        const isHealthy = await this.redisService.ping();
        return {
          redis: {
            status: isHealthy ? 'up' : 'down',
          },
        };
      },
    ]);
  }
}