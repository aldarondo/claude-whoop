# claude-whoop

## Project Purpose
MCP server deployed on Synology NAS via Docker. Pulls recovery, sleep, workouts, and daily strain data from the Whoop API. Exposes tools callable by Claude skills.

## Key Commands
```bash
npm install           # install dependencies
npm start             # run locally (stdio mode)
npm test              # run unit tests
node src/authorize.js # interactive OAuth2 flow to get initial tokens
docker compose up -d
docker compose logs -f
```

## Setup
1. Create a Whoop developer app at https://developer-dashboard.whoop.com/
2. Copy `.env.example` → `.env`, fill in WHOOP_CLIENT_ID + WHOOP_CLIENT_SECRET
3. Run `node src/authorize.js` to complete OAuth2 and get initial tokens
4. Tokens auto-refresh on each API call

## Testing Requirements
- Unit tests in `tests/unit/` with Jest unstable_mockModule
- Run before marking any task complete: `npm test`

## After Every Completed Task
- Move task to ✅ Completed in ROADMAP.md with today's date

## Git Rules
- Never create pull requests. Push directly to main.
- solo/auto-push OK

@~/Documents/GitHub/CLAUDE.md
