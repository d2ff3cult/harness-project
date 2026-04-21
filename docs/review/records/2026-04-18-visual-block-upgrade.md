# 2026-04-18 Visual Block Mode Upgrade Record

## Background
Visual regression had already been wired into CI, but still ran in warning mode and primarily relied on query-parameter snapshots. To meet the next quality bar, CI needs to fail on visual drift and screenshot generation should be driven by explicit interaction steps.

## Key Implementation Details
1. Interaction-driven capture schema:
   - Updated scenario `capture` section to `mode=interaction`.
   - Added per-state action plans (`stateActions`) for `initial`, `editing`, `confirm-modal`, `submitted`.
2. Capture engine enhancements (`tools/visual-capture.mjs`):
   - Added support for two modes:
     - `query-state` (backward compatible)
     - `interaction` (new)
   - Added action executor supporting `click`, `waitForSelector`, `waitForTimeout`.
   - Added strict scenario validation for interaction actions to avoid silent screenshot mismatches.
3. Golden page interaction controls:
   - Converted visual page to client component with deterministic state controls and stable `data-testid` selectors.
   - Added modal/submitted selectors for action synchronization.
4. CI gate upgrade:
   - Changed visual regression step to `VISUAL_GATE_MODE=block`.
   - CI sequence remains: install browser -> capture current -> regression.
5. Capture runtime hardening:
   - Default capture server moved to isolated port `3300` to avoid collisions with local dev sessions on `3000`.
   - Capture now runs `pnpm --filter web build` before auto-starting `pnpm --filter web start ...` for deterministic render output.

## Verification Evidence
1. `pnpm visual:capture:baseline`
   - Result: passed, `captured=8`, `failed=0`.
2. `pnpm visual:capture:current`
   - Result: passed, `captured=8`, `failed=0`.
3. `VISUAL_GATE_MODE=block pnpm visual:regression`
   - Result: passed.
   - Summary: `comparisons=8, passed=8, failed=0, missing=0`.
4. `pnpm review:artifacts`
   - Result: passed (`checklists=3, records=3`).
5. `pnpm ci:gate`
   - Result: passed.

## Risks and Follow-ups
1. Interaction actions depend on stable selectors; UI refactors must preserve or intentionally update `data-testid`.
2. Block mode is stricter and may fail PRs on legitimate UI updates; baseline refresh process must be explicitly documented in each related change record.
