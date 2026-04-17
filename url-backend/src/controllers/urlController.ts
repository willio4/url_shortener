import {
  createShortURL,
  getOriginalUrl,
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

    const result = await createShortURL(url, expiresAt);

    if (!result) {
      return res.status(500).json({ error: "Failed to create short URL" });
    }

    return res.status(201).json({
      shortUrl: `http://localhost:3000/${result.short_code}`,
    });
  } catch {
    return res.status(400).json({ error: "Invalid url" });
  }
};

export const goToOriginalUrlHandler = async (req: Request, res: Response) => {
  const shortCode = String(req.params.code);

  try {
    const url = await getOriginalUrl(shortCode);

    if (!url) {
      return res.status(404).json({ error: "Not found" });
    }

    await incrementClickCount(shortCode);

    if (url.expires_at && url.expires_at < new Date()) {
      return res.status(410).json({ error: "URL expired" });
    }

    return res.redirect(url.original_url);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUrlStatsHandler = async (req: Request, res: Response) => {
  const shortCode = String(req.params.code);

  try {
    const url = await getUrlByShortCode(shortCode);

    if (!url) {
      return res.status(404).json({ error: "Not found" });
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
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};
