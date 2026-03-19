import { isWindows } from "@cursorless/node-common";
import { COMMAND_SERVER_EXTENSION_ID } from "@cursorless/vscode-common";
import { globSync } from "glob";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as vscode from "vscode";

const STATE_KEY = "dontShowInstallationDependencies";

export class InstallationDependencies {
  private panel: vscode.WebviewPanel | undefined;

  constructor(private extensionContext: vscode.ExtensionContext) {
    this.show = this.show.bind(this);
    this.maybeShow = this.maybeShow.bind(this);
  }

  /**
   * Shows the installation dependencies webview.
   */
  show() {
    this.createWebview();
  }

  /**
   * Shows the installation dependencies webview if there are missing dependencies.
   */
  maybeShow() {
    const state = this.getState();
    if (state.hasMissingDependencies && !state.dontShow) {
      this.createWebview();
    }
  }

  private getState() {
    const dependencies = getDependencies();
    const hasMissingDependencies = Object.values(dependencies).some(
      (value) => !value,
    );
    return {
      dontShow: !!this.extensionContext.globalState.get<boolean>(STATE_KEY),
      hasMissingDependencies,
      dependencies,
    };
  }

  private createWebview() {
    if (this.panel != null) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "cursorless.installationDependencies",
      "Cursorless dependencies",
      {
        viewColumn: vscode.ViewColumn.Active,
      },
      {
        enableScripts: true,
      },
    );

    this.panel.webview.html = this.getWebviewContent();

    const updateWebview = () => {
      this.panel?.webview.postMessage(this.getState());
    };

    this.panel.onDidChangeViewState(updateWebview);

    this.panel.webview.onDidReceiveMessage((message) => {
      if (message.type === "dontShow") {
        const checked = message.checked;
        this.extensionContext.globalState.update(STATE_KEY, checked);
      } else {
        console.error(`Unknown message: ${message}`);
      }
    });

    const interval = setInterval(updateWebview, 5000);

    this.panel.onDidDispose(() => {
      clearInterval(interval);
      this.panel = undefined;
    });

    this.panel.webview.postMessage(this.getState());
  }

  private getWebviewContent() {
    if (this.panel == null) {
      throw new Error("Panel not created yet");
    }
    const htmlPath = this.getResourceUri("installationDependencies.html");
    const jsUri = this.getResourceUri("installationDependencies.js");
    const template = fs
      .readFileSync(htmlPath.fsPath, "utf8")
      .replace("META_CONTENT", `script-src ${this.panel.webview.cspSource};`)
      .replace("SCRIPT_SOURCE", jsUri.toString());
    return template;
  }

  private getResourceUri(name: string): vscode.Uri {
    if (this.panel == null) {
      throw new Error("Panel not created yet");
    }
    return this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionContext.extensionUri,
        "resources",
        name,
      ),
    );
  }
}

function getDependencies(): Record<string, boolean> {
  return {
    talon: talonHomeExists(),
    cursorlessTalon: cursorlessTalonExists(),
    commandServer: commandServerInstalled(),
  };
}

function talonHomeExists() {
  return fs.existsSync(getTalonHomePath());
}

function cursorlessTalonExists() {
  const talonUserPath = path.join(getTalonHomePath(), "user");
  const files = globSync("**/*/src/cursorless.talon", {
    cwd: talonUserPath,
    maxDepth: 3,
  });
  return files.length > 0;
}

function commandServerInstalled() {
  const extension = vscode.extensions.getExtension(COMMAND_SERVER_EXTENSION_ID);
  return extension != null;
}

function getTalonHomePath() {
  return isWindows()
    ? `${os.homedir()}\\AppData\\Roaming\\talon`
    : `${os.homedir()}/.talon`;
}
