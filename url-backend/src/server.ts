import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/version", (req, res) => {
  res.json({ version: "1.0.0" });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is successfully running on port ${PORT}`);
});
