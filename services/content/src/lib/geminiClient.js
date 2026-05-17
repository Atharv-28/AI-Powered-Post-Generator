async function callGemini(promptText) {
  const apiKey = process.env.gemini__api_key;
  const model = process.env.gemini__model || "gemini-2.0-flash";

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
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 256
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

function fallbackDrafts(prompt) {
  return [
    `Proud moment: ${prompt}. Grateful for the support that made it possible.`,
    `${prompt} — a reminder that consistency and focus compound over time.`,
    `Milestone unlocked: ${prompt}. Onward to the next challenge.`
  ];
}

async function generateDrafts(prompt) {
  if (!prompt.trim()) {
    return [];
  }

  const instruction =
    "Write 3 distinct LinkedIn post captions (1-3 sentences each) for the topic below. " +
    "Be natural, not hashtags-only. Return ONLY a JSON array of strings, no extra text.";

  try {
    const text = await callGemini(`${instruction}\n\nTopic: ${prompt}`);
    const parsed = parseJsonArray(text);
    if (parsed && parsed.length) return parsed.slice(0, 3);

    // Fallback: split lines
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
    return lines.slice(0, 3);
  } catch (err) {
    console.error("[content] generateDrafts failed", err.message);
    return fallbackDrafts(prompt);
  }
}

async function reviseDraft(draft, instruction) {
  const text = `${draft}`.trim();
  const change = `${instruction}`.trim();
  if (!text || !change) return text;

  const prompt =
    "Revise the LinkedIn caption below using the instruction. " +
    "Return ONLY the revised caption text, no quotes or extra text.";

  try {
    const result = await callGemini(`${prompt}\n\nCaption: ${text}\n\nInstruction: ${change}`);
    return result || text;
  } catch (err) {
    console.error("[content] reviseDraft failed", err.message);
    return text;
  }
}

module.exports = { generateDrafts, reviseDraft };
