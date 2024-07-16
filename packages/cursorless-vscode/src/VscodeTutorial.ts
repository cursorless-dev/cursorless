import { FileSystem, TutorialId, TutorialState } from "@cursorless/common";
import { Tutorial } from "@cursorless/cursorless-engine";
import { getCursorlessRepoRoot } from "@cursorless/node-common";
import { SpyWebViewEvent, VscodeApi } from "@cursorless/vscode-common";
import path from "node:path";
import {
  CancellationToken,
  ExtensionContext,
  ExtensionMode,
  Uri,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
} from "vscode";
import { ScopeVisualizer } from "./ScopeVisualizerCommandApi";
import { SpyWebviewView } from "./SpyWebviewView";

const VSCODE_TUTORIAL_WEBVIEW_ID = "cursorless.tutorial";

export class VscodeTutorial implements WebviewViewProvider {
  private view?: WebviewView | SpyWebviewView;
  private localResourceRoot: Uri;

  constructor(
    private context: ExtensionContext,
    private vscodeApi: VscodeApi,
    private tutorial: Tutorial,
    scopeVisualizer: ScopeVisualizer,
    fileSystem: FileSystem,
  ) {
    this.onState = this.onState.bind(this);
    this.start = this.start.bind(this);
    this.docsOpened = this.docsOpened.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.restart = this.restart.bind(this);
    this.resume = this.resume.bind(this);
    this.list = this.list.bind(this);

    this.localResourceRoot =
      context.extensionMode === ExtensionMode.Development
        ? Uri.file(
            path.join(
              getCursorlessRepoRoot(),
              "packages",
              "cursorless-vscode-tutorial-webview",
              "out",
            ),
          )
        : Uri.joinPath(context.extensionUri, "media");

    context.subscriptions.push(
      vscodeApi.window.registerWebviewViewProvider(
        VSCODE_TUTORIAL_WEBVIEW_ID,
        this,
      ),
      tutorial.onState(this.onState),
      scopeVisualizer.onDidChangeScopeType((scopeType) => {
        this.tutorial.scopeTypeVisualized(scopeType);
      }),
    );

    if (context.extensionMode === ExtensionMode.Development) {
      context.subscriptions.push(
        fileSystem.watchDir(this.localResourceRoot.fsPath, () => {
          if (this.view != null) {
            this.view.webview.html = this.getHtmlForWebview();
          }
        }),
      );
    }
  }

  public resolveWebviewView(
    webviewView: WebviewView,
    _context: WebviewViewResolveContext,
    _token: CancellationToken,
  ) {
    if (this.view != null && this.view instanceof SpyWebviewView) {
      this.view.view = webviewView;
    } else {
      this.view =
        this.context.extensionMode === ExtensionMode.Test
          ? new SpyWebviewView(webviewView)
          : webviewView;
    }
    const { webview } = this.view;

    webview.options = {
      enableScripts: true,
      localResourceRoots: [this.localResourceRoot],
    };

    webview.html = this.getHtmlForWebview();

    webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "getInitialState":
          webview.postMessage(this.tutorial.state);
          break;
        case "start":
          this.start(data.tutorialId);
          break;
        case "list":
          this.list();
          break;
      }
    });
  }

  public getEventLog(): SpyWebViewEvent[] {
    if (this.view instanceof SpyWebviewView) {
      return this.view.getEventLog();
    }

    return [];
  }

  public async start(id: TutorialId | number) {
    await this.tutorial.start(id);
    this.revealTutorial();
  }

  docsOpened() {
    this.tutorial.docsOpened();
    this.revealTutorial();
  }

  async next() {
    await this.tutorial.next();
    this.revealTutorial();
  }

  async previous() {
    await this.tutorial.previous();
    this.revealTutorial();
  }

  async restart() {
    await this.tutorial.restart();
    this.revealTutorial();
  }

  async resume() {
    await this.tutorial.resume();
    this.revealTutorial();
  }

  async list() {
    await this.tutorial.list();
    this.revealTutorial();
  }

  private onState(state: TutorialState) {
    this.view?.webview.postMessage(state);
  }

  private revealTutorial() {
    if (this.view != null) {
      this.view.show(true);
    } else {
      this.vscodeApi.commands.executeCommand("cursorless.tutorial.focus");
    }
  }

  private getHtmlForWebview() {
    const { webview } = this.view!;

    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      Uri.joinPath(
        this.localResourceRoot,
        this.context.extensionMode === ExtensionMode.Development
          ? "index.js"
          : "tutorialWebview.js",
      ),
    );

    // Do the same for the stylesheet.
    const styleMainUri = webview.asWebviewUri(
      Uri.joinPath(
        this.localResourceRoot,
        this.context.extensionMode === ExtensionMode.Development
          ? "index.css"
          : "tutorialWebview.css",
      ),
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleMainUri}" rel="stylesheet">

				<title>Cursorless tutorial</title>
			</head>
			<body>
        <div id="root"></div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
