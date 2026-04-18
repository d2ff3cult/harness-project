import path from "node:path";
import {
  compileValidator,
  listJsonFiles,
  rel,
  validateFiles,
  repoRoot
} from "./lib/validator.mjs";

const root = repoRoot();
const validator = compileValidator(path.join(root, "design/schemas/design-context.schema.json"));

const targetFiles = listJsonFiles(path.join(root, "design/context"));
const passFiles = listJsonFiles(path.join(root, "specs/samples/design-context/pass"));
const failFiles = listJsonFiles(path.join(root, "specs/samples/design-context/fail"));

const failures = [
  ...validateFiles({ validator, files: targetFiles, expectedValid: true }),
  ...validateFiles({ validator, files: passFiles, expectedValid: true }),
  ...validateFiles({ validator, files: failFiles, expectedValid: false })
];

if (failures.length > 0) {
  console.error("design:validate failed");
  for (const item of failures) {
    console.error(`- ${rel(item.file)}`);
    if (item.errors.length > 0) {
      console.error(`  errors: ${JSON.stringify(item.errors)}`);
    }
  }
  process.exit(1);
}

console.log(`design:validate passed (targets=${targetFiles.length}, pass=${passFiles.length}, fail=${failFiles.length})`);
