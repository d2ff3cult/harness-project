# 2026-04-18 Visual Capture Automation Record

## Background
Visual regression existed, but screenshots still needed manual preparation. This created a recurring gap for baseline/current artifact generation and slowed review loops.

## Key Implementation Details
1. Added Playwright-based capture tool: `tools/visual-capture.mjs`.
   - Reads `tests/visual/scenarios/*.visual-spec.json`.
   - Supports output target switch via `VISUAL_CAPTURE_TARGET=baseline|current`.
   - Captures by state and viewport, writing to `.evals/visual/<target>/<scenario>/<viewport>/<state>.png`.
   - Auto-starts local Next server by default when `VISUAL_BASE_URL` is unavailable.
   - Writes run summary to `.evals/visual/capture.latest.json`.
2. Added package scripts:
   - `visual:install-browsers`
   - `visual:capture`
   - `visual:capture:current`
   - `visual:capture:baseline`
3. Added Golden visual route:
   - `/visual/service-transport-order-edit?state=<initial|editing|confirm-modal|submitted>`
   - Route includes deterministic layout and `data-visual-ready="true"` marker for capture readiness.
4. Updated scenario metadata:
   - Added `routePath` and `stateParam` so capture command can resolve URLs without hardcoded conventions.
5. Artifact strategy:
   - Keep `baseline` screenshots versioned in repo.
   - Treat `current`, `diff`, and run reports as ephemeral outputs (ignored via `.gitignore`).
6. CI visual workflow upgrade:
   - Add browser install and current screenshot capture before regression step.
   - Sequence in CI: `visual:install-browsers` -> `visual:capture:current` -> `VISUAL_GATE_MODE=warn visual:regression`.

## Verification Evidence
1. `pnpm visual:install-browsers`
   - Result: passed; Chromium/ffmpeg/headless-shell downloaded to local Playwright cache.
2. `pnpm visual:capture:current`
   - Result: passed; captured 8 screenshots.
3. `pnpm visual:capture:baseline`
   - Result: passed; captured 8 screenshots.
4. `pnpm visual:regression`
   - Result: passed.
   - Report: `.evals/visual/latest.json`
   - Summary: `comparisons=8, passed=8, failed=0, missing=0`.
5. `pnpm review:artifacts`
   - Result: passed (`checklists=2, records=2`).

## Risks and Follow-ups
1. Playwright browser binaries may be missing in fresh environments; `visual:install-browsers` must be run at least once.
2. Capture script currently uses page-level query state rather than user interactions; later iterations can add scripted interactions to cover richer transitions.
3. If visual route changes significantly, scenario thresholds should be rebaselined intentionally and documented in review records.
