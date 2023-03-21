import * as vscode from "vscode";
import { ExtensionContext } from "vscode";
import { FlashStyle, partition } from "@cursorless/common";
import {
  CharacterRange,
  GeneralizedRange,
  isLineRange,
  LineRange,
} from "@cursorless/common";
import { VscodeHighlightDecorationTypes } from "./VscodeHighlightDecorationTypes";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export enum HighlightStyle {
  highlight0 = "highlight0",
  highlight1 = "highlight1",
  /**
   * Used for calibrating timing when recording a video
   */
  timingCalibration = "timingCalibration",
}

export type VscodeStyle = FlashStyle | HighlightStyle;

const allStyles = Object.values<VscodeStyle>(FlashStyle).concat(
  Object.values(HighlightStyle),
);

/**
 * Manages highlights for VSCode.  This class is also used by
 * {@link VscodeFlashHandler} for rendering the decorations used for flashes, but this
 * class doesn't handle the timing of the flashes.
 */
export default class VscodeHighlights {
  private highlightDecorations: Record<
    VscodeStyle,
    VscodeHighlightDecorationTypes
  >;

  constructor(extensionContext: ExtensionContext) {
    this.highlightDecorations = Object.fromEntries(
      allStyles.map((style) => [
        style,
        new VscodeHighlightDecorationTypes(style),
      ]),
    ) as Record<VscodeStyle, VscodeHighlightDecorationTypes>;

    extensionContext.subscriptions.push(
      ...Object.values(this.highlightDecorations),
    );
  }

  async setHighlightRanges(
    style: VscodeStyle,
    editor: VscodeTextEditorImpl,
    ranges: GeneralizedRange[],
  ) {
    const [lineRanges, tokenRanges] = partition<LineRange, CharacterRange>(
      ranges,
      isLineRange,
    );

    const { tokenDecorationType, lineDecorationType } =
      this.highlightDecorations[style];

    editor.vscodeEditor.setDecorations(
      tokenDecorationType,
      tokenRanges.map(
        ({ start, end }) =>
          new vscode.Range(
            start.line,
            start.character,
            end.line,
            end.character,
          ),
      ),
    );

    editor.vscodeEditor.setDecorations(
      lineDecorationType,
      lineRanges.map((range) => new vscode.Range(range.start, 0, range.end, 0)),
    );
  }
}
