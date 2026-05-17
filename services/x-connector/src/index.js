const express = require("express");
require("dotenv").config({ path: "../../.env" });
const {
  getProfile,
  fetchRecentPosts,
  publishPost,
  registerImageUpload,
  uploadImage
} = require("./lib/linkedinApi");

const app = express();
app.use(express.json());

const port = process.env.linkedin__port || 4030;
const authBase = process.env.auth__base_url || "http://localhost:4010";

async function getAccessToken() {
  const tResp = await fetch(`${authBase}/tokens/current`);
  const tJson = await tResp.json();
  if (!tJson.ok || !tJson.tokens || !tJson.tokens.access_token) {
    throw new Error("No access token available");
  }
  return tJson.tokens.access_token;
}

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/recent-posts", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const profile = await getProfile(accessToken);
    const personId = profile.sub;
    if (!personId) return res.status(500).json({ ok: false, message: "Missing LinkedIn person id" });

    const postsJson = await fetchRecentPosts(accessToken, personId);
    const posts = (postsJson.elements || postsJson.items || []).map((item) => {
      const text = item?.commentary || item?.text || "";
      const created = item?.created?.time || item?.createdAt;
      return {
        id: item.id,
        text,
        created_at: created ? new Date(created).toISOString() : null
      };
    });

    return res.json({ ok: true, posts });
  } catch (err) {
    console.error("recent posts error", err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

app.post("/publish", async (req, res) => {
  const { text, includeImage, image } = req.body || {};
  if (!text) return res.status(400).json({ ok: false, message: "Missing text" });

  try {
    const accessToken = await getAccessToken();

    const profile = await getProfile(accessToken);
    const personId = profile.sub;
    if (!personId) return res.status(500).json({ ok: false, message: "Missing LinkedIn person id" });

    const authorUrn = `urn:li:person:${personId}`;
    const body = {
      author: authorUrn,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: []
      },
      lifecycleState: "PUBLISHED"
    };

    if (includeImage) {
      if (!image || !image.dataBase64) {
        return res.status(400).json({ ok: false, message: "Missing image data" });
      }

      const { uploadUrl, asset } = await registerImageUpload(accessToken, authorUrn);
      await uploadImage(uploadUrl, image);
      body.content = { media: { id: asset } };
    }

    const result = await publishPost(accessToken, body);
    return res.json({ ok: true, result });
  } catch (err) {
    console.error("publish error", err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

app.listen(port, () => {
  console.log(`[x-connector] listening on ${port}`);
});
