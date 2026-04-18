import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { collectUnknownViolations, listJsonFiles, rel, repoRoot } from "./lib/validator.mjs";

const root = repoRoot();

const requiredCommands = ["spec:validate", "design:validate", "skills:smoke"];
for (const cmd of requiredCommands) {
  const run = spawnSync("pnpm", [cmd], { stdio: "inherit" });
  if (run.status !== 0) {
    console.error(`eval:run blocked by ${cmd}`);
    process.exit(run.status || 1);
  }
}

const unknownFiles = [
  ...listJsonFiles(path.join(root, "specs/intent-ir")),
  ...listJsonFiles(path.join(root, "specs/pages")),
  ...listJsonFiles(path.join(root, "specs/contracts")),
  ...listJsonFiles(path.join(root, "specs/evals")),
  ...listJsonFiles(path.join(root, "design/context"))
];

const violations = collectUnknownViolations(unknownFiles);
if (violations.length > 0) {
  console.error("eval:run blocked because unknowns is not empty:");
  for (const item of violations) {
    console.error(`- ${rel(item.file)} => ${JSON.stringify(item.unknowns)}`);
  }
  process.exit(1);
}

const manifestPath = path.join(root, ".gen/manifest/latest.json");
const reportPath = path.join(root, ".evals/reports/latest.json");

if (!fs.existsSync(manifestPath) || !fs.existsSync(reportPath)) {
  console.error("eval:run blocked: manifest/report missing");
  console.error(`manifest exists=${fs.existsSync(manifestPath)}`);
  console.error(`report exists=${fs.existsSync(reportPath)}`);
  process.exit(1);
}

console.log("eval:run passed");
