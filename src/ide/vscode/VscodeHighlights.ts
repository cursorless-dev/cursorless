import * as vscode from "vscode";
import { ExtensionContext } from "vscode";
import { FlashStyle } from "../../libs/common/ide/types/FlashDescriptor";
import {
  CharacterRange,
  EditorGeneralizedRange,
  isLineRange,
  LineRange,
} from "../../libs/common/types/GeneralizedRange";
import { groupBy, partition } from "../../util/itertools";
import { VscodeHighlightDecorationTypes } from "./VscodeHighlightDecorationTypes";
import type VscodeIDE from "./VscodeIDE";

export enum HighlightStyle {
  highlight0 = "highlight0",
  highlight1 = "highlight1",
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

  constructor(private ide: VscodeIDE, extensionContext: ExtensionContext) {
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
    ranges: EditorGeneralizedRange[],
  ): Promise<void> {
    const editorRangeMap = groupBy(ranges, ({ editor }) => editor.id);

    this.ide.visibleTextEditors.forEach((editor) => {
      const [lineRanges, tokenRanges] = partition<LineRange, CharacterRange>(
        (editorRangeMap.get(editor.id) ?? []).map(({ range }) => range),
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
        lineRanges.map(
          (range) => new vscode.Range(range.start, 0, range.end, 0),
        ),
      );
    });
  }
}
