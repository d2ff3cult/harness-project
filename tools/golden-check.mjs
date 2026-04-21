import fs from "node:fs";
import path from "node:path";
import { readJson, repoRoot, rel } from "./lib/validator.mjs";

const root = repoRoot();

const files = {
  evalSpec: path.join(root, "specs/samples/golden/service-transport.eval-spec.json"),
  pageSpec: path.join(root, "specs/pages/order-edit.page-spec.json"),
  contractSpec: path.join(root, "specs/samples/golden/service-transport.contract-spec.json"),
  intentIR: path.join(root, "specs/intent-ir/order-service-transport-sync.intent-ir.json")
};

const requiredCoverageTags = [
  "confirm-branch-pass",
  "cancel-branch-pass",
  "cancel-branch-fail",
  "source-isolation-pass",
  "source-isolation-fail"
];

const requiredAcceptance = [
  "confirm_branch_deletes_linked_service_origin_records",
  "cancel_branch_keeps_service_selection_and_records",
  "source_isolation_transport_origin_changes_do_not_sync_back"
];

function mustExist(filePath, failures) {
  if (!fs.existsSync(filePath)) {
    failures.push(`missing required file: ${rel(filePath)}`);
  }
}

function main() {
  const failures = [];

  Object.values(files).forEach((filePath) => mustExist(filePath, failures));
  if (failures.length > 0) {
    console.error("golden:check failed");
    failures.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }

  const evalSpec = readJson(files.evalSpec);
  const pageSpec = readJson(files.pageSpec);
  const contractSpec = readJson(files.contractSpec);
  const intentIR = readJson(files.intentIR);

  const seenTags = new Set(
    (evalSpec.testCases || []).flatMap((testCase) =>
      Array.isArray(testCase.tags) ? testCase.tags : []
    )
  );
  requiredCoverageTags.forEach((tag) => {
    if (!seenTags.has(tag)) {
      failures.push(`golden eval coverage missing tag: ${tag}`);
    }
  });

  const acceptance = Array.isArray(pageSpec.acceptance) ? pageSpec.acceptance : [];
  requiredAcceptance.forEach((item) => {
    if (!acceptance.includes(item)) {
      failures.push(`page acceptance missing item: ${item}`);
    }
  });

  const transitions = Array.isArray(contractSpec.transitions) ? contractSpec.transitions : [];
  const scopes = new Set(transitions.map((item) => item.sourceScope).filter(Boolean));
  if (!scopes.has("SERVICE_INFO")) {
    failures.push("contract transitions missing sourceScope=SERVICE_INFO");
  }
  if (!scopes.has("TRANSPORT_INFO")) {
    failures.push("contract transitions missing sourceScope=TRANSPORT_INFO");
  }

  const serviceSaveTransition = transitions.find(
    (item) => item.when === "service_info.save" && item.sourceScope === "SERVICE_INFO"
  );
  if (!serviceSaveTransition) {
    failures.push("contract transitions missing service_info.save for SERVICE_INFO");
  } else {
    const cancelSteps = Array.isArray(serviceSaveTransition.onCancel)
      ? serviceSaveTransition.onCancel
      : [];
    const hasMeaningfulCancel = cancelSteps.some(
      (step) => typeof step === "string" && step.trim().toLowerCase() !== "no-op"
    );
    if (!hasMeaningfulCancel) {
      failures.push("service_info.save transition must include non-no-op cancel handling");
    }
  }

  const intentRules = Array.isArray(intentIR.rules) ? intentIR.rules : [];
  const hasSourceIsolationRule = intentRules.some(
    (rule) =>
      typeof rule.when === "string" &&
      rule.when.includes("source==TRANSPORT_INFO") &&
      typeof rule.then === "string" &&
      rule.then.includes("do not sync")
  );
  if (!hasSourceIsolationRule) {
    failures.push("intent rules missing explicit source-isolation rule for TRANSPORT_INFO");
  }

  if (failures.length > 0) {
    console.error("golden:check failed");
    failures.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }

  console.log(
    `golden:check passed (coverageTags=${requiredCoverageTags.length}, acceptance=${requiredAcceptance.length})`
  );
}

main();
