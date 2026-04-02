# Changelog

All notable changes will be documented in this file.

## [4.0.0] - 2026-04-02

### Breaking Changes
- **Renamed**: xiaoxi-dreams → SuperDreams (超梦)
- **Restructured**: `agent/` (from `web/`), `center/` (from `superdream-center/`)
- **Storage**: Switched from JSON files to SQLite (sql.js for agent, better-sqlite3 for center)
- **Archived**: `superdream/` Express server merged into `agent/` Next.js
- **Branding**: Full rebranding to SuperDreams (超梦) across all UI and docs

### Added
- `agent/lib/db.ts` — SQLite database layer with Vercel-compatible `/tmp` fallback
- `agent/lib/dream-engine.ts` — Real dream engine (scan→extract→deduplicate→score→report)
- `agent/lib/health.ts` — Data-driven five-dimension health calculator
- `agent/app/api/sync/route.ts` — Agent→Center sync endpoint
- `agent/app/api/memories/[id]/route.ts` — PUT method for memory updates
- `agent/app/api/health/route.ts` — Health history support (?history=true&days=30)
- `center/lib/auth.ts` — Fixed JWT auth (now signs both agentId AND apiKey)
- `center/lib/db.ts` — Added `jwt_secret` column to agents table

### Fixed
- JWT auth bug: `generateToken` now includes `apiKey` in payload
- Control Center auth middleware properly handles both Bearer JWT and ApiKey headers
- Sync routes now use proper auth middleware
- All API endpoints verified working (no 404s)
- Removed dead `lib/api.ts` (wrong types, wrong base URL, wrong endpoints)
- Removed unused `swr` dependency
- Fixed Next.js 14.2+ `serverExternalPackages` config warning
- Fixed Vercel 500 error due to case-sensitive pathing and WASM loading issues
