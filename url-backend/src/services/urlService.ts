import pool from "../db/db";
import { generateShortCode } from "../utils/generateShortCode";
import { getFromCache, setCache } from "../utils/cache";
import { redisClient } from "../utils/redisClient";

export const createShortURL = async (url: string, expiresAt?: number) => {
  for (let i = 0; i < 5; i++) {
    const shortCode = generateShortCode();

    const goodCode = await pool.query(
      "SELECT 1 FROM urls WHERE short_code = $1",
      [shortCode],
    );
    if (goodCode.rows.length === 0) {
      if (expiresAt) {
        const date = new Date();
        date.setDate(date.getDate() + expiresAt);

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

  return;
};

export const getOriginalUrl = async (shortCode: string) => {
  const key = `url:${shortCode}`;

  try {
    const cached = await redisClient.get(key);
    if(cached) {
      console.log("hit cache");
      return JSON.parse(cached);
    }
  } catch {
    // ignore cache failure
  }

  const result = await pool.query("SELECT * FROM urls WHERE short_code = $1", [
    shortCode,
  ]);
  console.log("hit db");

  const url = result.rows[0];

  if (!url) return null;

  try {
    await redisClient.set(key, JSON.stringify(url), {
      EX: 300,
    })
  } catch {
    // ignore cache failure
  }

  return url;
};

export const getUrlByShortCode = async (shortCode: string) => {
  const result = await pool.query(
    "SELECT * FROM urls WHERE short_code = $1",
    [shortCode],
  );

  return result.rows[0];
}

export const incrementClickCount = async (shortCode: string) => {
  const result = await pool.query(
    `UPDATE urls 
     SET click_count = click_count + 1 
     WHERE short_code = $1 
     RETURNING *`,
    [shortCode],
  );

  const updated = result.rows[0];

  if(!updated) return;

  try {
    await redisClient.set(
      `url:${shortCode}`,
      JSON.stringify(updated),
      { EX: 300 }
    );
  } catch {
    // ignore
  }
};
