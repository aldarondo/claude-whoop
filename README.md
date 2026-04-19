# claude-whoop

MCP server deployed on Synology NAS via Docker. Pulls recovery scores, sleep, workouts, and daily strain from the Whoop API. Exposes tools callable by Claude skills.

## Features
- Get recovery score and HRV for any date
- Get sleep performance and duration metrics
- List recent workouts with strain scores
- Weekly summary (avg recovery, sleep, top workout)
- Stores latest recovery in brian-mem (fire-and-forget)
- OAuth2 PKCE flow with auto-refresh tokens

## Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| MCP SDK | @modelcontextprotocol/sdk |
| HTTP | axios |
| Auth | OAuth2 PKCE (auto-refresh) |
| Container | Docker Compose |
| Memory store | brian-mem (optional) |

## Getting Started

```bash
npm install

# Copy and fill env vars
cp .env.example .env   # set WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET

# Complete OAuth2 flow (one-time)
node src/authorize.js

# Run locally (stdio mode)
npm start

# Run tests
npm test

# Deploy on NAS
docker compose up -d
docker compose logs -f
```

## Setup

1. Create a Whoop developer app at https://developer-dashboard.whoop.com/
2. Copy `.env.example` → `.env`, fill in `WHOOP_CLIENT_ID` + `WHOOP_CLIENT_SECRET`
3. Run `node src/authorize.js` to complete OAuth2 and populate tokens
4. Tokens auto-refresh on each API call

## Project Status
Active development. See [ROADMAP.md](ROADMAP.md) for what's planned.

---
**Publisher:** Xity Software, LLC
