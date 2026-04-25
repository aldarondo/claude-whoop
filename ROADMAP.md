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

### Build & Infrastructure
- [ ] `[Code]` Add GHCR build-push workflow — migrate container from `node:20-alpine` to a versioned GHCR image (`ghcr.io/aldarondo/...`) with GitHub Actions auto-deploy
- [ ] `[Code]` Add weekly scheduled rebuild — GitHub Actions `schedule: cron` to repull and push a fresh image every week, picking up base-image security patches

### Enhancements
- [x] `[Code]` 2026-04-19 — Store latest recovery in brian-mem on each `get_recovery` call — fire-and-forget via `src/memory.js`; requires `BRIAN_MEM_URL` env var (silently skips if absent)
- [x] `[Code]` 2026-04-19 — Weekly summary tool — average recovery score, sleep performance, top workout by strain for the past 7 days

## ✅ Completed
- [x] 2026-04-19 — Scaffolded: MCP server (get_recovery, get_sleep, get_workouts, get_strain, get_body_measurement), API client, auth module, unit tests

## 🚫 Blocked
- ❌ [docker-monitor:deploy-failed] GitHub Actions deploy failed (run #24920104259) — https://github.com/aldarondo/claude-whoop/actions/runs/24920104259 — 2026-04-25 08:00 UTC

- ❌ [docker-monitor:no-ghcr-image] Container `claude-whoop` uses `node:20-alpine` — migrate to `ghcr.io/aldarondo/...` with a GitHub Actions build-push workflow — 2026-04-23 08:00 UTC
<!-- log blockers here -->
