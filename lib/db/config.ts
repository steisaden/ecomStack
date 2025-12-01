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

const pool = new Pool(getPoolConfig());

// Redis configuration
const getRedisConfig = (): RedisOptions => {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  return {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.NODE_ENV === 'production' ? {} : undefined,
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    enableOfflineQueue: true,
  };
};

const redis = new Redis(getRedisConfig());

// Cache configuration
const CACHE_TTL = {
  SHORT: 60 * 5, // 5 minutes
  MEDIUM: 60 * 60, // 1 hour
  LONG: 60 * 60 * 24, // 1 day
} as const;

// Error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

redis.on('error', (err) => {
  console.error('Redis connection error', err);
});

export { pool, redis, CACHE_TTL };