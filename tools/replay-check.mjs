import path from "node:path";
import {
  compileValidator,
  readJson,
  repoRoot,
  rel
} from "./lib/validator.mjs";

const root = repoRoot();
const schemaPath = path.join(root, ".gen/manifest/manifest.schema.json");
const latestPath = path.join(root, ".gen/manifest/latest.json");
const baselinePath = path.join(root, ".gen/manifest/baseline.json");

const validator = compileValidator(schemaPath);
const latest = readJson(latestPath);
const baseline = readJson(baselinePath);

for (const [name, data, file] of [
  ["latest", latest, latestPath],
  ["baseline", baseline, baselinePath]
]) {
  const ok = validator(data);
  if (!ok) {
    console.error(`replay:check blocked: ${name} invalid (${rel(file)})`);
    console.error(JSON.stringify(validator.errors));
    process.exit(1);
  }
}

const fingerprintKeys = ["specHash", "designContextHash", "templateVersion", "lockfileHash"];
const sameFingerprint = fingerprintKeys.every((k) => latest[k] === baseline[k]);

if (sameFingerprint && latest.outputsHash !== baseline.outputsHash) {
  console.error("replay:check blocked: same fingerprint but outputsHash changed");
  process.exit(1);
}

console.log("replay:check passed");
