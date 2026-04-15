import { Router } from "express";
import { createShortURLHandler } from "../controllers/urlController";

const router = Router();

router.post("/shorten", createShortURLHandler);

export default router;