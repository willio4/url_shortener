import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/version", (req, res) => {
  res.json({ version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
