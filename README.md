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
2. `pnpm spec:validate`
3. `pnpm design:validate`
4. `pnpm skills:smoke`
5. `pnpm eval:run`
6. `pnpm replay:check`
7. `pnpm ci:gate`

## Key Directories
1. `specs/schemas/` - executable schemas for IntentIR/Page/Contract/Eval.
2. `design/schemas/` - DesignContext schema.
3. `specs/samples/` - pass/fail and golden samples.
4. `.agents/skills/` - project private skills.
5. `tests/skills/` - skill regression cases.
6. `.gen/manifest/` and `.evals/reports/` - replay and gate artifacts.
