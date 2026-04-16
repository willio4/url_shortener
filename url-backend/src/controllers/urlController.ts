import {
  createShortURL,
  getUrlByShortCode,
  incrementClickCount,
} from "../services/urlService";
import type { Request, Response } from "express";

export const createShortUrlHandler = async (req: Request, res: Response) => {
  const { url, expiresAt } = req.body;

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "Invalid protocol" });
    }
  } catch {
    return res.status(400).json({ error: "Invalid url" });
  }

  const shortUrl = await createShortURL(url, expiresAt);

  if (!shortUrl) {
    return res.status(500).json({ error: "Internal server error" });
  }

  return res.status(201).json({
    shortUrl: "http://localhost:3000/" + shortUrl.short_code,
  });
};

export const goToOriginalUrlHandler = async (req: Request, res: Response) => {
  const shortCode = String(req.params.code);

  const url = await getUrlByShortCode(shortCode);

  if (!url) {
    return res.status(404).json({
      error: "Invalid URL",
    });
  }

  await incrementClickCount(url.short_code);

  if (url.expires_at && url.expires_at < new Date()) {
    return res.status(410).json({ error: "URL expired" });
  } else {
    return res.redirect(url.original_url);
  }
};

export const getUrlStatsHandler = async (req: Request, res: Response) => {
  const shortCode = String(req.params.code);
  const url = await getUrlByShortCode(shortCode);

  if (!url) {
    return res.status(404).json({ error: "Invalid url" });
  } else {
    const isExpired = url.expires_at && url.expires_at < new Date();
    return res.status(200).json({
      originalUrl: url.original_url,
      shortCode: url.short_code,
      clickCount: url.click_count,
      createdAt: url.created_at,
      expiresAt: url.expires_at,
      isExpired: isExpired,
    });
  }
};
