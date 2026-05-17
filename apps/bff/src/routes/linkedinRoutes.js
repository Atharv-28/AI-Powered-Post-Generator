const express = require("express");
const { proxyJson } = require("../lib/proxy");

function createLinkedInRoutes(authBase, linkedinBase) {
  const router = express.Router();

  router.get("/connect", (req, res) => {
    const url = new URL(`${authBase}/oauth/linkedin/start`);
    req.query && Object.entries(req.query).forEach(([k, v]) => url.searchParams.set(k, v));
    return res.redirect(url.toString());
  });

  router.get("/callback", (req, res) => {
    const url = new URL(`${authBase}/oauth/linkedin/callback`);
    req.query && Object.entries(req.query).forEach(([k, v]) => url.searchParams.set(k, v));
    return res.redirect(url.toString());
  });

  router.get("/recent-posts", async (req, res) => {
    const { data, status } = await proxyJson(`${linkedinBase}/recent-posts`);
    res.status(status).json(data);
  });

  router.post("/publish", async (req, res) => {
    const { data, status } = await proxyJson(`${linkedinBase}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {})
    });
    res.status(status).json(data);
  });

  return router;
}

module.exports = { createLinkedInRoutes };
