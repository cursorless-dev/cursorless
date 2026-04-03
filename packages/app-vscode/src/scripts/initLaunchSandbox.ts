import * as cp from "node:child_process";
/**
 * This script creates a VSCode settings profile for Cursorless development,
 * allowing you to have a separate set of extensions and settings for use when
 * developing the Cursorless VSCode extension locally.
 */
import { extensionDependencies } from "@cursorless/lib-common";

const vsCodeToolName: string = "code";
const validCliToolParams = new Set(["--code", "--codium"]);

async function main() {
  try {
    // Read cli tool name from arguments, assume tool name is 'code' if not present
    let cliToolName = vsCodeToolName;

    process.argv.forEach((argument) => {
      if (validCliToolParams.has(argument)) {
        cliToolName = argument.replace("--", "");
        console.log(`Cli tool name manually set to ${cliToolName}`);
      }
    });

    const extensions = [
      ...extensionDependencies,
      "pokey.command-server",
      "mrob95.vscode-talonscript",
    ];

    // Do not attempt to install jrieken:vscode-tree-sitter-query if editor is NOT VSCode, assuming lack of access to VSCode Marketplace
    if (cliToolName === vsCodeToolName) {
      extensions.push("jrieken.vscode-tree-sitter-query");
    } else {
      console.log(
        "Not installing jrieken:vscode-tree-sitter-query as it is not on the OpenVSX Marketplace.",
      );
      console.log(
        "You should install this extension manually. Check the Cursorless contributor documentation for more info.",
      );
    }

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
  } catch (error) {
    console.error("Failed to init launch sandbox");
    console.error(error);
    process.exit(1);
  }
}

await main();
