import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { listJsonFiles, readJson, rel, repoRoot } from "./lib/validator.mjs";

const root = repoRoot();
const scenarioDir = path.join(root, "tests/visual/scenarios");
const thresholdsPath = path.join(root, "tests/visual/thresholds.json");
const visualRoot = path.join(root, ".evals/visual");
const baselineRoot = path.join(visualRoot, "baseline");
const currentRoot = path.join(visualRoot, "current");
const diffRoot = path.join(visualRoot, "diff");
const reportPath = path.join(visualRoot, "latest.json");

const gateMode = process.env.VISUAL_GATE_MODE === "block" ? "block" : "warn";
const requiredViewports = ["desktop", "mobile"];
const requiredStates = ["initial", "editing", "confirm-modal", "submitted"];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeThresholdValue(name, value) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
    throw new Error(`Invalid threshold value for ${name}: expected number in [0,1], got ${value}`);
  }
  return value;
}

function loadThresholds() {
  if (!fs.existsSync(thresholdsPath)) {
    throw new Error(`Threshold config missing: ${rel(thresholdsPath)}`);
  }

  const data = readJson(thresholdsPath);
  const output = {
    version: String(data.version || ""),
    defaultDiffRatio: normalizeThresholdValue("defaultDiffRatio", data.defaultDiffRatio),
    pixelSensitivity: normalizeThresholdValue(
      "pixelSensitivity",
      data.pixelSensitivity === undefined ? 0.1 : data.pixelSensitivity
    ),
    viewportOverrides: {},
    stateOverrides: {},
    scenarioOverrides: {}
  };

  for (const [key, value] of Object.entries(data.viewportOverrides || {})) {
    output.viewportOverrides[key] = normalizeThresholdValue(`viewportOverrides.${key}`, value);
  }
  for (const [key, value] of Object.entries(data.stateOverrides || {})) {
    output.stateOverrides[key] = normalizeThresholdValue(`stateOverrides.${key}`, value);
  }
  for (const [scenarioId, overrides] of Object.entries(data.scenarioOverrides || {})) {
    output.scenarioOverrides[scenarioId] = {};
    for (const [state, value] of Object.entries(overrides || {})) {
      output.scenarioOverrides[scenarioId][state] = normalizeThresholdValue(
        `scenarioOverrides.${scenarioId}.${state}`,
        value
      );
    }
  }

  return output;
}

function readPng(filePath) {
  const buffer = fs.readFileSync(filePath);
  return PNG.sync.read(buffer);
}

function resolveThreshold({ thresholds, scenarioId, viewport, state }) {
  const scenarioViewportState = thresholds.scenarioOverrides[scenarioId]?.[`${viewport}:${state}`];
  if (scenarioViewportState !== undefined) return scenarioViewportState;

  const scenarioState = thresholds.scenarioOverrides[scenarioId]?.[state];
  if (scenarioState !== undefined) return scenarioState;

  if (thresholds.stateOverrides[state] !== undefined) return thresholds.stateOverrides[state];
  if (thresholds.viewportOverrides[viewport] !== undefined) return thresholds.viewportOverrides[viewport];
  return thresholds.defaultDiffRatio;
}

function validateScenarioShape({ file, data }) {
  const errors = [];
  if (typeof data.id !== "string" || data.id.length === 0) {
    errors.push(`${rel(file)} missing non-empty id`);
  }

  if (!Array.isArray(data.viewports) || data.viewports.length === 0) {
    errors.push(`${rel(file)} missing non-empty viewports`);
  } else {
    for (const vp of data.viewports) {
      if (typeof vp?.name !== "string" || vp.name.length === 0) {
        errors.push(`${rel(file)} has viewport without name`);
      }
      if (!Number.isInteger(vp?.width) || !Number.isInteger(vp?.height)) {
        errors.push(`${rel(file)} viewport ${vp?.name || "<unknown>"} width/height must be integers`);
      }
    }
  }

  if (!Array.isArray(data.states) || data.states.length === 0) {
    errors.push(`${rel(file)} missing non-empty states`);
  } else {
    for (const state of data.states) {
      if (typeof state !== "string" || state.length === 0) {
        errors.push(`${rel(file)} has invalid state entry`);
      }
    }
  }

  return errors;
}

