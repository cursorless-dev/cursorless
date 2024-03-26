import { TutorialId, TutorialState } from "@cursorless/common";
import {
  Tutorial,
  TutorialGetContentResponse,
} from "@cursorless/cursorless-engine";
import { VscodeApi } from "@cursorless/vscode-common";
import {
  CancellationToken,
  ExtensionContext,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  commands,
} from "vscode";

const VSCODE_TUTORIAL_WEBVIEW_ID = "cursorless.tutorial";

export class VscodeTutorial implements WebviewViewProvider {
  private state: TutorialState = { type: "pickingTutorial" };
  private currentTutorial?: TutorialGetContentResponse;
  private view?: WebviewView;

  constructor(
    private context: ExtensionContext,
    vscodeApi: VscodeApi,
    private tutorial: Tutorial,
  ) {
    context.subscriptions.push(
      vscodeApi.window.registerWebviewViewProvider(
        VSCODE_TUTORIAL_WEBVIEW_ID,
        this,
      ),
    );
    this.start = this.start.bind(this);
  }

  public resolveWebviewView(
    webviewView: WebviewView,
    _context: WebviewViewResolveContext,
    _token: CancellationToken,
  ) {
    this.view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "getInitialState":
          this.view!.webview.postMessage(this.state);
          break;
      }
    });
  }

  public async start(tutorialId: TutorialId) {
    this.currentTutorial = await this.tutorial.getContent(tutorialId);

    this.setState({
      type: "doingTutorial",
      tutorialId,
      stepNumber: 0,
      stepContent: this.currentTutorial.steps[0].content,
      stepCount: this.currentTutorial.steps.length,
    });

    if (this.view != null) {
      this.view.show(true);
    } else {
      await commands.executeCommand("cursorless.tutorial.focus");
    }

    await this.tutorial.setupStep({
      version: 0,
      fixturePath: this.currentTutorial.steps[0].fixturePath!,
      tutorialName: tutorialId,
    });
  }

  private setState(state: TutorialState) {
    this.state = state;

    if (this.view != null) {
      this.view.webview.postMessage(state);
    }
  }

  private getHtmlForWebview(webview: Webview) {
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
