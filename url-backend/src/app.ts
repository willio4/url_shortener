import express from "express";
import urlsRouter from "./routes/urls"

const app = express();

app.use(express.json());
app.use("/urls", urlsRouter);

export default app;