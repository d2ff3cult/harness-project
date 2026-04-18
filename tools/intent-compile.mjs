import fs from "node:fs";
import path from "node:path";

function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

const inputPath = arg("--input", "specs/intent-card/template.md");
const outputPath = arg("--output", "specs/intent-ir/compiled.intent-ir.json");

const text = fs.existsSync(inputPath) ? fs.readFileSync(inputPath, "utf8") : "";
const inferredId = path.basename(outputPath).replace(/\.intent-ir\.json$/, "") || "compiled";
const lines = text.split("\n").map((v) => v.trim()).filter(Boolean);

const result = {
  intentId: inferredId,
  page: "unknown-page",
  actors: ["operator"],
  actions: ["analyze", "compile"],
  rules: [
    {
      id: "AUTO-1",
      when: "intent.compile",
      then: "produce draft specs"
    }
  ],
  states: ["draft"],
  api: {
    method: "POST",
    endpoint: "/api/intent/compile"
  },
  unknowns: lines.length === 0 ? ["intent_card_missing_content"] : []
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

console.log(`intent:compile wrote ${outputPath}`);
if (result.unknowns.length > 0) {
  console.log(`unknowns=${JSON.stringify(result.unknowns)}`);
}
