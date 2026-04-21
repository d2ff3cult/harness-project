# harness-project

Structured-input + skills driven SDLC scaffold.

## Fullstack Apps (Initialized)
1. `apps/web` - Next.js frontend
2. `apps/api` - NestJS backend + Prisma
3. Database - Remote MySQL via `apps/api/.env` `DATABASE_URL`

## Quick Start
1. `pnpm install`
2. `pnpm db:generate`
3. `pnpm dev`

Health check:
1. API: `http://localhost:3001/health`
2. Web: `http://localhost:3000`

## Commands
1. `pnpm intent:compile`
2. `pnpm figma:extract` (requires `FIGMA_TOKEN`, `FIGMA_FILE_KEY`, `FIGMA_NODE_IDS`)
3. `pnpm figma:compile`
4. `pnpm figma:smoke`
5. `pnpm spec:validate`
6. `pnpm design:validate`
7. `pnpm skills:smoke`
8. `pnpm eval:run`
9. `pnpm replay:check`
10. `pnpm review:artifacts`
11. `pnpm visual:install-browsers`
12. `pnpm visual:capture:current`
13. `pnpm visual:capture:baseline`
14. `pnpm visual:regression`
15. `pnpm ci:gate`
16. `VISUAL_GATE_MODE=block pnpm visual:regression` (manual)

Visual capture defaults:
1. Uses isolated `http://127.0.0.1:3300`.
2. Runs `web build` before starting `web start` for deterministic screenshots.

CI defaults:
1. `pnpm ci:gate` remains blocking in CI.
2. Visual capture/regression steps are currently disabled in CI by default and are run manually when needed.

## Key Directories
1. `specs/schemas/` - executable schemas for IntentIR/Page/Contract/Eval.
2. `design/schemas/` - DesignContext schema.
3. `specs/samples/` - pass/fail and golden samples.
4. `design/mappings/` - figma node to component mapping rules.
5. `.agents/skills/` - project private skills.
6. `tests/skills/` - skill regression cases.
7. `tests/visual/` and `.evals/visual/` - visual regression scenarios and artifacts.
8. `docs/review/` - change checklist and implementation review records.
9. `.gen/manifest/` and `.evals/reports/` - replay and gate artifacts.
