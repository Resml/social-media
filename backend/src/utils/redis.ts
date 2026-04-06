import Redis from 'ioredis';

export const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6380');

export const getCache = async (key: string) => {
  const data = await redisClient.get(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

export const setCache = async (key: string, value: any, ttlSeconds = 300) => {
  const data = typeof value === 'string' ? value : JSON.stringify(value);
  await redisClient.setex(key, ttlSeconds, data);
};
