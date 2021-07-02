import * as vscode from "vscode";

export interface FontSize {
  fontSize: number;
  fontWidth: number;
  fontHeight: number;
}

export default async function (): Promise<FontSize> {
  const fontRatios = await getFontRatios();
  const fontSize = getFontSize();
  return {
    fontSize,
    fontWidth: fontSize * fontRatios[0],
    fontHeight: fontSize * fontRatios[1],
  };
}

function getFontRatios(): Promise<[number, number]> {
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

  return new Promise<[number, number]>((resolve) => {
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

function getWebviewContent() {
  return `<!DOCTYPE html>
  <html lang="en">
  <body>
      <h1>Loading Cursorless</h1>
      <span id="wrapper" style="visibility:hidden; font-size: 1000px; font-family: var(--vscode-editor-font-family);  font-weight: var(--vscode-editor-font-weight);">A</span>
      <script>
        const wrapper = document.getElementById("wrapper");
        const vscode = acquireVsCodeApi();
        vscode.postMessage([
          wrapper.offsetWidth / 1000,
          wrapper.offsetHeight / 1000
        ]);
      </script>
  </body>
  </html>`;
}
