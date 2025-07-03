/**
 * This script creates a VSCode settings profile for Cursorless development,
 * allowing you to have a separate set of extensions and settings for use when
 * developing the Cursorless VSCode extension locally.
 */
import { extensionDependencies } from "@cursorless/common";
import * as cp from "child_process";

const extraExtensions = ["pokey.command-server"];
const vsCodeToolName = "code";
const vsCodiumToolName = "codium";

async function main() {

  // CLI tool name check

  var cliToolName: string = vsCodeToolName;
  var foundTool: boolean = false;
  
  console.log("Checking avalible VSC cli tool...");

  while (!foundTool) {
    try {
      const checkToolSubprocess = cp.spawn(cliToolName, ["-v"], {
      stdio: "inherit",
      shell: true,
    });

    await new Promise<void>((resolve, reject) => {
      checkToolSubprocess.on("error", reject);
      checkToolSubprocess.on("exit", (code) => {
        if (code === 0) {
          foundTool = true;
          resolve();
        } else {
          reject(new Error(`Process returned code ${code}`));
        }
      });
    });

    } catch(error) {
      if (cliToolName === vsCodeToolName) {
        cliToolName = vsCodiumToolName;
      } else if (cliToolName === vsCodiumToolName) {
        console.error("No VSC command line interface found!");
        process.exit(2);
      }
    }
  }
  console.log("Found '%s' cli tool!", vsCodeToolName)
  try {
    const args = [
      "--profile=cursorlessDevelopment",
      ...[...extensionDependencies, ...extraExtensions].flatMap(
        (dependency) => ["--install-extension", dependency],
      ),
    ];

    if (process.argv.includes("--force")) {
      args.push("--force");
    }

    // Do not attempt to install jrieken:vscode-tree-sitter-query if editor is VSCodium
    if (cliToolName === vsCodiumToolName) {
      const index: number = args.findIndex((value) => value.includes("vscode-tree-sitter-query"))
      args.splice(index, 1)
      console.log("Not installing jrieken:vscode-tree-sitter-query as it is not on the OpenVSX Marketplace.")
      console.log("You should install this extension manually. Check the Cursorless contributor documentation for more info.")
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
