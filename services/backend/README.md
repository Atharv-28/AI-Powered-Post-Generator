# Consolidated Backend

This service converges the previous `auth`, `content`, `x-connector`, and `worker` services into a single Express app to simplify deployment.

Usage

- Install dependencies and start:

```bash
cd services/backend
npm install
npm run start
```

Environment

Common env variables are read from the repo `.env` (for local development) or set in Render dashboard:

- `PORT` (Render provides this)
- `linkedin__client_id`
- `linkedin__client_secret`
- `linkedin__redirect_uri` -> set to `https://<backend>.onrender.com/oauth/linkedin/callback`
- `FRONTEND_URL` -> your Vercel URL e.g. `https://your-site.vercel.app`
- `gemini__api_key`, etc.

Notes

- Token storage currently uses `services/auth/src/lib/storage.js` which writes to `services/auth/data/tokens.json`. If you deploy to an ephemeral file system without persistence, migrate tokens to a DB or use Render persistent disk.
- The worker is started by requiring `services/worker/src/index.js` and will run the stub interval.
