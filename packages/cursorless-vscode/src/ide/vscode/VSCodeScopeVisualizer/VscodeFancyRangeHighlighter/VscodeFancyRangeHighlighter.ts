import { GeneralizedRange, Range } from "@cursorless/common";
import { flatmap } from "itertools";
import { VscodeTextEditorImpl } from "../../VscodeTextEditorImpl";
import { RangeTypeColors } from "../RangeTypeColors";
import { VscodeFancyRangeHighlighterRenderer } from "./VscodeFancyRangeHighlighterRenderer";
import { generateDecorationsForCharacterRange } from "./generateDecorationsForCharacterRange";
import { generateDecorationsForLineRange } from "./generateDecorationsForLineRange";
import { generateDifferentiatedRanges } from "./generateDifferentiatedRanges";
import { DecorationStyle } from "./getDecorationRanges.types";
import { groupDifferentiatedRanges } from "./groupDifferentiatedRanges";

/**
 * Manages VSCode decoration types for a highlight or flash style.
 */
export class VscodeFancyRangeHighlighter {
  private decorator: VscodeFancyRangeHighlighterRenderer;

  constructor(colors: RangeTypeColors) {
    this.decorator = new VscodeFancyRangeHighlighterRenderer(colors);
  }

  setRanges(editor: VscodeTextEditorImpl, ranges: GeneralizedRange[]) {
    const decoratedRanges = flatmap(
      generateDifferentiatedRanges(ranges),
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
            style,
            differentiationIndex,
          };
        }
      },
    );

    this.decorator.setDecorations(
      editor,
      groupDifferentiatedRanges(decoratedRanges, getBorderKey),
    );
  }

  dispose() {
    this.decorator.dispose();
  }
}

function getBorderKey({
  top,
  right,
  left,
  bottom,
  isWholeLine,
}: DecorationStyle) {
  return [top, right, left, bottom, isWholeLine ?? false];
}
