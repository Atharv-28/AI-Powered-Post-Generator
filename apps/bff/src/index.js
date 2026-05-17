const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../../.env" });
const { createContentRoutes } = require("./routes/contentRoutes");
const { createLinkedInRoutes } = require("./routes/linkedinRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const bffPort = process.env.bff__port || 4000;
const authBase = process.env.auth__base_url || "http://localhost:4010";
const contentBase = process.env.content__base_url || "http://localhost:4020";
const linkedinBase = process.env.linkedin__base_url || "http://localhost:4030";

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/content", createContentRoutes(contentBase));
app.use("/api/linkedin", createLinkedInRoutes(authBase, linkedinBase));

app.listen(bffPort, () => {
  console.log(`[bff] listening on ${bffPort}`);
});
