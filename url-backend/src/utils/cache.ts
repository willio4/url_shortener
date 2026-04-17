import { redisClient } from "./redisClient";

interface cacheEntry {
  data: any;
  expiresAt: number;
}


const CACHE_TTL = 1000 * 60 * 5;

export const getFromCache = async (key: string) => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const setCache = async (key: string, value: any) => {
  await redisClient.set(key, JSON.stringify(value), {
    EX: 300,
  })
};
