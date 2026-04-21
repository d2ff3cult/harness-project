import fs from "node:fs";
import path from "node:path";
import { compileValidator, readJson, repoRoot } from "./lib/validator.mjs";

function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function sanitizeComponentName(name, fallbackId) {
  const base = String(name || "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  if (base.length > 0) return `Figma${base}`;
  return `FigmaNode${String(fallbackId || "Unknown").replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function normalizeNodes(input) {
  if (Array.isArray(input?.nodes)) {
    return input.nodes.map((node) => ({
      id: String(node.id || ""),
      name: String(node.name || "Unnamed"),
      type: String(node.type || "UNKNOWN"),
      parentId: node.parentId ? String(node.parentId) : null,
      childrenIds: Array.isArray(node.childrenIds)
        ? node.childrenIds.map((item) => String(item))
        : []
    }));
  }

  if (!input?.nodes || typeof input.nodes !== "object") {
    return [];
  }

  const out = [];
  const seen = new Set();

  const walk = (node, parentId = null) => {
    if (!node || typeof node !== "object" || !node.id || seen.has(node.id)) {
      return;
    }
    seen.add(node.id);
    const children = Array.isArray(node.children) ? node.children : [];
    out.push({
      id: String(node.id),
      name: String(node.name || "Unnamed"),
      type: String(node.type || "UNKNOWN"),
      parentId: parentId ? String(parentId) : null,
      childrenIds: children.map((child) => String(child.id)).filter(Boolean)
    });
    for (const child of children) {
      walk(child, node.id);
    }
  };

  for (const value of Object.values(input.nodes)) {
    if (value?.document) {
      walk(value.document, null);
    }
  }
  return out;
}

function resolveRootIds(input, nodes) {
  const metaIds = Array.isArray(input?.meta?.nodeIds) ? input.meta.nodeIds.map(String) : [];
  if (metaIds.length > 0) return metaIds;

  const noParent = nodes.filter((node) => !node.parentId).map((node) => node.id);
  if (noParent.length > 0) return noParent;

  return nodes.length > 0 ? [nodes[0].id] : [];
}

function nodeToLayout(nodeId, indexById) {
  const current = indexById.get(nodeId);
  if (!current) {
    return { type: "Unknown", children: [] };
  }
  return {
    type: current.type || "Unknown",
    children: current.childrenIds.map((childId) => nodeToLayout(childId, indexById))
  };
}

function matchRule(node, rules) {
  for (const rule of rules) {
    if (!rule || typeof rule !== "object") continue;
    if (rule.by === "nodeId" && node.id === rule.value) return rule;
    if (rule.by === "nodeType" && node.type === rule.value) return rule;
    if (
      rule.by === "nameIncludes" &&
      typeof rule.value === "string" &&
      node.name.toLowerCase().includes(rule.value.toLowerCase())
    ) {
      return rule;
    }
    if (rule.by === "nodeNameRegex" && typeof rule.value === "string") {
      try {
        const regex = new RegExp(rule.value, rule.flags || "i");
        if (regex.test(node.name)) return rule;
      } catch {
        continue;
      }
    }
  }
  return null;
}

function buildStructuredError(missingNodes) {
  return {
    code: "DESIGN_CONTEXT_BLOCKED",
    reason: "unknown_component_mapping",
    missing: missingNodes.map((node) => `FigmaNode#${node.id}`),
    suggestion: "补充组件映射或标记为CUSTOM"
  };
}

function validateMappingConfig(mappingPath, mapping) {
  if (!Array.isArray(mapping?.rules)) {
    throw new Error(`${mappingPath} must contain 'rules' array`);
  }
}

function main() {
  const root = repoRoot();
  const inputPath = arg("--input", path.join(root, ".gen/figma/latest.extract.json"));
  const mapPath = arg("--map", path.join(root, "design/mappings/figma-component-map.json"));
  const outputPath = arg("--output", path.join(root, ".gen/figma/latest.design-context.json"));
  const pageIdArg = arg("--pageId", "");
  const allowCustomFallback = hasFlag("--allow-custom-fallback");
  const skipValidate = hasFlag("--no-validate");

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input not found: ${inputPath}`);
  }
  if (!fs.existsSync(mapPath)) {
    throw new Error(`Mapping not found: ${mapPath}`);
  }

  const input = readJson(inputPath);
  const mapping = readJson(mapPath);
  validateMappingConfig(mapPath, mapping);

  const nodes = normalizeNodes(input).filter((node) => node.id.length > 0);
  if (nodes.length === 0) {
    throw new Error("No extract nodes available for compile");
  }

  const indexById = new Map(nodes.map((node) => [node.id, node]));
  const rootIds = resolveRootIds(input, nodes);
  const rules = mapping.rules || [];

  const missing = [];
  const componentMappings = [];

  for (const node of nodes) {
    const rule = matchRule(node, rules);
    if (rule) {
      componentMappings.push({
        figmaNode: node.id,
        component: String(rule.component),
        source: rule.source === "CUSTOM" ? "CUSTOM" : "DESIGN_SYSTEM",
        confidence:
          typeof rule.confidence === "number" ? Math.min(1, Math.max(0, rule.confidence)) : 0.9
      });
      continue;
    }

    if (!allowCustomFallback) {
      missing.push(node);
      continue;
    }

    componentMappings.push({
      figmaNode: node.id,
      component: sanitizeComponentName(node.name, node.id),
      source: "CUSTOM",
      confidence: 0.6
    });
  }

  if (missing.length > 0 && !allowCustomFallback) {
    console.error(JSON.stringify(buildStructuredError(missing), null, 2));
    process.exit(1);
  }

  const pageId =
    pageIdArg ||
    path
      .basename(outputPath)
      .replace(/\.design-context\.json$/, "")
      .replace(/\.json$/, "");

  const output = {
    pageId,
    figmaNodeRefs: rootIds,
    layoutTree: {
      type: "Page",
      children: rootIds.map((nodeId) => nodeToLayout(nodeId, indexById))
    },
    componentMappings,
    designTokens: Array.isArray(mapping.designTokens) ? mapping.designTokens : [],
    a11yRequirements:
      Array.isArray(mapping.a11yRequirements) && mapping.a11yRequirements.length > 0
        ? mapping.a11yRequirements
        : ["interactive controls expose accessible names"],
    interactionModel:
      Array.isArray(mapping.interactionModel) && mapping.interactionModel.length > 0
        ? mapping.interactionModel
        : [{ state: "ready", expectation: "main sections rendered" }],
    knownRisks: Array.isArray(mapping.knownRisks) ? mapping.knownRisks : [],
    unknowns: missing.map((item) => `missing_component_mapping:${item.id}`)
  };

  if (!skipValidate) {
    const validator = compileValidator(path.join(root, "design/schemas/design-context.schema.json"));
    const ok = validator(output);
    if (!ok) {
      throw new Error(`Compiled output invalid: ${JSON.stringify(validator.errors)}`);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`figma:compile wrote ${outputPath}`);
  console.log(`componentMappings=${output.componentMappings.length}`);
}

try {
  main();
} catch (error) {
  console.error(String(error?.message || error));
  process.exit(1);
}
