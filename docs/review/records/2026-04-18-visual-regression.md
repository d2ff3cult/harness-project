# 2026-04-18 Visual Regression & Review Governance Record

## Background
Project plan entered P5 ("visual regression integration and gate upgrade"), while the repository still lacked `visual:regression` command, visual scenario/threshold assets, and explicit review artifacts for later audit.

## Key Implementation Details
1. Added `tools/visual-regression.mjs`:
   - Loads scenario files from `tests/visual/scenarios/*.visual-spec.json`.
   - Loads threshold policy from `tests/visual/thresholds.json`.
   - Compares baseline/current PNG pairs using `pixelmatch` + `pngjs`.
   - Emits report to `.evals/visual/latest.json` with pass/fail/missing breakdown.
   - Supports `VISUAL_GATE_MODE=warn|block`:
     - `warn`: non-blocking with warnings.
     - `block`: fail on diff/missing/coverage issues.
2. Added initial Golden Case scenario and threshold policy:
   - Scenario: `service-transport-order-edit`.
   - Required viewports: desktop + mobile.
   - Required states: initial/editing/confirm-modal/submitted.
   - Versioned threshold overrides for key states.
3. Added review governance enforcement:
   - New command `pnpm review:artifacts` (`tools/review-artifacts-check.mjs`).
   - Gate checks required sections in checklist and record docs.
   - `ci:gate` now includes `review:artifacts`.
4. CI pipeline update:
   - `pnpm ci:gate` remains blocking.
   - `VISUAL_GATE_MODE=warn pnpm visual:regression` runs as non-blocking warning step.

## Verification Evidence
1. `pnpm review:artifacts`
   - Result: `passed (checklists=1, records=1)`
2. `pnpm visual:regression`
   - Result: command passed in `warn` mode.
   - Report: `.evals/visual/latest.json`
   - Summary: `comparisons=8, missing=8, failed=0` (expected before baseline/current screenshots are generated)
3. `pnpm ci:gate`
   - Result: passed.
   - Included checks: `spec:validate`, `design:validate`, `skills:smoke`, `eval:run`, `replay:check`, `review:artifacts`.

## Risks and Follow-ups
1. Visual comparison currently depends on pre-generated baseline/current screenshots; missing files are warnings in warn mode.
2. After baseline noise cleanup (planned two iterations), switch CI mode to `VISUAL_GATE_MODE=block`.
3. Add Playwright screenshot capture task to produce current images automatically before diffing.
