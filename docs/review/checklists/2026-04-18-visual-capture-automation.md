# 2026-04-18 Visual Capture Automation

## Scope
Add automated screenshot capture for Golden visual scenarios and connect it to existing visual regression flow.

## Checklist
- [x] Add Playwright dependency and browser install command.
- [x] Add `visual:capture` scripts for baseline/current output targets.
- [x] Implement capture script to read scenario files and output screenshots to `.evals/visual/<target>/...`.
- [x] Add visual route for `service-transport-order-edit` supporting 4 states by query param.
- [x] Update CI visual flow to run `install-browsers -> capture:current -> regression`.
- [x] Verify capture command can produce screenshots for all configured states and viewports.
- [x] Verify `visual:regression` consumes captured outputs and reports pass/fail.
- [x] Record verification evidence and follow-up risks.

## Verification
- [x] `pnpm visual:install-browsers`
- [x] `pnpm visual:capture:current`
- [x] `pnpm visual:capture:baseline`
- [x] `pnpm visual:regression`
- [x] `pnpm review:artifacts`
