# 2026-04-19 Figma Pipeline Activation

## Scope
Enable practical `figma-to-design-context` execution with extract/compile commands and gate-level smoke validation.

## Checklist
- [x] Add `figma:extract` command for real Figma API node extraction.
- [x] Add `figma:compile` command to compile extract output into schema-valid `DesignContextSpec`.
- [x] Add deterministic fixture + mapping for `figma:smoke`.
- [x] Wire `figma:smoke` into `ci:gate`.
- [x] Verify `figma:smoke`, `review:artifacts`, and `ci:gate` pass locally.
- [x] Record implementation details and verification evidence.

## Verification
- [x] `pnpm figma:smoke`
- [x] `pnpm review:artifacts`
- [x] `pnpm ci:gate`
