import * as vscode from "vscode";
import { FontMeasurements } from "./FontMeasurements";

/**
 * Contains measurements for the user's font
 */
export class FontMeasurementsImpl implements FontMeasurements {
  fontSize!: number;

  /**
   * The width of a character in the user's chosen font and font size.
   */
  characterWidth!: number;

  /**
   * The height of a character in the user's chosen font and font size. The
   * height is measured from the baseline to the top of a letter
   */
  characterHeight!: number;

  constructor(private extensionContext: vscode.ExtensionContext) {}

  clearCache() {
    this.extensionContext.globalState.update("fontRatios", undefined);
  }

  async calculate() {
    const fontFamily = getFontFamily();
    let widthRatio, heightRatio;
    const fontRatiosCache = this.extensionContext.globalState.get<{
      widthRatio: number;
      heightRatio: number;
      fontFamily: string;
    }>("fontRatios");

    if (fontRatiosCache == null || fontRatiosCache.fontFamily !== fontFamily) {
      const fontRatios = await getFontRatios(this.extensionContext);
      this.extensionContext.globalState.update("fontRatios", {
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
    this.characterWidth = this.fontSize * widthRatio;
    this.characterHeight = this.fontSize * heightRatio;
  }
}

/**
 * Rapidly shows a webview in order to measure the width and height of a character in the users font
 *
 * @returns The width and height ratios of the font
 */
function getFontRatios(extensionContext: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "cursorless.loading",
    "Cursorless",
    {
      preserveFocus: true,
      viewColumn: vscode.ViewColumn.Active,
    },
    {
      enableScripts: true,
    },
  );

  const font_measurement_js = panel.webview.asWebviewUri(vscode.Uri.joinPath(
      extensionContext.extensionUri, 'resources', 'font_measurements.js'));
  panel.webview.html = getWebviewContent(panel.webview, font_measurement_js);

  interface FontRatios {
    /**
     * The ratio of the width of a character in the given font to the font size
     */
    widthRatio: number;

    /**
     * The ratio of the height of a character in the given font to the font
     * size. The height is measured from the baseline to the top of the span
     */
    heightRatio: number;
  }

  return new Promise<FontRatios>((resolve) => {
    panel.webview.onDidReceiveMessage((message) => {
      panel.dispose();
      resolve(message);
    });
  });
}

function getFontSize() {
  const config = vscode.workspace.getConfiguration("editor");
  return config.get<number>("fontSize")!;
}

function getFontFamily() {
  const config = vscode.workspace.getConfiguration("editor");
  return config.get<string>("fontFamily")!;
}

function getWebviewContent(
    webview: vscode.Webview, font_measurement_js: vscode.Uri) {
  // baseline adjustment based on https://stackoverflow.com/a/27295528
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta http-equiv="Content-Security-Policy" content="script-src ${webview.cspSource};" />
  </head>

  <body>
      <h1>Loading Cursorless...</h1>
      <div id="container">
      <span id="letter" style="line-height: 0; visibility:hidden; font-size: 1000px; font-family: var(--vscode-editor-font-family);  font-weight: var(--vscode-editor-font-weight);">A</span>
      </div>
      <script src="${font_measurement_js}"></script>
  </body>
  </html>`;
}
