import {
  createShortURL,
  getOriginalUrl,
  getUrlByShortCode,
  incrementClickCount,
} from "../services/urlService.js";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export const createShortUrlHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { url, expiresAt } = req.body;

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new AppError("Invalid protocol", 400);
    }

    const result = await createShortURL(url, expiresAt);

    return res.status(201).json({
      shortUrl: `https://url-shortener-1-cak6.onrender.com/${result.short_code}`,
    });
  } catch (err) {
    next(err)
  }
};

export const goToOriginalUrlHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const shortCode = String(req.params.code);
    const url = await getOriginalUrl(shortCode);
    await incrementClickCount(shortCode);
    return res.redirect(url.original_url);

  } catch (err) {
    next(err);
  }
};

export const getUrlStatsHandler = async (req: Request, res: Response, next: NextFunction) => {
  const shortCode = String(req.params.code);

  try {
    const url = await getUrlByShortCode(shortCode);

    if (!url) {
      throw new AppError("Not found", 400);
    }

    const isExpired = url.expires_at && url.expires_at < new Date();

    return res.status(200).json({
      originalUrl: url.original_url,
      shortCode: url.short_code,
      clickCount: url.click_count,
      createdAt: url.created_at,
      expiresAt: url.expires_at,
      isExpired: isExpired,
    });
  } catch (err) {
    next(err);
  }
};
