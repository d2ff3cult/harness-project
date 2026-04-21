# 2026-04-21 Golden Coverage Upgrade Record

## Background
Golden Case documentation covered the service/transport flow, but CI did not execute explicit checks to guarantee confirm, cancel, and source-isolation branches remained present over time. This left room for semantic drift even when schema validation passed.

## Key Implementation Details
1. Added executable Golden coverage gate:
   - New script: `tools/golden-check.mjs`.
   - Validates the following on each run:
     - Golden eval test coverage tags include:
       - `confirm-branch-pass`
       - `cancel-branch-pass`
       - `cancel-branch-fail`
       - `source-isolation-pass`
       - `source-isolation-fail`
     - `specs/pages/order-edit.page-spec.json` contains required acceptance items for confirm/cancel/source-isolation.
     - Golden contract includes both `SERVICE_INFO` and `TRANSPORT_INFO` scopes.
     - `service_info.save` transition has meaningful (non no-op) cancel handling.
     - IntentIR contains explicit source-isolation rule for `TRANSPORT_INFO`.
2. Wired gate into pipeline:
   - Added `pnpm golden:check` command in `package.json`.
   - Inserted `golden:check` into `ci:gate` blocking chain.
3. Updated Golden and spec artifacts:
   - `specs/samples/golden/service-transport.eval-spec.json`
   - `specs/pages/order-edit.page-spec.json`
   - `specs/intent-ir/order-service-transport-sync.intent-ir.json`
4. Expanded skill fixtures:
   - Added `tests/skills/eval-gate/cases/case-6.json` (cancel branch).
   - Added `tests/skills/eval-gate/cases/case-7.json` (source-isolation).
5. Updated command documentation:
   - `README.md` now includes `pnpm golden:check`.

## Verification Evidence
1. `pnpm golden:check`
   - Result: passed.
2. `pnpm spec:validate`
   - Result: passed.
3. `pnpm skills:smoke`
   - Result: passed.
4. `pnpm ci:gate`
   - Result: passed, now including `golden:check`.

## Risks and Follow-ups
1. Coverage enforcement currently relies on tag/acceptance naming conventions; future refactors should update `golden-check` and docs in the same change.
2. `golden-check` validates structural branch coverage, not runtime behavior; if execution-level branch assertions are needed, add scenario-driven integration/e2e checks in a later phase.
