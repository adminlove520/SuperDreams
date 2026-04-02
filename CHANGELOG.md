# Changelog

All notable changes will be documented in this file.

## [4.0.0] - 2026-04-02
## [4.0.0] - 2026-04-02

### Skills
- SKILL updates
### Architecture
- Architecture improvements



### Breaking Changes
- **Renamed**: xiaoxi-dreams → SuperDreams (超梦)
- **Restructured**: `web/` → `agent/`, `superdream-center/` → `center/`
- **Storage**: Switched from JSON files to SQLite (sql.js for agent, better-sqlite3 for center)
- **Archived**: `superdream/` Express server merged into `agent/` Next.js

### Added
- `agent/lib/db.ts` — SQLite database layer with Vercel-compatible `/tmp` fallback
- `agent/lib/dream-engine.ts` — Real dream engine (scan→extract→deduplicate→score→report)
- `agent/lib/health.ts` — Data-driven five-dimension health calculator
- `agent/app/api/sync/route.ts` — Agent→Center sync endpoint
- `agent/app/api/memories/[id]/route.ts` — PUT method for memory updates
- `agent/app/api/health/route.ts` — Health history support (?history=true&days=30)
- `center/lib/auth.ts` — Fixed JWT auth (now signs both agentId AND apiKey)
- `center/lib/db.ts` — Added `jwt_secret` column to agents table
- SuperDreams branding across all UI and documentation

### Fixed
- JWT auth bug: `generateToken` now includes `apiKey` in payload
- Control Center auth middleware properly handles both Bearer JWT and ApiKey headers
- Sync routes now use proper auth middleware
- All API endpoints verified working (no 404s)
- Removed dead `lib/api.ts` (wrong types, wrong base URL, wrong endpoints)
- Removed unused `swr` dependency

### Architecture
- Two-tier system: Agent (龙虾) + Control Center (中枢)
- Agent: Next.js 14 + SQLite for individual agent dashboards
- Center: Next.js 14 + SQLite for multi-agent management
- SQLite per-user: fork-friendly, each user gets their own database
