# eval-gate

## Purpose
Compile acceptance criteria into executable eval gate rules and required reports.

## Inputs
1. ContractSpec
2. PageSpec
3. Acceptance criteria list

## Outputs
1. `specs/evals/*.json`
2. `.evals/reports/*.json` contract requirement

## Output Contract
1. Output must pass `specs/schemas/eval-spec.schema.json`.
2. Unknown decisions must be recorded in `unknowns`.
3. High-risk flows require explicit confirm/cancel coverage in testCases.

## Error Format
```json
{
  "code": "EVAL_GATE_BLOCKED",
  "reason": "missing_high_risk_assertion",
  "missing": ["cancel_branch_assertion"],
  "suggestion": "补充确认弹窗取消路径断言"
}
```
