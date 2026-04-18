import fs from "node:fs";
import path from "node:path";
import {
  compileValidator,
  listJsonFiles,
  readJson,
  rel,
  repoRoot
} from "./lib/validator.mjs";

const root = repoRoot();

const validators = {
  intent: compileValidator(path.join(root, "specs/schemas/intent-ir.schema.json")),
  page: compileValidator(path.join(root, "specs/schemas/page-spec.schema.json")),
  contract: compileValidator(path.join(root, "specs/schemas/contract-spec.schema.json")),
  eval: compileValidator(path.join(root, "specs/schemas/eval-spec.schema.json")),
  design: compileValidator(path.join(root, "design/schemas/design-context.schema.json"))
};

const skillDefs = [
  {
    name: "intent-to-spec",
    minCases: 5,
    validateCase(data) {
      return [
        ["intentIR", validators.intent],
        ["pageSpec", validators.page],
        ["contractSpec", validators.contract],
        ["evalSpec", validators.eval]
      ].flatMap(([key, validator]) => {
        if (!data[key]) return [`missing ${key}`];
        const ok = validator(data[key]);
        return ok ? [] : [`${key} invalid: ${JSON.stringify(validator.errors)}`];
      });
    }
  },
  {
    name: "figma-to-design-context",
    minCases: 5,
    validateCase(data) {
      if (!data.designContext) return ["missing designContext"];
      const ok = validators.design(data.designContext);
      return ok ? [] : [`designContext invalid: ${JSON.stringify(validators.design.errors)}`];
    }
  },
  {
    name: "eval-gate",
    minCases: 5,
    validateCase(data) {
      if (!data.evalSpec) return ["missing evalSpec"];
      const ok = validators.eval(data.evalSpec);
      return ok ? [] : [`evalSpec invalid: ${JSON.stringify(validators.eval.errors)}`];
    }
  }
];

let failed = false;

for (const skill of skillDefs) {
  const skillDir = path.join(root, ".agents/skills", skill.name);
  const requiredFiles = [
    path.join(skillDir, "SKILL.md"),
    path.join(skillDir, "agents/openai.yaml")
  ];
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      failed = true;
      console.error(`[${skill.name}] missing ${rel(file)}`);
    }
  }

  const caseDir = path.join(root, "tests/skills", skill.name, "cases");
  const caseFiles = listJsonFiles(caseDir);
  if (caseFiles.length < skill.minCases) {
    failed = true;
    console.error(`[${skill.name}] expected >=${skill.minCases} cases, got ${caseFiles.length}`);
    continue;
  }

  for (const file of caseFiles) {
    const data = readJson(file);
    const errors = skill.validateCase(data);
    if (errors.length > 0) {
      failed = true;
      console.error(`[${skill.name}] ${rel(file)} failed`);
      for (const err of errors) {
        console.error(`  - ${err}`);
      }
    }
  }

  if (!failed) {
    console.log(`[${skill.name}] OK (cases=${caseFiles.length})`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("skills:smoke passed");
