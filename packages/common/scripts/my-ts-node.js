#!/usr/bin/env node
/* eslint-disable no-undef */
import { spawn } from "child_process";
import { existsSync, mkdirSync, rmdirSync } from "fs";
import { join } from "path";

// Function to run a command with arguments and return a child process
function runCommand(command, args, options) {
  return spawn(command, args, { stdio: "inherit", ...options });
}

// Function to create a temporary directory and return its path
function createTempDirectory(baseDir) {
  const tempDir = join(baseDir, "out/my-ts-node-tmp");
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

// Function to clean up the temporary directory
function cleanupTempDirectory(tempDir) {
  rmdirSync(tempDir, { recursive: true });
}

// Main function to execute the script
function main() {
  const args = process.argv.slice(2);

  // Check if the input file is specified
  if (args.length === 0) {
    console.error("Error: No input file specified.");
    console.error("Usage: node myTsNode.js <file.ts> [script args...]");
    process.exit(1);
  }

  const fileToRun = args.shift();
  const tempDir = createTempDirectory(process.cwd());
  const outFile = join(tempDir, "out.cjs");

  // Set up cleanup for when the script exits
  process.on("exit", () => cleanupTempDirectory(tempDir));
  process.on("SIGINT", () => cleanupTempDirectory(tempDir));
  process.on("SIGTERM", () => cleanupTempDirectory(tempDir));

  // Run esbuild to bundle the TypeScript file
  const esbuildProcess = runCommand("esbuild", [
    "--sourcemap",
    "--log-level=warning",
    "--conditions=cursorless:bundler",
    "--bundle",
    "--format=cjs",
    "--platform=node",
    fileToRun,
    "--outfile=" + outFile,
  ]);

  esbuildProcess.on("close", (code) => {
    if (code === 0) {
      // Execute the bundled file with Node, passing any additional arguments
      runCommand(process.execPath, [outFile, ...args]);
    } else {
      console.error(`esbuild failed with code ${code}`);
      process.exit(code);
    }
  });
}

main();
