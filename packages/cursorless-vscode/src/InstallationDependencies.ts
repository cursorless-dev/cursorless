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
    if (!state.dontShow && hasMissingDependencies(state.dependencies)) {
      this.createWebview();
    }
  }

  private getState() {
    return {
      dontShow: !!this.extensionContext.globalState.get<boolean>(STATE_KEY),
      dependencies: getDependencies(),
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

    const jsUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionContext.extensionUri,
        "resources",
        "installationDependencies.js",
      ),
    );

    this.panel.webview.html = getWebviewContent(this.panel.webview, jsUri);

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
}

function getDependencies(): Record<string, boolean> {
  return {
    talon: talonHomeExists(),
    cursorlessTalon: cursorlessTalonExists(),
    commandServer: commandServerInstalled(),
  };
}

function hasMissingDependencies(dependencies: Record<string, boolean>) {
  return Object.values(dependencies).some((value) => !value);
}

function talonHomeExists() {
  return fs.existsSync(getTalonHomePath());
}

function cursorlessTalonExists() {
  const talonUserPath = path.join(getTalonHomePath(), "user");
  const files = globSync("*/src/cursorless.talon", { cwd: talonUserPath });
  return files.length > 0;
}

function commandServerInstalled() {
  const extension = vscode.extensions.getExtension(COMMAND_SERVER_EXTENSION_ID);
  return extension != null;
}

function getTalonHomePath() {
  return os.platform() === "win32"
    ? `${os.homedir()}\\AppData\\Roaming\\talon`
    : `${os.homedir()}/.talon`;
}

function getWebviewContent(webview: vscode.Webview, jsUri: vscode.Uri) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Security-Policy" content="script-src ${webview.cspSource};" />
</head>

<body>
    <div id="root"></div>
    <script src="${jsUri}"></script>
</body>
</html>`;
}
