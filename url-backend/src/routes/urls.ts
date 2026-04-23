import { Router } from "express";
import { rateLimiter } from "../middleware/rateLimiter.js";
import {
  createShortUrlHandler,
  goToOriginalUrlHandler,
  getUrlStatsHandler,
} from "../controllers/urlController.js";

const router = Router();

router.post("/shorten", rateLimiter, createShortUrlHandler);
router.get("/:code", goToOriginalUrlHandler);
router.get("/stats/:code", getUrlStatsHandler);

export default router;
