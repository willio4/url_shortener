import { createShortURL } from "../services/urlService";
import type { Request, Response } from "express";

export const createShortURLHandler = async (req: Request, res: Response) => {
  const { url, expiresAt } = req.body;

  const shortURL = await createShortURL(url, expiresAt);

  res.status(201).json({
    shortUrl: "http://localhost:3000/" + shortURL.short_code
  });
};
