# 2026-04-18 Visual Block Mode Upgrade

## Scope
Upgrade visual pipeline from warn to block mode and add interaction-driven capture actions so screenshots are generated from deterministic UI operations.

## Checklist
- [x] Extend scenario config with `capture.mode=interaction` and per-state action steps.
- [x] Extend `tools/visual-capture.mjs` to execute action steps (`click`, `waitForSelector`, `waitForTimeout`).
- [x] Update Golden visual page with deterministic test controls and selectors.
- [x] Switch CI visual regression from warn mode to block mode.
- [x] Refresh visual baseline and validate block-mode regression.
- [x] Record verification evidence and follow-up risks.

## Verification
- [x] `pnpm visual:capture:baseline`
- [x] `pnpm visual:capture:current`
- [x] `VISUAL_GATE_MODE=block pnpm visual:regression`
- [x] `pnpm review:artifacts`
- [x] `pnpm ci:gate`
