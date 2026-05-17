async function callOpenAI(promptText) {
  const apiKey = process.env.openai__api_key;
  const model = process.env.openai__model || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("Missing openai__api_key");
  }

  const url = "https://api.openai.com/v1/chat/completions";

  const body = {
    model: model,
    messages: [
      {
        role: "user",
        content: promptText
      }
    ],
    temperature: 0.8,
    top_p: 0.9,
    max_tokens: 400
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const json = await resp.json();
  if (!resp.ok) {
    const message = json?.error?.message || "OpenAI request failed";
    throw new Error(message);
  }

  const text = json?.choices?.[0]?.message?.content || "";
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

  const text = await callOpenAI(instruction);
  const parsed = parseJsonArray(text);
  if (parsed && parsed.length) return parsed.slice(0, 3);

  // OpenAI returned non-JSON — split numbered lines
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
  if (lines.length) return lines.slice(0, 3);

  throw new Error("OpenAI returned an empty response");
}

async function reviseDraft(draft, instruction) {
  const text = `${draft}`.trim();
  const change = `${instruction}`.trim();
  if (!text || !change) return text;

  try {
    const result = await callOpenAI(`Revise this LinkedIn caption: "${text.slice(0, 400)}"\nInstruction: ${change.slice(0, 150)}\nReturn only the revised text without markdown or quotes.`);
    return result || text;
  } catch (err) {
    console.error("[content] reviseDraft failed", err.message);
    return text;
  }
}

module.exports = { generateDrafts, reviseDraft };
