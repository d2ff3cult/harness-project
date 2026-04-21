# 2026-04-21 Golden Coverage Upgrade Checklist

## Scope
- [x] Add executable gate checks for Golden Case coverage (confirm/cancel/source-isolation).
- [x] Align IntentIR/PageSpec/Golden EvalSpec with explicit cancel and source-isolation semantics.
- [x] Extend skill smoke fixtures for eval-gate around cancel/source-isolation.

## Checklist
- [x] Add `tools/golden-check.mjs`.
- [x] Add `golden:check` script and wire it into `ci:gate`.
- [x] Add required Golden eval coverage tags (confirm/cancel/source-isolation pass/fail).
- [x] Update page acceptance criteria for cancel and source-isolation.
- [x] Add IntentIR source-isolation rule for `TRANSPORT_INFO`.
- [x] Add `tests/skills/eval-gate/cases/case-6.json` and `case-7.json`.

## Verification
- [x] `pnpm golden:check`
- [x] `pnpm spec:validate`
- [x] `pnpm skills:smoke`
- [x] `pnpm ci:gate`
