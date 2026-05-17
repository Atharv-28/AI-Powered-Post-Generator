# LinkedIn + AI Post Generation Architecture

## 1) Final stack decisions

### Social platform
- **Platform:** LinkedIn
- **API:** LinkedIn v2 (Posts API)
- **Auth:** OAuth 2.0 (authorization code)

### LLM (drafts)
- **Primary LLM:** **Google Gemini 2.0 Flash** (via Google AI Studio / Gemini API)
- **Why this is optimal for your use case:**
  - Strong quality for short-form captions
  - Low latency for interactive draft/rewrite
  - Easy to scale to paid tier
- **Fallback (optional):** Gemini 1.5 Flash or alternate provider

### Images (preview only)
- **Client-side:** Puter JS `txt2img` for preview image generation
- **Server-side:** Uploads preview image to LinkedIn during publish

---

## 2) Product goals (mapped to your requirement)

1. User signs in with LinkedIn account (OAuth flow works reliably).
2. App fetches recent posts/context from authenticated account (if permitted).
3. User enters topic/prompt.
4. LLM generates draft post(s), user edits if needed.
5. App publishes to LinkedIn and confirms success.
6. System is scalable (modules are independently deployable and horizontally scalable).

---

## 3) Scalable architecture (component view)

```text
[Next.js Frontend]
    |
    v
[API Gateway / BFF]
    |------------------------------|
    |                              |
    v                              v
[Auth Service]                 [Content Service]
 (LinkedIn OAuth)               (Gemini drafts + revise)
    |                              |
    v                              v
[LinkedIn Connector]          [Puter JS (client)]
 (publish + feed)               (image preview)
```

Shared infra (optional):
- Postgres (users, connections, drafts, posts, audit)
- Redis (cache, queue backend, rate-limit counters)
- Object/Blob store (optional logs/artifacts)
- Observability (structured logs, metrics, traces, alerts)

---

## 4) Core modules and responsibilities

## A. Frontend (Next.js/React)
- OAuth connect UI for LinkedIn
- Draft composer (prompt input + generated variants)
- Draft rewrite requests (AI edits)
- Image preview (Puter JS)
- Publish trigger + toast status feedback

## B. API Gateway / BFF
- Single entrypoint for frontend
- Routes requests to internal services
- Response shaping for UI performance

## C. Auth Service
- Handles OAuth start/callback for LinkedIn
- Stores access tokens
- Exposes internal token access API for LinkedIn connector

## D. LinkedIn Connector Service
- Reads recent posts (when permissions allow)
- Publishes posts through LinkedIn Posts API
- Uploads preview image during publish (if provided)
- Keeps LinkedIn-specific logic isolated from product logic

## E. Content Service
- Prompt templates and tone controls
- Calls Gemini for draft generation and rewrite
- Returns multiple candidate drafts

---

## 5) Data model (minimum)

- `users` — app user profile
- `social_connections` — provider (`linkedin`), user_id, token metadata (encrypted)
- `drafts` — prompt, generated_text, selected_version, status
- `posts` — external_post_id, draft_id, publish_status, timestamps
- `events_audit` — auth events, publish events, failures, retries

---

## 6) API contract (starter)

- `GET /api/linkedin/connect` → starts OAuth
- `GET /api/linkedin/callback` → receives OAuth callback
- `GET /api/linkedin/recent-posts` → fetches context posts
- `POST /api/content/generate` → create AI draft(s)
- `POST /api/content/revise` → update a draft with change instructions
- `POST /api/linkedin/publish` → publish selected draft (optional image)

---

## 7) Scalability strategy

1. **Stateless services:** API, content, and connector services remain stateless for easy horizontal autoscaling.
2. **Provider abstraction:** LLM adapter avoids vendor lock-in and supports fallback.
3. **Caching:** Redis caches recent posts/context and prompt templates.
4. **Rate-limit aware design:** per-user and per-app throttle controls.
5. **Observability-first:** metrics on generation latency, publish success rate, token errors, LinkedIn API errors.

---

## 8) Security and reliability essentials

- Encrypt OAuth tokens at rest (KMS-managed keys).
- Never expose raw tokens to frontend.
- Idempotency key on publish endpoint to prevent duplicate posts.
- Strict timeout + retry policy with exponential backoff.

---

## 9) Implementation roadmap

1. **Foundation**
   - Setup Next.js app + API gateway
   - Postgres + Redis + migration framework
2. **OAuth + LinkedIn integration**
   - Connect/callback pipeline
   - Recent-post fetch endpoint
3. **AI generation**
   - Gemini adapter integration
   - Prompt templates + 2-3 draft variants
4. **Publishing pipeline**
   - Publish endpoint + image upload
5. **Production hardening**
   - Metrics, logs, alerts
   - Rate-limit controls and fallback model support

---

## 10) Recommended deployment units

- `web-frontend` (Next.js)
- `api-bff` (gateway routes)
- `svc-auth`
- `svc-content`
- `svc-linkedin-connector`
- `postgres`
- `redis`

This split keeps boundaries clear and lets you scale each bottleneck independently (generation-heavy, publish-heavy, or auth-heavy traffic).

