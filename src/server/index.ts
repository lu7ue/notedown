import express from "express";

const PORT = 3001;
const app = express();

app.get("/api/msg", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
