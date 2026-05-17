const express = require("express");
const crypto = require("crypto");
require("dotenv").config({ path: "../../.env" });
const storage = require("./lib/storage");

const app = express();
app.use(express.json());

const port = process.env.auth__port || 4010;
const CLIENT_ID = process.env.linkedin__client_id;
const CLIENT_SECRET = process.env.linkedin__client_secret;
const REDIRECT_URI = process.env.linkedin__redirect_uri;
const SCOPES = process.env.linkedin__oauth_scopes || "openid profile email w_member_social";

storage.ensureDataDir();

app.get("/health", (req, res) => res.json({ ok: true }));

// Generate random strings for state
function base64url(buffer) {
  return buffer.toString("base64").replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

app.get("/oauth/linkedin/start", (req, res) => {
  if (!CLIENT_ID || !REDIRECT_URI) {
    return res.status(500).json({ ok: false, message: "Missing linkedin__client_id or linkedin__redirect_uri in .env" });
  }

  const state = base64url(crypto.randomBytes(18));
  // persist state for basic validation
  const stateStore = storage.readState();
  stateStore[state] = { createdAt: Date.now() };
  storage.writeState(stateStore);

  const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("state", state);

  console.log("[auth] linkedin oauth start", {
    redirect_uri: REDIRECT_URI,
    scopes: SCOPES,
    state
  });

  // Redirect the browser to LinkedIn auth page
  res.redirect(authUrl.toString());
});

app.get("/oauth/linkedin/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;

  console.log("[auth] linkedin oauth callback", {
    state,
    has_code: Boolean(code),
    error,
    error_description
  });

  const frontend = process.env.FRONTEND_URL || "http://localhost:3000";

  if (error) {
    const url = new URL(frontend);
    url.searchParams.set("auth_error", String(error));
    if (error_description) url.searchParams.set("auth_error_description", String(error_description));
    return res.redirect(url.toString());
  }

  if (!code || !state) {
    const url = new URL(frontend);
    url.searchParams.set("auth_error", "missing_code_or_state");
    return res.redirect(url.toString());
  }

  const stateStore = storage.readState();
  const entry = stateStore[state];
  if (!entry) {
    const url = new URL(frontend);
    url.searchParams.set("auth_error", "invalid_state");
    return res.redirect(url.toString());
  }

  // Exchange code for tokens
  try {
    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("code", code);
    body.set("redirect_uri", REDIRECT_URI);
    body.set("client_id", CLIENT_ID);
    body.set("client_secret", CLIENT_SECRET);

    const resp = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });
    const json = await resp.json();
    if (!resp.ok) {
      console.error("[auth] token exchange failed", { status: resp.status, error: json });
      const url = new URL(frontend);
      url.searchParams.set("auth_error", json.error || "token_exchange_failed");
      if (json.error_description) url.searchParams.set("auth_error_description", json.error_description);
      return res.redirect(url.toString());
    }

    console.log("[auth] linkedin token exchange ok", {
      scope: json.scope,
      token_type: json.token_type,
      expires_in: json.expires_in
    });

    // save tokens
    const tokens = storage.readTokens() || {};
    tokens.access_token = json.access_token;
    tokens.scope = json.scope;
    tokens.token_type = json.token_type;
    tokens.expires_in = json.expires_in;
    tokens.obtained_at = Date.now();
    storage.writeTokens(tokens);

    // cleanup pkce entry
    delete stateStore[state];
    storage.writeState(stateStore);

    // Redirect back to frontend with success
    return res.redirect(`${frontend}?connected=1`);
  } catch (err) {
    console.error("[auth] callback error", err);
    const url = new URL(frontend);
    url.searchParams.set("auth_error", "callback_error");
    url.searchParams.set("auth_error_description", err.message || "unknown");
    return res.redirect(url.toString());
  }
});

// LinkedIn does not provide refresh tokens in this flow; return a clear error
app.post("/tokens/refresh", async (req, res) => {
  return res.status(400).json({ ok: false, message: "LinkedIn tokens do not support refresh in this flow" });
});

// Return current tokens (internal/dev only)
app.get("/tokens/current", (req, res) => {
  const tokens = storage.readTokens();
  res.json({ ok: true, tokens });
});

app.listen(port, () => {
  console.log(`[auth] listening on ${port}`);
});
