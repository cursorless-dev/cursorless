import {
  BORDER_WIDTH,
  CompositeKeyDefaultMap,
  getBorderColor,
  getBorderRadius,
  getBorderStyle,
  type DecorationStyle,
} from "@cursorless/common";
import { toVscodeRange } from "@cursorless/vscode-common";
import type { DecorationRenderOptions, TextEditorDecorationType } from "vscode";
import { DecorationRangeBehavior } from "vscode";
import { vscodeApi } from "../../../../vscodeApi";
import type { VscodeTextEditorImpl } from "../../VscodeTextEditorImpl";
import type { RangeTypeColors } from "../RangeTypeColors";
import type {
  DifferentiatedStyle,
  DifferentiatedStyledRangeList,
} from "./decorationStyle.types";
import { getDifferentiatedStyleMapKey } from "./getDifferentiatedStyleMapKey";

/**
 * Handles the actual rendering of decorations for
 * {@link VscodeFancyRangeHighlighter}.
 */
export class VscodeFancyRangeHighlighterRenderer {
  private decorationTypes: CompositeKeyDefaultMap<
    DifferentiatedStyle,
    TextEditorDecorationType
  >;

  constructor(colors: RangeTypeColors) {
    this.decorationTypes = new CompositeKeyDefaultMap(
      ({ style }) => getDecorationStyle(colors, style),
      getDifferentiatedStyleMapKey,
    );
  }

  /**
   * Renders the given ranges in the given editor.
   *
   * @param editor The editor to render the decorations in.
   * @param decoratedRanges A list with one element per differentiated style,
   * each of which contains a list of ranges to render for that style. We render
   * the ranges in order of increasing differentiation index.
   * {@link VscodeFancyRangeHighlighter} uses this to ensure that nested ranges
   * are rendered after their parents.  Otherwise they partially interleave,
   * which looks bad.
   */
  setRanges(
    editor: VscodeTextEditorImpl,
    decoratedRanges: DifferentiatedStyledRangeList[],
  ): void {
    /**
     * Keep track of which styles have no ranges, so that we can set their
     * range list to `[]`
     */
    const untouchedDecorationTypes = new Set(this.decorationTypes.values());

    decoratedRanges.sort(
      (a, b) =>
        a.differentiatedStyle.differentiationIndex -
        b.differentiatedStyle.differentiationIndex,
    );

    decoratedRanges.forEach(
      ({ differentiatedStyle: styleParameters, ranges }) => {
        const decorationType = this.decorationTypes.get(styleParameters);

        vscodeApi.editor.setDecorations(
          editor.vscodeEditor,
          decorationType,
          ranges.map(toVscodeRange),
        );

        untouchedDecorationTypes.delete(decorationType);
      },
    );

    untouchedDecorationTypes.forEach((decorationType) => {
      editor.vscodeEditor.setDecorations(decorationType, []);
    });
  }

  dispose() {
    Array.from(this.decorationTypes.values()).forEach((decorationType) => {
      decorationType.dispose();
    });
  }
}

function getDecorationStyle(
  colors: RangeTypeColors,
  borders: DecorationStyle,
): TextEditorDecorationType {
  const options: DecorationRenderOptions = {
    light: {
      backgroundColor: colors.background.light,
      borderColor: getBorderColor(
        colors.borderSolid.light,
        colors.borderPorous.light,
        borders,
      ),
    },
    dark: {
      backgroundColor: colors.background.dark,
      borderColor: getBorderColor(
        colors.borderSolid.dark,
        colors.borderPorous.dark,
        borders,
      ),
    },
    borderStyle: getBorderStyle(borders),
    borderWidth: BORDER_WIDTH,
    borderRadius: getBorderRadius(borders),
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    isWholeLine: borders.isWholeLine,
  };

  return vscodeApi.window.createTextEditorDecorationType(options);
}
