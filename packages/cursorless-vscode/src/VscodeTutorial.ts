import { TutorialId, TutorialMessage } from "@cursorless/common";
import { Tutorial } from "@cursorless/cursorless-engine";
import { VscodeApi } from "@cursorless/vscode-common";
import {
  CancellationToken,
  ExtensionContext,
  SnippetString,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window,
} from "vscode";

const VSCODE_TUTORIAL_WEBVIEW_ID = "cursorless.tutorial";

export class VscodeTutorial implements WebviewViewProvider {
  constructor(
    private context: ExtensionContext,
    vscodeApi: VscodeApi,
    tutorial: Tutorial,
  ) {
    context.subscriptions.push(
      vscodeApi.window.registerWebviewViewProvider(
        VSCODE_TUTORIAL_WEBVIEW_ID,
        this,
      ),
    );
  }

  private _view?: WebviewView;

  public resolveWebviewView(
    webviewView: WebviewView,
    _context: WebviewViewResolveContext,
    _token: CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "colorSelected": {
          window.activeTextEditor?.insertSnippet(
            new SnippetString(`#${data.value}`),
          );
          break;
        }
      }
    });
  }

  public startTutorial(tutorialId: TutorialId) {
    if (this._view) {
      this._view.show(true);
      const message: TutorialMessage = {
        type: "startTutorial",
        tutorialId,
      };
      this._view.webview.postMessage(message);
    }
  }

  private _getHtmlForWebview(webview: Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, "media", "tutorialWebview.js"),
    );

    // Do the same for the stylesheet.
    const styleMainUri = webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, "media", "tutorialWebview.css"),
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
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleMainUri}" rel="stylesheet">

				<title>Cat Colors</title>
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
