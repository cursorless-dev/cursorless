/**
 * This script creates a VSCode settings profile for Cursorless development,
 * allowing you to have a separate set of extensions and settings for use when
 * developing the Cursorless VSCode extension locally.
 */
import { extensionDependencies } from "@cursorless/common";
import * as cp from "child_process";

const vsCodeToolName: string = "code";
const validCliToolParams: Array<string> = ["--code", "--codium"];

async function main() {
  try {
    // Read cli tool name from arguments, assume tool name is 'code' if not present
    let cliToolName = vsCodeToolName;

    process.argv.forEach((argument) => {
      if (validCliToolParams.includes(argument)) {
        cliToolName = argument.replace("--", "");
        console.log("Cli tool name manually set to " + cliToolName);
      }
    });

    const extensions = [...extensionDependencies, "pokey.command-server"];

    const args = [
      "--profile=cursorlessDevelopment",
      ...extensions.flatMap((e) => ["--install-extension", e]),
    ];

    if (process.argv.includes("--force")) {
      args.push("--force");
    }

    // Install extension dependencies
    const subprocess = cp.spawn(cliToolName, args, {
      stdio: "inherit",
      shell: true,
    });

    await new Promise<void>((resolve, reject) => {
      subprocess.on("error", reject);
      subprocess.on("exit", (code) => {
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

void main();
