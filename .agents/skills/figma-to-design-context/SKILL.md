# figma-to-design-context

## Purpose
Transform Figma extraction into `DesignContextSpec` for deterministic UI generation.

## Inputs
1. Figma extracted node metadata
2. Design system mapping table

## Outputs
1. `design/context/*.json`

## Output Contract
1. Output must pass `design/schemas/design-context.schema.json`.
2. Component mapping must use `DESIGN_SYSTEM` or `CUSTOM` source.
3. Output must include `a11yRequirements` and `interactionModel`.

## Error Format
```json
{
  "code": "DESIGN_CONTEXT_BLOCKED",
  "reason": "unknown_component_mapping",
  "missing": ["FigmaNode#12:54"],
  "suggestion": "补充组件映射或标记为CUSTOM"
}
```
