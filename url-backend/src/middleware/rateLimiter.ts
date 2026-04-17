import type { Request, Response, NextFunction } from "express";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const record = new Map<string, RateLimitInfo>();

const WINDOW_SIZE_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = (req.headers["x-forwarded-for"] as string) || (req.ip as string);
  const now = Date.now();

  let userRecord = record.get(ip);

  if (!userRecord || now > userRecord.resetTime) {
    userRecord = {
      count: 1,
      resetTime: now + WINDOW_SIZE_MS,
    };

    record.set(ip, userRecord);
    return next();
  }

  if (userRecord.count >= MAX_REQUESTS) {
    return res.status(429).json({
      error: "Too many requests",
    });
  }

  userRecord.count += 1;
  return next();
};
