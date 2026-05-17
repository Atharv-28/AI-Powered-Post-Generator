async function generateImage(prompt) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Missing image prompt");
  }

  // Use pollinations.ai - No API Key required
  // Append seed to avoid caching same image for same prompt if needed, 
  // but for now we just use the prompt
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Pollinations API error: ${resp.status}`);
    }

    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      mimeType: "image/jpeg",
      dataBase64: buffer.toString("base64"),
      url: url // Provide URL as well in case frontend prefers it
    };
  } catch (err) {
    throw new Error("Image generation failed: " + err.message);
  }
}

module.exports = { generateImage };