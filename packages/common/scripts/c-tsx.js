#!/usr/bin/env node
/* global process, console */

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [fileToRun, ...childArgs] = process.argv.slice(2);

if (fileToRun == null) {
  console.error("Error: No input file specified.");
  console.error("Usage: c-tsx <file.ts> [script args...]");
  process.exit(1);
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDirectory, "../../..");

const child = spawn(
  process.platform === "win32" ? "tsx.cmd" : "tsx",
  [fileToRun, ...childArgs],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      CURSORLESS_REPO_ROOT: repoRoot,
    },
  },
);

child.on("close", (code) => {
  process.exit(code ?? undefined);
});
