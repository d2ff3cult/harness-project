# 2026-04-19 Figma Pipeline Activation Record

## Background
`figma-to-design-context` existed as a skill definition and schema regression target, but there was no executable extraction/compile command pair to run it as an actual pipeline.

## Key Implementation Details
1. Added extraction command (`tools/figma-extract.mjs`):
   - Pulls node payload from Figma API (`/v1/files/{fileKey}/nodes?ids=...`).
   - Normalizes response into flat node list for compile stage.
   - Uses required env/args: `FIGMA_TOKEN`, `FIGMA_FILE_KEY`, `FIGMA_NODE_IDS`.
2. Added compile command (`tools/figma-compile.mjs`):
   - Reads normalized extract + mapping rules.
   - Resolves node/component mappings via ordered rules.
   - Emits structured blocked error when mapping is missing (strict mode default):
     - `code=DESIGN_CONTEXT_BLOCKED`
     - `reason=unknown_component_mapping`
   - Produces `DesignContextSpec` and validates against `design-context.schema.json`.
3. Added mapping and fixture assets:
   - `design/mappings/figma-component-map.json`
   - `specs/samples/figma/sample-extract.json`
4. Added runnable commands and gate integration:
   - `figma:extract`
   - `figma:compile`
   - `figma:smoke`
   - `ci:gate` now includes `figma:smoke`.

## Verification Evidence
1. `pnpm figma:smoke`
   - Result: passed.
   - Output: `.gen/figma/smoke.design-context.json` (`componentMappings=3`, `unknowns=[]`).
2. `pnpm review:artifacts`
   - Result: passed (`checklists=4`, `records=4`).
3. `pnpm ci:gate`
   - Result: passed.
   - Includes `figma:smoke` in blocking chain.

## Risks and Follow-ups
1. Figma node ID drift will trigger compile blocking until mapping rules are updated.
2. Current extractor focuses on node metadata for deterministic compile; richer token/text extraction can be added later if design-token sync depth increases.
