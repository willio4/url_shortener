import express from "express";
import urlsRouter from "./routes/urls"
import { errorHandler } from "./middleware/errorHandler";
import cors from "cors";

const app = express();

app.use(cors({origin: "http://localhost:5173"}));
app.use(express.json());
app.use(urlsRouter);
app.use(errorHandler);

export default app;