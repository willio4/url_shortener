import { Router } from "express";
import { rateLimiter } from "../middleware/rateLimiter";
import {
  createShortUrlHandler,
  goToOriginalUrlHandler,
  getUrlStatsHandler,
} from "../controllers/urlController";

const router = Router();

router.post("/shorten", rateLimiter, createShortUrlHandler);
router.get("/:code", goToOriginalUrlHandler);
router.get("/stats/:code", getUrlStatsHandler);

export default router;
