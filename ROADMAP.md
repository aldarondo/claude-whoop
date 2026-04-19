# claude-whoop Roadmap
> Tag key: `[Code]` = Claude Code · `[Cowork]` = Claude Cowork · `[Human]` = Charles must act

## 🔄 In Progress
<!-- nothing active -->

## 🔲 Backlog

### Deployment
- [ ] `[Human]` Create Whoop developer app at https://developer-dashboard.whoop.com/
- [x] `[Code]` 2026-04-19 — Write `src/authorize.js` — interactive OAuth2 PKCE flow (opens browser, captures code, exchanges for tokens, writes .env)
- [ ] `[Human]` Run `node src/authorize.js` to authenticate and populate `.env` tokens
- [x] `[Code]` 2026-04-19 — Updated docker-compose.yml: `node src/serve.js`, `PORT=8770`, removed stdin_open/tty; SSE-ready for NAS deploy
- [x] `[Code]` 2026-04-19 — Deployed to Synology NAS (port 8770, SSE); container running — blocked on `[Human]` completing OAuth2 flow
- [x] `[Code]` 2026-04-19 — Add `claude-whoop` to `config/mcp.json` in brian-telegram (port 8770, SSE); added `src/serve.js` + `src/server.js` factory

### Enhancements
- [x] `[Code]` 2026-04-19 — Store latest recovery in brian-mem on each `get_recovery` call — fire-and-forget via `src/memory.js`; requires `BRIAN_MEM_URL` env var (silently skips if absent)
- [x] `[Code]` 2026-04-19 — Weekly summary tool — average recovery score, sleep performance, top workout by strain for the past 7 days

## ✅ Completed
- [x] 2026-04-19 — Scaffolded: MCP server (get_recovery, get_sleep, get_workouts, get_strain, get_body_measurement), API client, auth module, unit tests

## 🚫 Blocked
<!-- log blockers here -->
