import { GeneralizedRange, Range } from "@cursorless/common";
import { flatmap } from "itertools";
import { Vscode } from "@cursorless/vscode-common";
import { VscodeTextEditorImpl } from "../../VscodeTextEditorImpl";
import { RangeTypeColors } from "../RangeTypeColors";
import { VscodeFancyRangeHighlighterRenderer } from "./VscodeFancyRangeHighlighterRenderer";
import { generateDecorationsForCharacterRange } from "./generateDecorationsForCharacterRange";
import { generateDecorationsForLineRange } from "./generateDecorationsForLineRange";
import { generateDifferentiatedRanges } from "./generateDifferentiatedRanges";
import { DifferentiatedStyledRange } from "./getDecorationRanges.types";
import { groupDifferentiatedStyledRanges } from "./groupDifferentiatedStyledRanges";

/**
 * A class for highlighting ranges in a VSCode editor, which does the following:
 *
 * - Uses a combination of solid lines and dotted lines to make it easier to
 *   visualize multi-line ranges, while still making directly adjacent ranges
 *   visually distinct.
 * - Works around a bug in VSCode where decorations that are touching get merged
 *   together.
 * - Ensures that nested ranges are rendered after their parents, so that they
 *   look properly nested.
 */
export class VscodeFancyRangeHighlighter {
  private renderer: VscodeFancyRangeHighlighterRenderer;

  constructor(vscode: Vscode, colors: RangeTypeColors) {
    this.renderer = new VscodeFancyRangeHighlighterRenderer(vscode, colors);
  }

  setRanges(editor: VscodeTextEditorImpl, ranges: GeneralizedRange[]) {
    const decoratedRanges: Iterable<DifferentiatedStyledRange> = flatmap(
      // We first generate a list of differentiated ranges, which are ranges
      // where any ranges that are touching have different differentiation
      // indices.  This is used to ensure that ranges that are touching are
      // rendered with different TextEditorDecorationTypes, so that they don't
      // get merged together by VSCode.
      generateDifferentiatedRanges(ranges),

      // Then, we generate the actual decorations for each differentiated range.
      // A single range will be split into multiple decorations if it spans
      // multiple lines, so that we can eg use dashed lines to end lines that
      // are part of the same range.
      function* ({ range, differentiationIndex }) {
        const iterable =
          range.type === "line"
            ? generateDecorationsForLineRange(range.start, range.end)
            : generateDecorationsForCharacterRange(
                editor,
                new Range(range.start, range.end),
              );

        for (const { range, style } of iterable) {
          yield {
            range,
            differentiatedStyle: { style, differentiationIndex },
          };
        }
      },
    );

    this.renderer.setRanges(
      editor,
      // Group the decorations so that we have a list of ranges for each
      // differentiated style
      groupDifferentiatedStyledRanges(decoratedRanges),
    );
  }

  dispose() {
    this.renderer.dispose();
  }
}
