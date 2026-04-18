import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

export function repoRoot() {
  return process.cwd();
}

export function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

export function listJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && full.endsWith(".json")) {
        out.push(full);
      }
    }
  };
  walk(dirPath);
  return out.sort();
}

export function compileValidator(schemaPath) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const schema = readJson(schemaPath);
  return ajv.compile(schema);
}

export function rel(filePath) {
  return path.relative(repoRoot(), filePath);
}

export function validateFiles({ validator, files, expectedValid }) {
  const failures = [];
  for (const file of files) {
    const data = readJson(file);
    const valid = validator(data);
    if (valid !== expectedValid) {
      failures.push({ file, errors: validator.errors || [] });
    }
  }
  return failures;
}

export function assertFilesExist(files) {
  const missing = files.filter((f) => !fs.existsSync(f));
  if (missing.length > 0) {
    throw new Error(`Missing files:\n${missing.join("\n")}`);
  }
}

export function collectUnknownViolations(files) {
  const violations = [];
  for (const file of files) {
    const data = readJson(file);
    if (Array.isArray(data.unknowns) && data.unknowns.length > 0) {
      violations.push({ file, unknowns: data.unknowns });
    }
  }
  return violations;
}
