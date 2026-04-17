import express from "express";
import urlsRouter from "./routes/urls"
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(urlsRouter);
app.use(errorHandler);

export default app;