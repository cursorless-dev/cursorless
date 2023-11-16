#!/usr/bin/env node
// @ts-check
/*eslint-env node*/
// This script runs a TypeScript file using Node.js by first bundling it with
// esbuild.
import { spawn } from "cross-spawn";
import { build } from "esbuild";
import { existsSync, mkdirSync, rmdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

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

/**
 * Create a temporary directory and return its path
 * @param {string} baseDir
 */
function createTempDirectory(baseDir) {
  const tempDir = join(
    baseDir,
    "out",
    "my-ts-node-tmp",
    randomBytes(16).toString("hex"),
  );

  mkdirSync(tempDir, { recursive: true });

  return tempDir;
}

/**
 * Clean up the temporary directory
 * @param {import("fs").PathLike} tempDir
 */
function cleanupTempDirectory(tempDir) {
  if (existsSync(tempDir)) {
    rmdirSync(tempDir, { recursive: true });
  }
}

// Main function to execute the script
async function main() {
  const args = process.argv.slice(2);

  // Check if the input file is specified
  if (args.length === 0) {
    console.error("Error: No input file specified.");
    console.error("Usage: my-ts-node <file.ts> [script args...]");
    process.exit(1);
  }

  const [fileToRun, ...childArgs] = args;

  // Note that the temporary directory must be in the workspace root, otherwise
  // VSCode will ignore the source maps, and breakpoints will not work.
  const tempDir = createTempDirectory(process.cwd());
  const outFile = join(tempDir, "out.cjs");

  // Set up cleanup for when the script exits
  process.on("exit", () => cleanupTempDirectory(tempDir));
  process.on("SIGINT", () => cleanupTempDirectory(tempDir));
  process.on("SIGTERM", () => cleanupTempDirectory(tempDir));

  // Run esbuild to bundle the TypeScript file
  await build({
    entryPoints: [fileToRun],
    sourcemap: true,
    conditions: ["cursorless:bundler"],
    logLevel: "warning",
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: outFile,
  });

  const nodeProcess = runCommand(
    process.execPath,
    ["--enable-source-maps", outFile, ...childArgs],
    {
      ["CURSORLESS_REPO_ROOT"]: join(
        dirname(fileURLToPath(import.meta.url)),
        "..",
        "..",
        "..",
      ),
    },
  );
  nodeProcess.on("close", (code) => process.exit(code ?? undefined));
}

main();
