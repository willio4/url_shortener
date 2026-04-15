import pool from "../db/db";
import { generateShortCode } from "../utils/generateShortCode";

export const createShortURL = async (url: string, expiresAt: number) => {
    let short_code;
    for(let i = 0; i < 5; i++) {
        short_code = generateShortCode();
        const result = await pool.query("SELECT 1 FROM urls WHERE short_code = $1",
            [short_code],
        );
        if(result.rows.length === 0) break;
    }
    const date = new Date();
    date.setDate(date.getDate() + expiresAt);

    const dateOfExpiration = date.toISOString();
    const result = await pool.query(
        "INSERT INTO urls(original_url, short_code, expires_at) VALUES($1, $2, $3) RETURNING *",
        [url, short_code, dateOfExpiration],
    );

    return result.rows[0];
};