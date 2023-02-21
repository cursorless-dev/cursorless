/**
 * This script creates a VSCode settings profile for Cursorless development,
 * allowing you to have a separate set of extensions and settings for use when
 * developing the Cursorless VSCode extension locally.
 */
import { extensionDependencies } from "@cursorless/common";
import * as cp from "child_process";

const extraExtensions = ["pokey.command-server", "pokey.talon"];

async function main() {
  try {
    const args = [
      "--profile=cursorlessDevelopment",
      ...[...extensionDependencies, ...extraExtensions].flatMap(
        (dependency) => ["--install-extension", dependency],
      ),
    ];

    // Install extension dependencies
    const process = cp.spawn("code", args, { stdio: "inherit", shell: true });

    await new Promise<void>((resolve, reject) => {
      process.on("error", reject);
      process.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process returned code ${code}`));
        }
      });
    });
  } catch (err) {
    console.error("Failed to init launch sandbox");
    console.error(err);
    process.exit(1);
  }
}

main();
