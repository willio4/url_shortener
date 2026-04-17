import pool from "../config/db";
import { AppError } from "../utils/AppError";
import { generateShortCode } from "../utils/generateShortCode";
import { redisClient } from "../config/redisClient";

export const createShortURL = async (url: string, daysUntilExp?: number) => {
  for (let i = 0; i < 5; i++) {
    const shortCode = generateShortCode();

    const goodCode = await pool.query(
      "SELECT 1 FROM urls WHERE short_code = $1",
      [shortCode],
    );
    if (goodCode.rows.length === 0) {
      if (daysUntilExp) {
        const date = new Date();
        date.setDate(date.getDate() + daysUntilExp);

        const dateOfExpiration = date.toISOString();

        const result = await pool.query(
          "INSERT INTO urls(original_url, short_code, expires_at) VALUES($1, $2, $3) RETURNING *",
          [url, shortCode, dateOfExpiration],
        );

        return result.rows[0];
      } else {
        const result = await pool.query(
          "INSERT INTO urls(original_url, short_code) VALUES($1, $2) RETURNING *",
          [url, shortCode],
        );

        return result.rows[0];
      }
    }
  }

  throw new AppError("Failed to create short URL", 500);
};

export const getOriginalUrl = async (shortCode: string) => {
  const key = `url:${shortCode}`;

  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // ignore cache failure
  }

  const result = await pool.query("SELECT * FROM urls WHERE short_code = $1", [
    shortCode,
  ]);

  const url = result.rows[0];

  if (!url) {
    throw new AppError("URL not found", 404);
  }

  try {
    await redisClient.set(key, JSON.stringify(url), {
      EX: 300,
    });
  } catch {
    // ignore cache failure
  }

  return url;
};

export const getUrlByShortCode = async (shortCode: string) => {
  const result = await pool.query("SELECT * FROM urls WHERE short_code = $1", [
    shortCode,
  ]);

  return result.rows[0];
};

export const incrementClickCount = async (shortCode: string) => {
  const result = await pool.query(
    `UPDATE urls 
     SET click_count = click_count + 1 
     WHERE short_code = $1 
     RETURNING *`,
    [shortCode],
  );

  const updated = result.rows[0];

  if (!updated) return;

  try {
    await redisClient.set(`url:${shortCode}`, JSON.stringify(updated), {
      EX: 300,
    });
  } catch {
    // ignore
  }
};
