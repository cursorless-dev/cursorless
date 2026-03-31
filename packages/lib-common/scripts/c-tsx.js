#!/usr/bin/env node
/* global process, console */

// This script runs a TypeScript file using tsx after setting repo-specific
// environment variables.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "cross-spawn";

/**
 * Run a command with arguments and return a child process
 * @param {string} command
 * @param {string[]} args
 * @param {Partial<NodeJS.ProcessEnv>?} extraEnv
 */
function runCommand(command, args, extraEnv = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      ...extraEnv,
    },
  });
}

// Main function to execute the script
function main() {
  const args = process.argv.slice(2);

  // Check if the input file is specified
  if (args.length === 0) {
    console.error("Error: No input file specified.");
    console.error("Usage: c-tsx <file.ts> [script args...]");
    process.exit(1);
  }

  const [fileToRun, ...childArgs] = args;

  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(scriptDirectory, "..", "..", "..");

  const nodeProcess = runCommand(
    "tsx",
    ["--enable-source-maps", fileToRun, ...childArgs],
    {
      ["CURSORLESS_REPO_ROOT"]: repoRoot,
    },
  );
  nodeProcess.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
  nodeProcess.on("close", (code) => process.exit(code ?? undefined));
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
