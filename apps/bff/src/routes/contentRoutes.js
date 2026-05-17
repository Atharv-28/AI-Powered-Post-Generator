const express = require("express");
const { proxyJson } = require("../lib/proxy");

function createContentRoutes(contentBase) {
  const router = express.Router();

  router.post("/generate", async (req, res) => {
    const { data, status } = await proxyJson(`${contentBase}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {})
    });
    res.status(status).json(data);
  });

  router.post("/revise", async (req, res) => {
    const { data, status } = await proxyJson(`${contentBase}/revise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {})
    });
    res.status(status).json(data);
  });

  router.post("/image", async (req, res) => {
    const { data, status } = await proxyJson(`${contentBase}/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {})
    });
    res.status(status).json(data);
  });

  return router;
}

module.exports = { createContentRoutes };
