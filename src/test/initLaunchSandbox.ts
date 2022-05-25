/**
 * This script creates a local sandbox directory containing extensions that
 * will run alongside Cursorless during local development.
 */
import * as path from "path";
import * as cp from "child_process";
import { promisify } from "util";
import { extensionDependencies } from "./extensionDependencies";
import { mkdir } from "fs/promises";

const extraExtensions = ["pokey.command-server", "pokey.talon"];

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");
    const extensionSandboxDir = path.join(
      extensionDevelopmentPath,
      ".vscode-sandbox",
      "extensions"
    );
    await mkdir(extensionSandboxDir, { recursive: true });

    const command = [
      "code",
      "--extensions-dir",
      extensionSandboxDir,
      ...[...extensionDependencies, ...extraExtensions].flatMap(
        (dependency) => ["--install-extension", dependency]
      ),
    ].join(" ");

    // Install extension dependencies
    const results = await promisify(cp.exec)(command);

    console.log(results.stdout);
    console.log(results.stderr);
  } catch (err) {
    console.error("Failed to init launch sandbox");
    console.error(err);
    process.exit(1);
  }
}

main();
