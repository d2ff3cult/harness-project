import fs from "node:fs";
import path from "node:path";
import { rel, repoRoot } from "./lib/validator.mjs";

const root = repoRoot();
const checklistDir = path.join(root, "docs/review/checklists");
const recordDir = path.join(root, "docs/review/records");

function walkMarkdownFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && full.endsWith(".md")) {
        out.push(full);
      }
    }
  };
  walk(dirPath);
  return out.sort();
}

function assertHeadings({ file, content, headings }) {
  const missing = headings.filter((h) => !content.includes(h));
  return missing.map((h) => `${rel(file)} missing heading: ${h}`);
}

function main() {
  const failures = [];

  const checklistFiles = walkMarkdownFiles(checklistDir);
  if (checklistFiles.length === 0) {
    failures.push(`No checklist files found in ${rel(checklistDir)}`);
  }

  for (const file of checklistFiles) {
    const content = fs.readFileSync(file, "utf8");
    failures.push(
      ...assertHeadings({
        file,
        content,
        headings: ["## Scope", "## Checklist", "## Verification"]
      })
    );
    if (!/\[[xX]\]/.test(content)) {
      failures.push(`${rel(file)} must include at least one completed checklist item ([x])`);
    }
  }

  const recordFiles = walkMarkdownFiles(recordDir);
  if (recordFiles.length === 0) {
    failures.push(`No review record files found in ${rel(recordDir)}`);
  }

  for (const file of recordFiles) {
    const content = fs.readFileSync(file, "utf8");
    failures.push(
      ...assertHeadings({
        file,
        content,
        headings: [
          "## Background",
          "## Key Implementation Details",
          "## Verification Evidence",
          "## Risks and Follow-ups"
        ]
      })
    );
  }

  if (failures.length > 0) {
    console.error("review:artifacts failed");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    `review:artifacts passed (checklists=${checklistFiles.length}, records=${recordFiles.length})`
  );
}

main();