function evaluatePair({ scenarioId, viewport, state, thresholds }) {
  const baselinePath = path.join(baselineRoot, scenarioId, viewport, `${state}.png`);
  const currentPath = path.join(currentRoot, scenarioId, viewport, `${state}.png`);
  const diffPath = path.join(diffRoot, scenarioId, viewport, `${state}.png`);
  const threshold = resolveThreshold({ thresholds, scenarioId, viewport, state });

  if (!fs.existsSync(baselinePath) || !fs.existsSync(currentPath)) {
    return {
      scenarioId,
      viewport,
      state,
      threshold,
      status: "missing",
      reason: "baseline_or_current_missing",
      baselinePath: rel(baselinePath),
      currentPath: rel(currentPath),
      diffPath: rel(diffPath)
    };
  }

  const baseline = readPng(baselinePath);
  const current = readPng(currentPath);
  if (baseline.width !== current.width || baseline.height !== current.height) {
    return {
      scenarioId,
      viewport,
      state,
      threshold,
      status: "fail",
      reason: "dimension_mismatch",
      baselinePath: rel(baselinePath),
      currentPath: rel(currentPath),
      diffPath: rel(diffPath),
      baselineSize: `${baseline.width}x${baseline.height}`,
      currentSize: `${current.width}x${current.height}`
    };
  }

  ensureDir(path.dirname(diffPath));
  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const diffPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: thresholds.pixelSensitivity }
  );
  const totalPixels = baseline.width * baseline.height;
  const diffRatio = totalPixels > 0 ? diffPixels / totalPixels : 0;
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return {
    scenarioId,
    viewport,
    state,
    threshold,
    status: diffRatio <= threshold ? "pass" : "fail",
    reason: diffRatio <= threshold ? "within_threshold" : "diff_ratio_exceeded",
    baselinePath: rel(baselinePath),
    currentPath: rel(currentPath),
    diffPath: rel(diffPath),
    diffPixels,
    totalPixels,
    diffRatio: Number(diffRatio.toFixed(6))
  };
}

function main() {
  ensureDir(visualRoot);
  ensureDir(baselineRoot);
  ensureDir(currentRoot);
  ensureDir(diffRoot);

  const thresholds = loadThresholds();
  const scenarioFiles = listJsonFiles(scenarioDir).filter((file) => file.endsWith(".visual-spec.json"));
  if (scenarioFiles.length === 0) {
    throw new Error(`No visual scenarios found in ${rel(scenarioDir)}`);
  }

  const scenarios = scenarioFiles.map((file) => ({ file, data: readJson(file) }));
  const configErrors = [];
  const coverageWarnings = [];
  const results = [];

  for (const scenario of scenarios) {
    const scenarioErrors = validateScenarioShape(scenario);
    if (scenarioErrors.length > 0) {
      configErrors.push(...scenarioErrors);
      continue;
    }

    const viewportNames = scenario.data.viewports.map((vp) => vp.name);
    const missingViewports = requiredViewports.filter((item) => !viewportNames.includes(item));
    if (missingViewports.length > 0) {
      coverageWarnings.push(
        `${rel(scenario.file)} missing required viewports: ${missingViewports.join(", ")}`
      );
    }

    const states = scenario.data.states;
    const missingStates = requiredStates.filter((item) => !states.includes(item));
    if (missingStates.length > 0) {
      coverageWarnings.push(`${rel(scenario.file)} missing required states: ${missingStates.join(", ")}`);
    }

    for (const viewport of viewportNames) {
      for (const state of states) {
        const result = evaluatePair({
          scenarioId: scenario.data.id,
          viewport,
          state,
          thresholds
        });
        results.push(result);
      }
    }
  }

  const summary = {
    scenarios: scenarios.length,
    comparisons: results.length,
    passed: results.filter((item) => item.status === "pass").length,
    failed: results.filter((item) => item.status === "fail").length,
    missing: results.filter((item) => item.status === "missing").length,
    coverageWarnings: coverageWarnings.length,
    configErrors: configErrors.length
  };

  const report = {
    generatedAt: new Date().toISOString(),
    gateMode,
    thresholdVersion: thresholds.version || "unknown",
    requirements: {
      requiredViewports,
      requiredStates
    },
    summary,
    coverageWarnings,
    configErrors,
    results
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  for (const err of configErrors) {
    console.error(`config error: ${err}`);
  }
  for (const warning of coverageWarnings) {
    console.warn(`coverage warning: ${warning}`);
  }

  for (const item of results) {
    if (item.status === "pass") {
      console.log(`pass ${item.scenarioId}/${item.viewport}/${item.state} ratio=${item.diffRatio}`);
      continue;
    }
    if (item.status === "missing") {
      console.warn(
        `missing ${item.scenarioId}/${item.viewport}/${item.state} baseline=${item.baselinePath} current=${item.currentPath}`
      );
      continue;
    }
    console.error(
      `fail ${item.scenarioId}/${item.viewport}/${item.state} reason=${item.reason} threshold=${item.threshold}`
    );
  }

  console.log(`visual:regression report => ${rel(reportPath)}`);
  console.log(`summary => ${JSON.stringify(summary)}`);

  if (configErrors.length > 0) {
    process.exit(1);
  }

  if (gateMode === "block") {
    if (summary.failed > 0 || summary.missing > 0 || summary.coverageWarnings > 0) {
      console.error("visual:regression blocked by threshold/coverage issues");
      process.exit(1);
    }
  } else if (summary.failed > 0 || summary.missing > 0 || summary.coverageWarnings > 0) {
    console.warn("visual:regression completed with warnings (warn mode)");
  }

  console.log("visual:regression passed");
}

main();
