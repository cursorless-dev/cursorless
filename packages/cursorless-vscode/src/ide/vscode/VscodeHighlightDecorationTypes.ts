import {
  DecorationRangeBehavior,
  DecorationRenderOptions,
  TextEditorDecorationType,
  ThemeColor,
  window,
} from "vscode";
import type { VscodeStyle } from "./VscodeHighlights";

/**
 * Manages VSCode decoration types for a highlight or flash style.
 */
export class VscodeHighlightDecorationTypes {
  readonly tokenDecorationType: TextEditorDecorationType;
  readonly lineDecorationType: TextEditorDecorationType;

  constructor(style: VscodeStyle) {
    const options: DecorationRenderOptions = {
      backgroundColor: new ThemeColor(`cursorless.${style}Background`),
      rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    };

    this.tokenDecorationType = window.createTextEditorDecorationType(options);
    this.lineDecorationType = window.createTextEditorDecorationType({
      ...options,
      isWholeLine: true,
    });
  }

  dispose() {
    this.tokenDecorationType.dispose();
    this.lineDecorationType.dispose();
  }
}
