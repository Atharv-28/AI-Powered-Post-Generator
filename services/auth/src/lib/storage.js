const fs = require("fs");
const path = require("path");

const dataDir = path.resolve(__dirname, "../../data");
const tokensPath = path.join(dataDir, "tokens.json");
const statePath = path.join(dataDir, "state.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(tokensPath)) fs.writeFileSync(tokensPath, JSON.stringify({}));
  if (!fs.existsSync(statePath)) fs.writeFileSync(statePath, JSON.stringify({}));
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8") || "{}");
  } catch (err) {
    return {};
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  ensureDataDir,
  readTokens: () => readJson(tokensPath),
  writeTokens: (data) => writeJson(tokensPath, data),
  readState: () => readJson(statePath),
  writeState: (data) => writeJson(statePath, data)
};
