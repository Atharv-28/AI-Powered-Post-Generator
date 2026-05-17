function getImageConfig() {
  return {
    provider: (process.env.image__provider || "").toLowerCase(),
    apiKey: process.env.image__api_key || process.env.gemini__api_key,
    model: process.env.image__model || "gemini-2.5-flash-image",
    size: process.env.image__size || "1024x1024"
  };
}

async function generateWithGemini(prompt) {
  const { apiKey, model } = getImageConfig();
  if (!apiKey) {
    throw new Error("Missing gemini__api_key (or image__api_key)");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Create a clean, professional LinkedIn post image based on this prompt. " +
              "Return a single image.\n\nPrompt: " +
              prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      responseModalities: ["IMAGE", "TEXT"]
    }
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await resp.json();
  if (!resp.ok) {
    const message = json?.error?.message || "Image generation failed";
    throw new Error(message);
  }

  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inline_data && p.inline_data.data);
  if (!imagePart) {
    throw new Error("Image response missing data");
  }

  return {
    mimeType: imagePart.inline_data.mime_type || "image/png",
    dataBase64: imagePart.inline_data.data
  };
}

async function generateImage(prompt) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Missing image prompt");
  }

  const { provider } = getImageConfig();
  if (provider === "gemini") {
    return generateWithGemini(prompt);
  }

  throw new Error("Image provider not configured (set image__provider=gemini)");
}

module.exports = { generateImage };