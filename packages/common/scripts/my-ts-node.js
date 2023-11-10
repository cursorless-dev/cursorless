#!/usr/bin/env node
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
/*eslint-env node*/
import { spawn } from "child_process";
import { existsSync, mkdirSync, rmdirSync } from "fs";
import { join, resolve } from "path";

// Function to run a command with arguments and return a child process
/**
 * @param {string} command
 * @param {readonly string[]} args
 * @param {import("child_process").SpawnOptionsWithoutStdio | undefined} [options]
 */
function runCommand(command, args, options) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
}

// Function to create a temporary directory and return its path
/**
 * @param {string} baseDir
 */
function createTempDirectory(baseDir) {
  const tempDir = join(baseDir, "out/my-ts-node-tmp");
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

// Function to clean up the temporary directory
/**
 * @param {import("fs").PathLike} tempDir
 */
function cleanupTempDirectory(tempDir) {
  if (existsSync(tempDir)) {
    rmdirSync(tempDir, { recursive: true });
  }
}

// Main function to execute the script
function main() {
  const args = process.argv.slice(2);

  // Check if the input file is specified
  if (args.length === 0) {
    console.error("Error: No input file specified.");
    console.error("Usage: my-ts-node <file.ts> [script args...]");
    process.exit(1);
  }

  // Print PATH for debugging
  console.log(process.env.PATH);

  // Tell typescript this can't be undefined
  /** @type {string} */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const fileToRun = args.shift();
  const tempDir = createTempDirectory(process.cwd());
  const outFile = join(tempDir, "out.cjs");

  // Set up cleanup for when the script exits
  process.on("exit", () => cleanupTempDirectory(tempDir));
  process.on("SIGINT", () => cleanupTempDirectory(tempDir));
  process.on("SIGTERM", () => cleanupTempDirectory(tempDir));

  // Canonicalize the file path
  const filePath = resolve(fileToRun);

  // Check that the input file exists
  if (!existsSync(filePath)) {
    console.error(`Error: Input file ${filePath} does not exist.`);
    process.exit(1);
  }
  console.log("filePath", filePath);

  // Run esbuild to bundle the TypeScript file
  const esbuildProcess = runCommand("esbuild", [
    "--sourcemap",
    "--log-level=warning",
    "--conditions=cursorless:bundler",
    "--bundle",
    "--format=cjs",
    "--platform=node",
    filePath,
    "--outfile=" + outFile,
  ]);

  esbuildProcess.on("close", (code) => {
    if (code === 0) {
      // Execute the bundled file with Node, passing any additional arguments
      runCommand(process.execPath, [outFile, ...args]);
    } else {
      console.error(`esbuild failed with code ${code}`);
      process.exit(code ?? undefined);
    }
  });
}

main();
