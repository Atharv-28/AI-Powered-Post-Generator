const express = require("express");
const { generateDrafts, reviseDraft } = require("../lib/geminiClient");
const { generateImage } = require("../lib/imageClient");

function createContentRoutes() {
  const router = express.Router();

  router.post("/generate", async (req, res) => {
    const prompt = req.body?.prompt || "";
    try {
      const drafts = await generateDrafts(prompt);
      res.json({ ok: true, drafts });
    } catch (err) {
      console.error("[content] /generate error:", err.message);
      res.status(500).json({ ok: false, message: err.message });
    }
  });

  router.post("/revise", async (req, res) => {
    const draft = req.body?.draft || "";
    const instruction = req.body?.instruction || "";
    const revised = await reviseDraft(draft, instruction);
    res.json({ ok: true, draft: revised });
  });

  router.post("/image", async (req, res) => {
    const prompt = req.body?.prompt || "";
    try {
      const image = await generateImage(prompt);
      res.json({ ok: true, image });
    } catch (err) {
      res.status(400).json({ ok: false, message: err.message });
    }
  });

  return router;
}

module.exports = { createContentRoutes };
