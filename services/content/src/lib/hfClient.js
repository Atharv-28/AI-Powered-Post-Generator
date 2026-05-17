const { HfInference } = require("@huggingface/inference");

function getHfClient() {
  const token = process.env.hf__token;
  if (!token) {
    throw new Error("Missing hf__token in environment");
  }
  return new HfInference(token);
}

function parseJsonArray(text) {
  try {
    // Sometimes models wrap JSON in markdown blocks
    const cleaned = text.replace(/```(json)?/g, '').trim();
    const parsed = JSON.parse(cleaned);
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

  const hf = getHfClient();
  const instruction = "Write 3 distinct LinkedIn captions (max 100 words) for: " +
    prompt.slice(0, 300) +
    ". Return ONLY a valid JSON array of 3 strings. No markdown, no pre-text, no post-text.";

  const response = await hf.textGeneration({
    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
    inputs: instruction,
    parameters: {
      max_new_tokens: 400,
      temperature: 0.8,
      top_p: 0.9,
      return_full_text: false
    }
  });

  const text = response.generated_text || "";
  const parsed = parseJsonArray(text);
  if (parsed && parsed.length) return parsed.slice(0, 3);

  // Fallback if JSON fails
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\d+\.\s*/, "").replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length) return lines.slice(0, 3);

  throw new Error("Hugging Face returned an empty or invalid response");
}

async function reviseDraft(draft, instruction) {
  const text = `${draft}`.trim();
  const change = `${instruction}`.trim();
  if (!text || !change) return text;

  const hf = getHfClient();
  const prompt = `Revise this LinkedIn caption: "${text.slice(0, 400)}"\nInstruction: ${change.slice(0, 150)}\nReturn only the revised text without markdown or quotes.`;

  try {
    const response = await hf.textGeneration({
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      inputs: prompt,
      parameters: {
        max_new_tokens: 400,
        temperature: 0.8,
        top_p: 0.9,
        return_full_text: false
      }
    });

    return response.generated_text?.trim() || text;
  } catch (err) {
    console.error("[content] reviseDraft failed", err.message);
    return text;
  }
}

module.exports = { generateDrafts, reviseDraft };
