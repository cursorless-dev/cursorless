import * as vscode from "vscode";

export default class FontSize {
  fontSize!: number;
  fontWidth!: number;
  fontHeight!: number;

  constructor(private context: vscode.ExtensionContext) {}

  clearCache() {
    this.context.globalState.update("fontRatios", undefined);
  }

  async calculate() {
    const fontFamily = getFontFamily();
    let widthRatio, heightRatio;
    let fontRatiosCache =
      this.context.globalState.get<{
        widthRatio: number;
        heightRatio: number;
        fontFamily: string;
      }>("fontRatios");

    if (fontRatiosCache == null || fontRatiosCache.fontFamily !== fontFamily) {
      const fontRatios = await getFontRatios();
      this.context.globalState.update("fontRatios", {
        ...fontRatios,
        fontFamily,
      });
      widthRatio = fontRatios.widthRatio;
      heightRatio = fontRatios.heightRatio;
    } else {
      widthRatio = fontRatiosCache.widthRatio;
      heightRatio = fontRatiosCache.heightRatio;
    }

    this.fontSize = getFontSize();
    this.fontWidth = this.fontSize * widthRatio;
    this.fontHeight = this.fontSize * heightRatio;
  }
}

function getFontRatios() {
  const panel = vscode.window.createWebviewPanel(
    "cursorless.loading",
    "Cursorless",
    {
      preserveFocus: true,
      viewColumn: vscode.ViewColumn.Active,
    },
    {
      enableScripts: true,
    }
  );

  panel.webview.html = getWebviewContent();

  return new Promise<{ widthRatio: number; heightRatio: number }>((resolve) => {
    panel.webview.onDidReceiveMessage((message) => {
      panel.dispose();
      resolve(message);
    });
  });
}

function getFontSize(): number {
  const config = vscode.workspace.getConfiguration("editor");
  return config.get("fontSize") || 0;
}

function getFontFamily() {
  const config = vscode.workspace.getConfiguration("editor");
  return config.get<string>("fontFamily");
}

function getWebviewContent() {
  return `<!DOCTYPE html>
  <html lang="en">
  <body>
      <h1>Loading Cursorless</h1>
      <div id="container">
      <span id="letter" style="line-height: 0; visibility:hidden; font-size: 1000px; font-family: var(--vscode-editor-font-family);  font-weight: var(--vscode-editor-font-weight);">A</span>
      </div>
      <script>
        const letter    = document.querySelector('#letter');
        const container  = document.querySelector('#container');
        const baselineHeight = letter.offsetTop + letter.offsetHeight - container.offsetHeight - container.offsetTop;
        const vscode    = acquireVsCodeApi();
        vscode.postMessage({
          widthRatio: letter.offsetWidth / 1000,
          heightRatio: (letter.offsetHeight - baselineHeight) / 1000
        });
      </script>
  </body>
  </html>`;
}
