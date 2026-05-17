async function callGemini(promptText) {
  const apiKey = process.env.gemini__api_key;
  const model = process.env.gemini__model || "gemini-1.5-flash";

  if (!apiKey) {
    throw new Error("Missing gemini__api_key");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 400
    }
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await resp.json();
  if (!resp.ok) {
    const message = json?.error?.message || "Gemini request failed";
    throw new Error(message);
  }

  const text =
    json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  return text.trim();
}

function parseJsonArray(text) {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item));
    return null;
  } catch (err) {
    return null;
  }
}

async function generateDrafts(prompt) {
  if (!prompt.trim()) {
    return [];
  }

  const instruction = "3 distinct LinkedIn captions (max 100 words) for: " +
    prompt.slice(0, 300) +
    ". JSON array of 3 strings only, no markdown.";

  const text = await callGemini(instruction);
  const parsed = parseJsonArray(text);
  if (parsed && parsed.length) return parsed.slice(0, 3);

  // Gemini returned non-JSON — split numbered lines
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
  if (lines.length) return lines.slice(0, 3);

  throw new Error("Gemini returned an empty response");
}

async function reviseDraft(draft, instruction) {
  const text = `${draft}`.trim();
  const change = `${instruction}`.trim();
  if (!text || !change) return text;

  try {
    const result = await callGemini(`Revise this LinkedIn caption: "${text.slice(0, 400)}"\nInstruction: ${change.slice(0, 150)}\nReturn only the revised text.`);
    return result || text;
  } catch (err) {
    console.error("[content] reviseDraft failed", err.message);
    return text;
  }
}

module.exports = { generateDrafts, reviseDraft };
