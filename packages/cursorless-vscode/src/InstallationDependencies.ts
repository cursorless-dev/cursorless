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
    if (!this.dontShow() && stateHasMissingDependencies()) {
      this.createWebview();
    }
  }

  private dontShow() {
    return this.extensionContext.globalState.get<boolean>(STATE_KEY) ?? false;
  }

  private createWebview() {
    if (this.panel != null) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "cursorless.dependencies",
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
        "installation.js",
      ),
    );

    this.panel.webview.html = getWebviewContent(this.panel.webview, jsUri);

    const updateWebview = () => {
      this.panel?.webview.postMessage(getState());
    };

    this.panel.onDidChangeViewState(updateWebview);

    const interval = setInterval(updateWebview, 5000);

    this.panel.onDidDispose(() => {
      clearInterval(interval);
      this.panel = undefined;
    });

    this.panel.webview.postMessage(getState());
  }
}

function stateHasMissingDependencies() {
  return Object.values(getState()).some((value) => !value);
}

function getState() {
  return {
    talon: false,
    cursorlessTalon: false,
    commandServer: false,
  };
  //   return {
  //     talon: talonHomeExists(),
  //     cursorlessTalon: cursorlessTalonExists(),
  //     commandServer: commandServerInstalled(),
  //   };
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
