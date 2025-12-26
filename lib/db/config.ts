import { Pool, PoolConfig } from 'pg';
import Redis, { RedisOptions } from 'ioredis';

// PostgreSQL configuration
const getPoolConfig = (): PoolConfig => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const dbUrl = new URL(process.env.DATABASE_URL);

  return {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '5432'),
    database: dbUrl.pathname.slice(1),
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
};

// Initialize pool only if DATABASE_URL is present
let pool: Pool | null = null;
if (process.env.DATABASE_URL) {
  pool = new Pool(getPoolConfig());
} else {
  console.warn('DATABASE_URL not set, PostgreSQL pool will not be initialized');
}

// Redis configuration
// Redis configuration
const getRedisOptions = (): { url: string, options: RedisOptions } | null => {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL not set, Redis features will be disabled');
    return null;
  }

  return {
    url: process.env.REDIS_URL,
    options: {
      password: process.env.REDIS_PASSWORD,
      tls: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : (process.env.REDIS_URL?.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined),
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableOfflineQueue: true,
    }
  };
};

const redisConfig = getRedisOptions();
const redis = redisConfig ? new Redis(redisConfig.url, redisConfig.options) : null;

// Cache configuration
const CACHE_TTL = {
  SHORT: 60 * 5, // 5 minutes
  MEDIUM: 60 * 60, // 1 hour
  LONG: 60 * 60 * 24, // 1 day
} as const;

// Error handling
if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
  });
}

if (redis) {
  redis.on('error', (err) => {
    console.error('Redis connection error', err);
  });
}

export { pool, redis, CACHE_TTL };