import pool from "../db/db";
import { generateShortCode } from "../utils/generateShortCode";

export const createShortURL = async (url: string, expiresAt?: number) => {
  let shortCode;
  for (let i = 0; i < 5; i++) {
    shortCode = generateShortCode();
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

export const getUrlByShortCode = async (shortUrl: string) => {
  const result = await pool.query("SELECT * FROM urls WHERE short_code = $1", [
    shortUrl,
  ]);

  return result.rows[0];
};

export const incrementClickCount = async (shortCode: string) => {
  await pool.query(
    "UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1 RETURNING *",
    [shortCode],
  );
  return;
};
