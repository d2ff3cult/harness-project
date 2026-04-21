# 2026-04-21 Visual Gate Pause Record

## Background
Current iteration priority is to continue functional and pipeline work without visual-gate execution cost and flakiness in CI. The request is to keep visual capabilities available but not enabled by default.

## Key Implementation Details
1. Updated CI workflow (`.github/workflows/ci.yml`):
   - Added job-level env switch: `VISUAL_CI_ENABLED: "false"`.
   - Wrapped visual steps with `if: ${{ env.VISUAL_CI_ENABLED == 'true' }}`:
     - `pnpm visual:install-browsers`
     - `pnpm visual:capture:current`
     - `VISUAL_GATE_MODE=block pnpm visual:regression`
2. Updated developer-facing docs (`README.md`):
   - Marked block-mode visual regression command as manual.
   - Added CI defaults section clarifying visual checks are currently disabled in CI by default.
3. Updated planning status (`AI-Design-to-Code-Evals-First-探索实施计划.md`):
   - Added dated status section (2026-04-21) documenting pause decision and one-step re-enable path.

## Verification Evidence
1. `pnpm review:artifacts`
   - Result: passed.
2. `pnpm ci:gate`
   - Result: passed.
   - CI core gate chain remains active (`spec/design/figma/skills/eval/replay/review`), with visual execution paused by default.

## Risks and Follow-ups
1. Visual regressions may accumulate unnoticed while CI visual checks remain disabled.
2. Re-enable trigger should be explicit:
   - Set `VISUAL_CI_ENABLED` to `true` in CI workflow.
   - Rebaseline intentionally before enabling strict block mode.
3. During pause period, run visual commands manually for high-risk UI changes.
