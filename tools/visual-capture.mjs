import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { listJsonFiles, readJson, rel, repoRoot } from "./lib/validator.mjs";

const root = repoRoot();
const scenarioDir = path.join(root, "tests/visual/scenarios");
const visualRoot = path.join(root, ".evals/visual");
const reportPath = path.join(visualRoot, "capture.latest.json");

const captureTarget = process.env.VISUAL_CAPTURE_TARGET || "current";
if (!["baseline", "current"].includes(captureTarget)) {
  throw new Error(`Unsupported VISUAL_CAPTURE_TARGET=${captureTarget}. Use baseline or current.`);
}

const defaultPort = process.env.VISUAL_PORT || "3300";
const baseUrl = process.env.VISUAL_BASE_URL || `http://127.0.0.1:${defaultPort}`;
const autoStart = process.env.VISUAL_CAPTURE_AUTOSTART !== "0";
const preStartCmd =
  process.env.VISUAL_CAPTURE_PRESTART_CMD || "pnpm --filter web build";
const startCmd =
  process.env.VISUAL_CAPTURE_START_CMD ||
  `pnpm --filter web start --hostname 127.0.0.1 --port ${defaultPort}`;
const timeoutMs = Number(process.env.VISUAL_CAPTURE_TIMEOUT_MS || 90000);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function isServerReady(url) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "manual" });
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeout) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    // eslint-disable-next-line no-await-in-loop
    if (await isServerReady(url)) {
      return true;
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

function startServer() {
  return spawn(startCmd, {
    cwd: root,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function runPreStart() {
  const run = spawnSync(preStartCmd, {
    cwd: root,
    shell: true,
    stdio: "inherit"
  });
  if (run.status !== 0) {
    throw new Error(`Pre-start command failed: ${preStartCmd}`);
  }
}

function buildBaseUrl({ scenario }) {
  const routePath = scenario.routePath || `/visual/${scenario.id}`;
  const url = new URL(routePath, baseUrl);
  return url;
}

function buildQueryStateUrl({ scenario, state }) {
  const stateParam = scenario.stateParam || "state";
  const url = buildBaseUrl({ scenario });
  url.searchParams.set(stateParam, state);
  return url.toString();
}

function normalizeScenario(data, filePath) {
  if (!data || typeof data !== "object") {
    throw new Error(`${rel(filePath)} invalid scenario content`);
  }
  if (typeof data.id !== "string" || data.id.length === 0) {
    throw new Error(`${rel(filePath)} missing id`);
  }
  if (!Array.isArray(data.viewports) || data.viewports.length === 0) {
    throw new Error(`${rel(filePath)} missing viewports`);
  }
  if (!Array.isArray(data.states) || data.states.length === 0) {
    throw new Error(`${rel(filePath)} missing states`);
  }

  const captureConfig = data.capture || { mode: "query-state" };
  const mode = captureConfig.mode || "query-state";
  if (!["query-state", "interaction"].includes(mode)) {
    throw new Error(`${rel(filePath)} invalid capture.mode=${mode}`);
  }

  const stateActions = {};
  if (mode === "interaction") {
    if (!captureConfig.stateActions || typeof captureConfig.stateActions !== "object") {
      throw new Error(`${rel(filePath)} capture.stateActions is required in interaction mode`);
    }

    for (const state of data.states) {
      if (!Object.prototype.hasOwnProperty.call(captureConfig.stateActions, state)) {
        throw new Error(`${rel(filePath)} capture.stateActions missing entry for state=${state}`);
      }

      const actions = captureConfig.stateActions[state];
      if (!Array.isArray(actions)) {
        throw new Error(`${rel(filePath)} capture.stateActions.${state} must be an array`);
      }

      for (const [index, action] of actions.entries()) {
        if (!action || typeof action !== "object") {
          throw new Error(
            `${rel(filePath)} capture.stateActions.${state}[${index}] must be an object`
          );
        }
        if (typeof action.type !== "string" || action.type.length === 0) {
          throw new Error(
            `${rel(filePath)} capture.stateActions.${state}[${index}] missing action type`
          );
        }
        if (action.type === "click" || action.type === "waitForSelector") {
          if (typeof action.selector !== "string" || action.selector.length === 0) {
            throw new Error(
              `${rel(filePath)} capture.stateActions.${state}[${index}] requires selector`
            );
          }
        } else if (action.type === "waitForTimeout") {
          if (!Number.isInteger(action.ms) || action.ms < 0) {
            throw new Error(
              `${rel(filePath)} capture.stateActions.${state}[${index}] requires non-negative integer ms`
            );
          }
        } else {
          throw new Error(
            `${rel(filePath)} capture.stateActions.${state}[${index}] unsupported action type=${action.type}`
          );
        }
      }

      stateActions[state] = actions;
    }
  }

  return {
    id: data.id,
    routePath: data.routePath,
    stateParam: data.stateParam,
    viewports: data.viewports,
    states: data.states,
    capture: {
      mode,
      stateActions
    }
  };
}

async function runActions(page, actions) {
  for (const action of actions) {
    if (action.type === "click") {
      await page.click(action.selector, { timeout: action.timeoutMs || 10000 });
      continue;
    }
    if (action.type === "waitForSelector") {
      await page.waitForSelector(action.selector, {
        timeout: action.timeoutMs || 10000,
        state: action.state || "visible"
      });
      continue;
    }
    if (action.type === "waitForTimeout") {
      await page.waitForTimeout(action.ms);
      continue;
    }
  }
}

async function captureScreenshots() {
  ensureDir(visualRoot);

  const scenarioFiles = listJsonFiles(scenarioDir).filter((item) =>
    item.endsWith(".visual-spec.json")
  );
  if (scenarioFiles.length === 0) {
    throw new Error(`No scenarios in ${rel(scenarioDir)}`);
  }

  let serverProcess = null;
  const serverAlreadyUp = await isServerReady(baseUrl);
  if (!serverAlreadyUp) {
    if (!autoStart) {
      throw new Error(
        `Server not reachable at ${baseUrl}. Start app manually or set VISUAL_CAPTURE_AUTOSTART=1.`
      );
    }
    console.log(`Running pre-start command: ${preStartCmd}`);
    runPreStart();
    console.log(`Starting server via: ${startCmd}`);
    serverProcess = startServer();
    const ok = await waitForServer(baseUrl, timeoutMs);
    if (!ok) {
      const stderr = serverProcess.stderr?.read()?.toString?.() || "";
      serverProcess.kill("SIGTERM");
      throw new Error(`Server start timeout (${timeoutMs}ms). ${stderr}`.trim());
    }
  }

  const startedAt = Date.now();
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    captureTarget,
    scenarioCount: scenarioFiles.length,
    screenshots: [],
    summary: {
      captured: 0,
      failed: 0
    }
  };

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    const message = String(error?.message || error);
    if (serverProcess) serverProcess.kill("SIGTERM");
    if (message.includes("Executable doesn't exist")) {
      throw new Error(
        "Playwright browser not installed. Run `pnpm visual:install-browsers` before capture."
      );
    }
    throw error;
  }

  try {
    for (const file of scenarioFiles) {
      const scenario = normalizeScenario(readJson(file), file);
      for (const viewport of scenario.viewports) {
        if (
          typeof viewport?.name !== "string" ||
          !Number.isInteger(viewport?.width) ||
          !Number.isInteger(viewport?.height)
        ) {
          throw new Error(`${rel(file)} has invalid viewport`);
        }

        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          colorScheme: "light"
        });
        const page = await context.newPage();

        for (const state of scenario.states) {
          if (typeof state !== "string" || state.length === 0) {
            throw new Error(`${rel(file)} has invalid state`);
          }

          const url =
            scenario.capture.mode === "interaction"
              ? buildBaseUrl({ scenario }).toString()
              : buildQueryStateUrl({ scenario, state });
          const outPath = path.join(
            visualRoot,
            captureTarget,
            scenario.id,
            viewport.name,
            `${state}.png`
          );
          ensureDir(path.dirname(outPath));

          try {
            await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
            await page.waitForSelector('[data-visual-ready="true"]', {
              timeout: 10000
            });
            if (scenario.capture.mode === "interaction") {
              await page.waitForSelector(
                '[data-visual-ready="true"][data-visual-hydrated="true"]',
                { timeout: 10000 }
              );
              const actions = scenario.capture.stateActions[state] || [];
              await runActions(page, actions);
              await page.waitForSelector(
                `[data-visual-ready="true"][data-state="${state}"]`,
                { timeout: 10000 }
              );
            }
            await page.waitForTimeout(120);
            await page.screenshot({
              path: outPath,
              fullPage: true,
              animations: "disabled"
            });
            report.summary.captured += 1;
            report.screenshots.push({
              scenarioId: scenario.id,
              viewport: viewport.name,
              state,
              url,
              output: rel(outPath),
              status: "captured",
              mode: scenario.capture.mode,
              actionCount:
                scenario.capture.mode === "interaction"
                  ? (scenario.capture.stateActions[state] || []).length
                  : 0
            });
            console.log(
              `captured ${scenario.id}/${viewport.name}/${state} mode=${scenario.capture.mode}`
            );
          } catch (error) {
            report.summary.failed += 1;
            report.screenshots.push({
              scenarioId: scenario.id,
              viewport: viewport.name,
              state,
              url,
              output: rel(outPath),
              status: "failed",
              mode: scenario.capture.mode,
              error: String(error?.message || error)
            });
            console.error(`capture failed ${scenario.id}/${viewport.name}/${state}`);
          }
        }

        await context.close();
      }
    }
  } finally {
    await browser.close();
    if (serverProcess) serverProcess.kill("SIGTERM");
  }

  report.durationMs = Date.now() - startedAt;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`visual:capture report => ${rel(reportPath)}`);
  console.log(`summary => ${JSON.stringify(report.summary)}`);

  if (report.summary.failed > 0) {
    process.exit(1);
  }
}

captureScreenshots();
