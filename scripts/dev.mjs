import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = resolve(root, "backend");
const venvDir = resolve(backendDir, ".venv");
const requirements = resolve(backendDir, "requirements.txt");
const marker = resolve(venvDir, ".requirements-installed");
const windows = process.platform === "win32";
const basePython = process.env.PYTHON || (windows ? "py" : "python3");
const venvPython = resolve(venvDir, windows ? "Scripts/python.exe" : "bin/python");

function runSetup(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

try {
  if (!existsSync(venvPython)) {
    mkdirSync(venvDir, { recursive: true });
    runSetup(basePython, windows
      ? ["-3", "-m", "venv", venvDir]
      : ["-m", "venv", venvDir]);
  }

  const requirementsTime = statSync(requirements).mtimeMs;
  const installedTime = existsSync(marker) ? Number.parseFloat(readFileSync(marker, "utf8")) : 0;
  if (requirementsTime > installedTime) {
    runSetup(venvPython, ["-m", "pip", "install", "-r", requirements]);
    writeFileSync(marker, String(requirementsTime));
  }
} catch (error) {
  console.error(`Could not prepare the backend Python environment: ${error.message}`);
  process.exit(1);
}

const viteCli = resolve(root, "frontend/node_modules/vite/bin/vite.js");
if (!existsSync(viteCli)) {
  console.error("Frontend dependencies are missing. Run `npm install` once, then `npm run dev`.");
  process.exit(1);
}

const children = [
  spawn(venvPython, [resolve(backendDir, "app.py")], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, FLASK_DEBUG: process.env.FLASK_DEBUG || "1" },
  }),
  spawn(process.execPath, [viteCli, "--host", "127.0.0.1"], {
    cwd: resolve(root, "frontend"),
    stdio: "inherit",
    env: process.env,
  }),
];

let stopping = false;
function stop(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill(signal);
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => stop(signal));
}

for (const child of children) {
  child.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
    stop();
  });
  child.on("exit", (code) => {
    if (!stopping) {
      process.exitCode = code ?? 1;
      stop();
    }
  });
}
