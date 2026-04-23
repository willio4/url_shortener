import express from "express";
import urlsRouter from "./routes/urls.js"
import { errorHandler } from "./middleware/errorHandler.js";
import cors from "cors";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  methods: ["GET", "POST"]
}));
app.use(express.json());
app.use(urlsRouter);
app.use(errorHandler);

export default app;