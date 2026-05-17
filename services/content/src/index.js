const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { createContentRoutes } = require("./routes/contentRoutes");

const app = express();
app.use(express.json());

const port = process.env.content__port || 4020;

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/", createContentRoutes());

app.listen(port, () => {
  console.log(`[content] listening on ${port}`);
});
