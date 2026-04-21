import fs from "node:fs";
import path from "node:path";

function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

function requiredArg(name, value) {
  if (!value || String(value).trim().length === 0) {
    throw new Error(`Missing required parameter: ${name}`);
  }
  return value;
}

function parseNodeIds(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractNodesFromFigmaResponse(data) {
  if (!data?.nodes || typeof data.nodes !== "object") {
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
      id: node.id,
      name: node.name || "Unnamed",
      type: node.type || "UNKNOWN",
      parentId,
      childrenIds: children.map((child) => child.id).filter(Boolean)
    });

    for (const child of children) {
      walk(child, node.id);
    }
  };

  for (const value of Object.values(data.nodes)) {
    if (value?.document) {
      walk(value.document, null);
    }
  }

  return out;
}

async function main() {
  const fileKey = requiredArg("--fileKey", arg("--fileKey", process.env.FIGMA_FILE_KEY));
  const nodeIds = parseNodeIds(arg("--nodeIds", process.env.FIGMA_NODE_IDS));
  if (nodeIds.length === 0) {
    throw new Error("Missing required parameter: --nodeIds (or FIGMA_NODE_IDS)");
  }

  const token = requiredArg("--token", arg("--token", process.env.FIGMA_TOKEN));
  const baseUrl = arg("--baseUrl", process.env.FIGMA_API_BASE_URL || "https://api.figma.com/v1");
  const outputPath = arg("--output", ".gen/figma/latest.extract.json");

  const endpoint = `${baseUrl}/files/${encodeURIComponent(fileKey)}/nodes?ids=${encodeURIComponent(
    nodeIds.join(",")
  )}`;
  const response = await fetch(endpoint, {
    headers: {
      "X-Figma-Token": token
    }
  });
  const payload = await response.json();

  if (!response.ok) {
    const msg = payload?.err || payload?.message || JSON.stringify(payload);
    throw new Error(`Figma extract failed (${response.status}): ${msg}`);
  }

  const normalized = {
    meta: {
      source: "figma-api",
      fileKey,
      nodeIds,
      extractedAt: new Date().toISOString()
    },
    nodes: extractNodesFromFigmaResponse(payload)
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");

  console.log(`figma:extract wrote ${outputPath}`);
  console.log(`nodes=${normalized.nodes.length}`);
}

main().catch((error) => {
  console.error(String(error?.message || error));
  process.exit(1);
});
