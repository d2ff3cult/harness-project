# intent-to-spec

## Purpose
Compile natural language intent + Intent Card into structured `IntentIR + PageSpec + ContractSpec + EvalSpec` draft.

## Inputs
1. Natural language requirement text
2. `specs/intent-card/*.md` card

## Outputs
1. `specs/intent-ir/*.json`
2. `specs/pages/*.json`
3. `specs/contracts/*.json`
4. `specs/evals/*.json`

## Output Contract
1. Output must pass schema validation in `specs/schemas/*.json`.
2. `unknowns` must be explicit and never guessed away.
3. Missing decisions must return structured error payload.

## Error Format
```json
{
  "code": "INTENT_COMPILE_BLOCKED",
  "reason": "missing_required_decision",
  "missing": ["permission_model"],
  "suggestion": "补充权限口径后重试"
}
```
