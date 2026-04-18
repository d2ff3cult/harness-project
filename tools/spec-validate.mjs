import path from "node:path";
import {
  compileValidator,
  listJsonFiles,
  rel,
  validateFiles,
  repoRoot
} from "./lib/validator.mjs";

const root = repoRoot();

const suites = [
  {
    name: "IntentIR",
    schema: path.join(root, "specs/schemas/intent-ir.schema.json"),
    targets: [path.join(root, "specs/intent-ir")],
    passDir: path.join(root, "specs/samples/intent-ir/pass"),
    failDir: path.join(root, "specs/samples/intent-ir/fail")
  },
  {
    name: "PageSpec",
    schema: path.join(root, "specs/schemas/page-spec.schema.json"),
    targets: [path.join(root, "specs/pages")],
    passDir: path.join(root, "specs/samples/page-spec/pass"),
    failDir: path.join(root, "specs/samples/page-spec/fail")
  },
  {
    name: "ContractSpec",
    schema: path.join(root, "specs/schemas/contract-spec.schema.json"),
    targets: [path.join(root, "specs/contracts"), path.join(root, "specs/samples/golden")],
    passDir: path.join(root, "specs/samples/contract-spec/pass"),
    failDir: path.join(root, "specs/samples/contract-spec/fail")
  },
  {
    name: "EvalSpec",
    schema: path.join(root, "specs/schemas/eval-spec.schema.json"),
    targets: [path.join(root, "specs/evals"), path.join(root, "specs/samples/golden")],
    passDir: path.join(root, "specs/samples/eval-spec/pass"),
    failDir: path.join(root, "specs/samples/eval-spec/fail")
  }
];

let failed = false;

for (const suite of suites) {
  const validator = compileValidator(suite.schema);

  const targetFiles = suite.targets.flatMap((dir) =>
    listJsonFiles(dir).filter((f) => {
      if (suite.name === "ContractSpec") return f.endsWith(".contract-spec.json");
      if (suite.name === "EvalSpec") return f.endsWith(".eval-spec.json");
      if (suite.name === "PageSpec") return f.endsWith(".page-spec.json");
      if (suite.name === "IntentIR") return f.endsWith(".intent-ir.json");
      return true;
    })
  );

  const passFiles = listJsonFiles(suite.passDir);
  const failFiles = listJsonFiles(suite.failDir);

  const targetFailures = validateFiles({ validator, files: targetFiles, expectedValid: true });
  const passFailures = validateFiles({ validator, files: passFiles, expectedValid: true });
  const failFailures = validateFiles({ validator, files: failFiles, expectedValid: false });

  const suiteFailures = [...targetFailures, ...passFailures, ...failFailures];
  if (suiteFailures.length > 0) {
    failed = true;
    console.error(`\n[${suite.name}] validation failed:`);
    for (const item of suiteFailures) {
      console.error(`- ${rel(item.file)}`);
      if (item.errors.length > 0) {
        console.error(`  errors: ${JSON.stringify(item.errors)}`);
      }
    }
  } else {
    console.log(`[${suite.name}] OK (targets=${targetFiles.length}, pass=${passFiles.length}, fail=${failFiles.length})`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("spec:validate passed");
