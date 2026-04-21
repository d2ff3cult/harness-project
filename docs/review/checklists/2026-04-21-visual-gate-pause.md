# 2026-04-21 Visual Gate Pause Checklist

## Scope
- [x] Pause visual capture/regression execution in CI by default.
- [x] Keep visual tooling and manual run path available.
- [x] Update project docs to reflect temporary CI policy.

## Checklist
- [x] Add CI-level switch (`VISUAL_CI_ENABLED`) defaulting to `false`.
- [x] Guard visual workflow steps with conditional execution.
- [x] Update `README.md` with current CI default behavior.
- [x] Update implementation plan status with concrete date and re-enable path.

## Verification
- [x] `pnpm review:artifacts`
- [x] `pnpm ci:gate`
