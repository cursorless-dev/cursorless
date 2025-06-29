/**
 * A clone of initLaunchSandbox.ts for VSCodium setup (as the command codium is used instead of code)
 */
import { extensionDependencies } from "@cursorless/common";
import * as cp from "child_process";
import * as path from "node:path"

const extraExtensions = ["pokey.command-server"];

async function main() {
  try {
    
    const args = [
      "--profile=cursorlessDevelopment",
      ...[...extensionDependencies, ...extraExtensions].flatMap(
        (dependency) => ["--install-extension", dependency],
      ),
    ];

    // remove attempt to get vscode-tree-sitter-query from OpenVSX marketplace
    var index: number = args.findIndex((value) => value.includes("vscode-tree-sitter-query"))
    args.splice(index, 1)

    // add vscode-tree-sitter-query via .vsix file
    const location : string = path.join("..", "..", "data", "vsix", "jrieken.vscode-tree-sitter-query-0.0.6.vsix")
    args.push("--profile=cursorlessDevelopment --install-extension ".concat(location))

    if (process.argv.includes("--force")) {
      args.push("--force");
    }

    // Install extension dependencies
    const subprocess = cp.spawn("codium", args, {
      stdio: "inherit",
      shell: true,
    });

    await new Promise<void>((resolve, reject) => {
      subprocess.on("error", reject);
      subprocess.on("exit", (codium) => {
        if (codium === 0) {
          resolve();
        } else {
          reject(new Error(`Process returned code ${codium}`));
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
